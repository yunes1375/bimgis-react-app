const {
  SiteHeader, Footer, Tabs, Card, Pill, KpiTile, DataTable, StackedCardTable,
  FilterSearch, Input, Button, Toggle, EmptyState, Toast, ToastStack, Spinner,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

function _useIsMobile(bp = 720) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const on = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

async function _api(path, opts) {
  const headers = opts && opts.body && !(opts.body instanceof FormData)
    ? { 'Content-Type': 'application/json', ...((opts && opts.headers) || {}) }
    : (opts && opts.headers);
  const r = await fetch(path, { ...(opts || {}), headers });
  if (!r.ok) {
    let detail = '';
    try { const d = await r.json(); detail = d.detail || d.message || ''; } catch {}
    throw new Error(detail || `${r.status} ${r.statusText}`);
  }
  if (r.status === 204) return null;
  return r.json();
}

const _fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso.slice(0, 10); }
};

const _toneFor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'ready' || s === 'done' || s === 'aligned' || s === 'active') return 'ok';
  if (s === 'pending' || s === 'importing' || s === 'in_progress' || s === 'in progress' || s === 'on_leave') return 'warn';
  if (s === 'failed' || s === 'error'   || s === 'inactive') return 'error';
  return 'neutral';
};

function _fmtDist(m) {
  if (m == null) return '—';
  if (m < 1000) return Math.round(m) + ' m';
  return (m / 1000).toFixed(2) + ' km';
}
function _fmtDur(s) {
  if (s == null || !isFinite(s) || s < 0) return '—';
  if (s < 60) return Math.round(s) + 's';
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  if (m < 60) return `${m}m ${sec}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
function _fmtArrival(s) {
  // arrival_s = seconds from depot-leave (legacy convention)
  if (s == null) return '—';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m`;
}
function _teamColor(i) { return `hsl(${(i * 137.5) % 360}, 60%, 60%)`; }
const _PRIO_DOT = { urgent: '#e8a060', high: '#fec060', normal: '#6a9be8', low: '#7a8aa8' };

// ─── Leaflet helpers ─────────────────────────────────────────────────────
// Leaflet is loaded once in index.html (window.L). These two helpers wrap
// it for use from React effects — we still talk to Leaflet imperatively
// (clearLayers / setView etc.) so route/layer updates don't re-mount the
// map, which would flash a blank canvas every render.

function _useLeafletMap(divRef, opts) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!divRef.current || !window.L || ref.current) return;
    const L = window.L;
    const m = L.map(divRef.current, { zoomControl: true, attributionControl: true })
      .setView((opts && opts.center) || [35.7, 51.4], (opts && opts.zoom) || 11);
    // Carto Positron — light, neutral basemap. No API key required.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(m);
    ref.current = m;
    // Force a redraw once the container settles (especially when shown
    // inside a collapsed tab that just expanded).
    setTimeout(() => m.invalidateSize(), 50);
    return () => { m.remove(); ref.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

function RouteMap({ routes, height = 380 }) {
  const divRef = React.useRef(null);
  const mapRef = _useLeafletMap(divRef);
  const layerRef = React.useRef(null);
  React.useEffect(() => {
    const map = mapRef.current; if (!map || !window.L) return;
    const L = window.L;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    layerRef.current.clearLayers();
    const bounds = [];
    (routes || []).forEach((r, i) => {
      const colour = _teamColor(i);
      // Team home (depot)
      if (r.team_lat != null && r.team_lon != null) {
        const homeIcon = L.divIcon({
          className: 'rm-home-icon',
          html: `<div style="width:14px;height:14px;background:${colour};
                  border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.6)"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7],
        });
        L.marker([r.team_lat, r.team_lon], { icon: homeIcon, title: r.team_name || `Team ${i + 1}` })
          .addTo(layerRef.current).bindTooltip(`<b>${r.team_name || `Team ${i+1}`}</b><br>depot`, { direction: 'top' });
        bounds.push([r.team_lat, r.team_lon]);
      }
      // Stops + polyline
      const stops = (r.stops || []).filter(s => s.lat != null && s.lon != null);
      if (stops.length > 0 && r.team_lat != null && r.team_lon != null) {
        const path = [[r.team_lat, r.team_lon], ...stops.map(s => [s.lat, s.lon])];
        L.polyline(path, { color: colour, weight: 3, opacity: 0.85, lineCap: 'round', lineJoin: 'round' })
          .addTo(layerRef.current);
        path.forEach(p => bounds.push(p));
      }
      stops.forEach((s, k) => {
        const urg = s.priority === 'urgent', high = s.priority === 'high';
        const radius = urg ? 11 : (high ? 9 : 7);
        const wo = s.work_order_number || (s.work_order_id ? s.work_order_id.slice(0, 8) : '?');
        const stopIcon = L.divIcon({
          className: 'rm-stop-icon',
          html: `<div style="width:${radius*2}px;height:${radius*2}px;background:${colour};
                  border:${urg?3:high?2:1}px solid ${urg?'#f06868':high?'#e8a060':'white'};
                  border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.5);
                  color:#0c1320;font-weight:700;font-size:10px;
                  display:flex;align-items:center;justify-content:center;
                  font-family:var(--font-mono,ui-monospace,monospace)">${k+1}</div>`,
          iconSize: [radius*2, radius*2], iconAnchor: [radius, radius],
        });
        L.marker([s.lat, s.lon], { icon: stopIcon })
          .addTo(layerRef.current)
          .bindTooltip(`<b>#${k+1} · ${wo}</b><br>${s.name || ''}<br>priority: ${s.priority || '?'}${s.arrival_s != null ? `<br>arrives ${_fmtArrival(s.arrival_s)}` : ''}`, { direction: 'top' });
      });
    });
    if (bounds.length > 0) map.fitBounds(bounds, { padding: [25, 25], maxZoom: 16 });
  }, [routes, mapRef]);

  if (!window.L) {
    return (
      <div style={{ height, padding: 20, textAlign: 'center', color: 'var(--brand-muted)', background: 'var(--brand-bg-2)', borderRadius: 'var(--r-md)' }}>
        Leaflet failed to load — refresh the page to retry.
      </div>
    );
  }
  return <div ref={divRef} style={{ width: '100%', height, borderRadius: 'var(--r-md)', overflow: 'hidden', background: '#1c222d' }} />;
}

function LayerPreviewMap({ project, overlays, height = 340 }) {
  const divRef = React.useRef(null);
  const mapRef = _useLeafletMap(divRef);
  const layerRef = React.useRef(null);
  const cacheRef = React.useRef({});

  React.useEffect(() => {
    const map = mapRef.current; if (!map || !window.L) return;
    const L = window.L;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    layerRef.current.clearLayers();
    const visible = (overlays || []).filter(l => l.visible);
    if (visible.length === 0) return;
    const palette = ['#36e0d4', '#ff9a52', '#6a9be8', '#e870c2', '#a0e060', '#fec060'];
    const allBounds = [];
    let cancelled = false;
    (async () => {
      for (let i = 0; i < visible.length; i++) {
        const l = visible[i];
        const color = palette[i % palette.length];
        let geo = cacheRef.current[l.id];
        if (!geo) {
          try {
            const r = await fetch(`/projects/${project.id}/gis-layers/${l.id}/export`);
            if (!r.ok) continue;
            geo = await r.json();
            cacheRef.current[l.id] = geo;
          } catch { continue; }
        }
        if (cancelled || !geo) continue;
        try {
          const gj = L.geoJSON(geo, {
            style: () => ({ color, weight: 2, opacity: 0.85, fillOpacity: 0.25, fillColor: color }),
            pointToLayer: (_f, latlng) => L.circleMarker(latlng, { radius: 4, color, fillColor: color, fillOpacity: 0.8, weight: 1 }),
            onEachFeature: (f, lyr) => {
              if (f.properties) {
                const lbl = f.properties.name || f.properties.id || l.name;
                lyr.bindTooltip(String(lbl), { sticky: true });
              }
            },
          }).addTo(layerRef.current);
          const b = gj.getBounds();
          if (b.isValid()) {
            allBounds.push([b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]);
            // Refit progressively so first layer shows immediately
            map.fitBounds(allBounds, { padding: [20, 20], maxZoom: 16 });
          }
        } catch { /* skip bad layer */ }
      }
    })();
    return () => { cancelled = true; };
  }, [project.id, overlays, mapRef]);

  if (!window.L) {
    return (
      <div style={{ height, padding: 20, textAlign: 'center', color: 'var(--brand-muted)', background: 'var(--brand-bg-2)', borderRadius: 'var(--r-md)' }}>
        Leaflet failed to load — refresh the page to retry.
      </div>
    );
  }
  return <div ref={divRef} style={{ width: '100%', height, borderRadius: 'var(--r-md)', overflow: 'hidden', background: '#1c222d' }} />;
}

// ─── Tab panels ───────────────────────────────────────────────────────────

function OverviewPanel({ project, models, modelsLoading, overlays, overlaysLoading }) {
  const ready    = models.filter(m => _toneFor(m.status) === 'ok').length;
  const pending  = models.filter(m => _toneFor(m.status) === 'warn').length;
  const failed   = models.filter(m => _toneFor(m.status) === 'error').length;
  const totalModels = Math.max(project.model_count || 0, models.length);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="bp-proj-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiTile label="Models" value={totalModels} />
        <KpiTile label="Ready"   value={modelsLoading ? '…' : ready}   tone="ok" />
        <KpiTile label="Pending" value={modelsLoading ? '…' : pending} tone="warn" />
        <KpiTile label="Failed"  value={modelsLoading ? '…' : failed}  tone="error" />
      </div>
      <div className="bp-proj-overview" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        <Card title="GIS overlays">
          {overlaysLoading
            ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--brand-muted)' }}><Spinner size="sm" /></div>
            : overlays.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>No overlays. Open the <strong>GIS overlays</strong> tab to add one.</div>
              : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {overlays.slice(0, 5).map((l, i) => (
                    <li key={l.id || l.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--brand-line)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 'var(--r-sm)', background: 'var(--brand-gis)' }} />
                        <span style={{ fontSize: 'var(--fs-small)' }}>{l.name || l.id}</span>
                      </span>
                      <span className="micro">{l.source || l.layer_type || '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
        </Card>
        <Card title="Project details" variant="accent">
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 12, columnGap: 16 }}>
            {[
              ['ID',           project.id || '—'],
              ['Owner',        project.owner_email || '—'],
              ['Created',      _fmtDate(project.created_at)],
              ['Updated',      _fmtDate(project.updated_at)],
              ['Models',       String(project.model_count ?? models.length ?? 0)],
              ['Description',  project.description || '—'],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="micro" style={{ alignSelf: 'center' }}>{k}</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-small)', color: 'var(--brand-text)', textAlign: 'right', wordBreak: 'break-all' }}>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

function IfcUploader({ project, onUploaded, push }) {
  const fileRef = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [pct,  setPct]  = React.useState(0);
  const [drag, setDrag] = React.useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true); setPct(0);
    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/projects/${project.id}/ifc`);
        const auth = window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken();
        if (auth) xhr.setRequestHeader('Authorization', 'Bearer ' + auth);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round(100 * e.loaded / e.total)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
          } else { reject(new Error(`${xhr.status} ${xhr.responseText || xhr.statusText}`)); }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        const fd = new FormData(); fd.append('file', file);
        xhr.send(fd);
      });
      push({ tone: 'success', title: 'IFC queued for ingest', description: data.model_id ? `model_id: ${data.model_id}` : file.name });
      onUploaded(data);
    } catch (err) {
      push({ tone: 'error', title: 'Upload failed', description: err.message });
    } finally { setBusy(false); setPct(0); }
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) upload(f);
  }

  return (
    <Card title="Upload IFC" subtitle="adds a model to this project"
      action={<Button size="sm" variant="primary" leftIcon="↥" disabled={busy}
        onClick={() => fileRef.current && fileRef.current.click()}>
        {busy ? `Uploading… ${pct}%` : 'Choose file'}
      </Button>}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !busy && fileRef.current && fileRef.current.click()}
        style={{
          padding: 24, textAlign: 'center', cursor: busy ? 'progress' : 'pointer',
          border: `1px dashed ${drag ? 'var(--brand-bim)' : 'var(--brand-line-strong)'}`,
          background: drag ? 'rgba(54,224,212,0.06)' : 'transparent',
          borderRadius: 'var(--r-md)',
          color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
          transition: 'border-color 120ms, background 120ms',
        }}>
        <div style={{ marginBottom: 6, fontSize: 22 }}>↥</div>
        <div>{busy ? `Uploading… ${pct}%` : 'Drop an .ifc file here or click to browse'}</div>
        {busy && (
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand-bim)', transition: 'width 120ms' }} />
          </div>
        )}
        <input ref={fileRef} type="file" accept=".ifc,.IFC" hidden
          onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) upload(f); e.target.value = ''; }} />
      </div>
    </Card>
  );
}

function ModelsPanel({ mobile, models, loading, project, onOpenMap, push, refresh }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <IfcUploader project={project} onUploaded={refresh} push={push} />
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--brand-muted)' }}><Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING MODELS</div></div>
      ) : models.length === 0 ? (
        <EmptyState icon="⊞"
          title={(project.model_count || 0) > 0 ? `${project.model_count} model(s) attached` : 'No models in this project yet'}
          description={(project.model_count || 0) > 0
            ? 'The per-project model list endpoint is not wired yet — open the global Models page to see and manage them.'
            : 'Upload an IFC above and the list will populate.'}
          action={(project.model_count || 0) > 0
            ? <Button size="sm" variant="secondary" onClick={() => { window.location.hash = 'models'; }}>Open Models</Button>
            : undefined} />
      ) : (() => {
        const cols = [
          { key: 'model_id', header: 'Model', sortable: true, render: r => <strong style={{ fontWeight: 600 }}>{r.model_id || r.name || '—'}</strong> },
          { key: 'status',   header: 'Status', render: r => <Pill tone={_toneFor(r.status)} dot={_toneFor(r.status) !== 'neutral'}>{r.status || '—'}</Pill> },
          { key: 'entities', header: 'Entities', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{(r.entities ?? 0).toLocaleString()}</span> },
          { key: 'geometry_rows', header: 'Geometry', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{(r.geometry_rows ?? 0).toLocaleString()}</span> },
        ];
        const actions = r => (
          <React.Fragment>
            <Button size="sm" variant="secondary" onClick={onOpenMap}>Open 3D</Button>
            <Button size="sm" variant="ghost" onClick={() => push({ tone: 'info', title: `Inspecting ${r.model_id}` })}>Inspect</Button>
          </React.Fragment>
        );
        return mobile
          ? <StackedCardTable columns={cols} rows={models} rowKey={r => r.model_id || r.id} actions={actions} />
          : <DataTable columns={cols} rows={models} rowKey={r => r.model_id || r.id} caption={`${models.length} models`} actions={actions} />;
      })()}
    </div>
  );
}

// ─── Teams tab — full CRUD ────────────────────────────────────────────────
function TeamFormModal({ open, onClose, project, team, onSaved, push }) {
  const editing = !!(team && team.id);
  const [form, setForm] = React.useState({
    name: '', status: 'active', member_count: 1,
    lat: 35.7, lon: 51.4, specialty: '', phone: '',
    skills: '', hourly_rate: '', vehicle_type: '',
    working_hours_start: '', working_hours_end: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [err,  setErr]  = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null); setBusy(false);
    if (team) {
      setForm({
        name: team.name || '',
        status: team.status || 'active',
        member_count: team.member_count ?? 1,
        lat: team.lat ?? 35.7,
        lon: team.lon ?? 51.4,
        specialty: team.specialty || '',
        phone: team.phone || '',
        skills: Array.isArray(team.skills) ? team.skills.join(', ') : '',
        hourly_rate: team.hourly_rate ?? '',
        vehicle_type: team.vehicle_type || '',
        working_hours_start: team.working_hours_start || '',
        working_hours_end:   team.working_hours_end   || '',
      });
    } else {
      setForm({ name: '', status: 'active', member_count: 1, lat: 35.7, lon: 51.4, specialty: '', phone: '', skills: '', hourly_rate: '', vehicle_type: '', working_hours_start: '', working_hours_end: '' });
    }
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, team, onClose]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required'); return; }
    setBusy(true); setErr(null);
    try {
      const body = {
        name: form.name.trim(),
        status: form.status,
        member_count: Number(form.member_count) || 1,
        lat: Number(form.lat),
        lon: Number(form.lon),
      };
      if (form.specialty.trim())          body.specialty           = form.specialty.trim();
      if (form.phone.trim())              body.phone               = form.phone.trim();
      if (form.skills.trim())             body.skills              = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (form.hourly_rate !== '')        body.hourly_rate         = Number(form.hourly_rate);
      if (form.vehicle_type.trim())       body.vehicle_type        = form.vehicle_type.trim();
      if (form.working_hours_start.trim())body.working_hours_start = form.working_hours_start.trim();
      if (form.working_hours_end.trim())  body.working_hours_end   = form.working_hours_end.trim();

      const url = editing
        ? `/projects/${project.id}/teams/${team.id}`
        : `/projects/${project.id}/teams`;
      await _api(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
      push({ tone: 'success', title: editing ? `Updated ${body.name}` : `Created ${body.name}` });
      onSaved();
      onClose();
    } catch (e2) {
      setErr(e2.message);
      push({ tone: 'error', title: editing ? 'Could not update team' : 'Could not create team', description: e2.message });
    } finally { setBusy(false); }
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--brand-surface)', border: '1px solid var(--brand-line-strong)',
        borderRadius: 'var(--r-lg)', width: 'min(640px, 100%)', maxHeight: '85vh', overflow: 'auto',
        boxShadow: 'var(--shadow-card)',
      }} role="dialog" aria-modal="true">
        <header style={{ padding: '14px 16px', borderBottom: '1px solid var(--brand-line)', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, background: 'var(--brand-surface)', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600, flex: 1 }}>
            {editing ? 'Edit team' : 'Add team'}
          </h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)', color: 'var(--brand-muted)', borderRadius: 'var(--r-md)', width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>×</button>
        </header>
        <form onSubmit={submit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Team name" placeholder="e.g. Team North" value={form.name} onChange={(e) => set('name', e.target.value)} fullWidth required autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <label className="micro" style={{ display: 'block', marginBottom: 4 }}>Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)', fontFamily: 'inherit' }}>
                <option value="active">active</option>
                <option value="on_leave">on leave</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <Input label="Members" type="number" min="0" step="1" value={form.member_count} onChange={(e) => set('member_count', e.target.value)} />
            <Input label="Hourly rate" type="number" min="0" step="1000" value={form.hourly_rate} onChange={(e) => set('hourly_rate', e.target.value)} placeholder="optional" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <Input label="Latitude *"  type="number" step="0.0001" value={form.lat} onChange={(e) => set('lat', e.target.value)} required />
            <Input label="Longitude *" type="number" step="0.0001" value={form.lon} onChange={(e) => set('lon', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <Input label="Specialty"     value={form.specialty}    onChange={(e) => set('specialty', e.target.value)}    placeholder="HVAC, plumbing, …" />
            <Input label="Phone"         value={form.phone}        onChange={(e) => set('phone', e.target.value)}        placeholder="+98 ..." />
          </div>
          <Input label="Skills (comma-separated)" value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="electrical, HVAC, welding" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Input label="Hours start" type="time" value={form.working_hours_start} onChange={(e) => set('working_hours_start', e.target.value)} />
            <Input label="Hours end"   type="time" value={form.working_hours_end}   onChange={(e) => set('working_hours_end',   e.target.value)} />
            <Input label="Vehicle"     value={form.vehicle_type} onChange={(e) => set('vehicle_type', e.target.value)} placeholder="van, truck, …" />
          </div>
          {err && <div style={{ color: 'var(--brand-error, #f88)', fontSize: 12 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="primary" loading={busy} disabled={!form.name.trim() || busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamsPanel({ project, push }) {
  const [state, setState] = React.useState({ loading: true, items: [], error: null });
  const [modal, setModal] = React.useState({ open: false, team: null });
  const mobile = _useIsMobile();

  const load = React.useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const data = await _api(`/projects/${project.id}/teams`);
      setState({ loading: false, items: data.teams || [], error: null });
    } catch (err) {
      setState({ loading: false, items: [], error: err.message });
    }
  }, [project.id]);

  React.useEffect(() => { load(); }, [load]);

  async function del(team) {
    if (!window.confirm(`Delete team "${team.name}"?`)) return;
    try {
      await _api(`/projects/${project.id}/teams/${team.id}`, { method: 'DELETE' });
      push({ tone: 'success', title: `Deleted ${team.name}` });
      load();
    } catch (err) {
      push({ tone: 'error', title: 'Delete failed', description: err.message });
    }
  }

  const cols = [
    { key: 'name', header: 'Team', sortable: true, render: r => (
      <div>
        <strong style={{ fontWeight: 600 }}>{r.name}</strong>
        <div className="micro" style={{ marginTop: 2 }}>
          {(r.member_count || 0)} member{r.member_count === 1 ? '' : 's'}
          {r.specialty ? ` · ${r.specialty}` : ''}
          {r.phone ? ` · ${r.phone}` : ''}
        </div>
      </div>
    ) },
    { key: 'status', header: 'Status', render: r => <Pill tone={_toneFor(r.status)} dot={_toneFor(r.status) !== 'neutral'}>{r.status || 'active'}</Pill> },
    { key: 'location', header: 'Location', render: r => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {Number(r.lat || 0).toFixed(4)}, {Number(r.lon || 0).toFixed(4)}
        {r.service_radius_km != null && <div className="micro" style={{ marginTop: 2 }}>r {r.service_radius_km} km</div>}
      </span>
    ) },
    { key: 'skills', header: 'Skills', render: r => {
      const ss = Array.isArray(r.skills) ? r.skills : [];
      if (!ss.length) return <span className="micro">—</span>;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ss.slice(0, 3).map(s => <Pill key={s} tone="info">{s}</Pill>)}
          {ss.length > 3 && <span className="micro" style={{ alignSelf: 'center' }}>+{ss.length - 3}</span>}
        </div>
      );
    } },
    { key: 'hours', header: 'Hours', render: r => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {(r.working_hours_start && r.working_hours_end) ? `${r.working_hours_start}–${r.working_hours_end}` : <span className="micro">24h</span>}
      </span>
    ) },
    { key: 'cost', header: 'Cost', render: r => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {r.hourly_rate != null ? `${Math.round(r.hourly_rate).toLocaleString()}/hr` : <span className="micro">—</span>}
        {r.vehicle_type && <div className="micro" style={{ marginTop: 2 }}>{r.vehicle_type}</div>}
      </span>
    ) },
  ];
  const actions = r => (
    <React.Fragment>
      <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, team: r })}>Edit</Button>
      <Button size="sm" variant="ghost" onClick={() => del(r)}>Delete</Button>
    </React.Fragment>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Maintenance teams"
        subtitle={state.loading ? 'loading…' : state.items.length === 0 ? 'no teams yet' : `${state.items.length} team${state.items.length === 1 ? '' : 's'}`}
        action={<Button size="sm" variant="primary" leftIcon="+" onClick={() => setModal({ open: true, team: null })}>Add team</Button>}
        dense>
        {state.loading ? (
          <div style={{ padding: 30, textAlign: 'center' }}><Spinner size="sm" /></div>
        ) : state.error ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--brand-error, #f88)', fontSize: 13 }}>{state.error}</div>
        ) : state.items.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--brand-muted)' }}>
            <div className="micro" style={{ marginBottom: 8 }}>NO TEAMS YET</div>
            <div style={{ fontSize: 'var(--fs-small)' }}>Add a maintenance team to assign work orders and run the route optimiser.</div>
          </div>
        ) : mobile ? (
          <StackedCardTable columns={cols} rows={state.items} rowKey={r => r.id} actions={actions} />
        ) : (
          <DataTable columns={cols} rows={state.items} rowKey={r => r.id} caption={`${state.items.length} teams`} actions={actions} />
        )}
      </Card>
      <TeamFormModal open={modal.open} team={modal.team} project={project}
        onClose={() => setModal({ open: false, team: null })} onSaved={load} push={push} />
    </div>
  );
}

// ─── Work Orders tab — project-wide list + stats + filter + edit ─────────
const _PWO_STATUS_TONE  = { open: 'info', in_progress: 'warn', completed: 'ok', cancelled: 'neutral' };
const _PWO_PRIO_TONE    = { urgent: 'error', high: 'warn', normal: 'info', low: 'neutral' };
const _PWO_PAGE = 50;

function WoEditModal({ open, wo, onClose, onSaved, push }) {
  const [form, setForm] = React.useState({
    title: '', status: 'open', priority: 'normal', type: 'corrective',
    safety_requirements: 'none', assigned_to: '', due_date: '', description: '',
    required_skills: '', estimated_duration_min: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [err,  setErr]  = React.useState(null);

  React.useEffect(() => {
    if (!open || !wo) return;
    setErr(null); setBusy(false);
    setForm({
      title:                  wo.title || '',
      status:                 wo.status || 'open',
      priority:               wo.priority || 'normal',
      type:                   wo.type || 'corrective',
      safety_requirements:    wo.safety_requirements || 'none',
      assigned_to:            wo.assigned_to || '',
      due_date:               wo.due_date ? new Date(wo.due_date).toISOString().slice(0, 10) : '',
      description:            wo.description || '',
      required_skills:        Array.isArray(wo.required_skills) ? wo.required_skills.join(', ') : '',
      estimated_duration_min: wo.estimated_duration_min ?? '',
    });
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, wo, onClose]);

  if (!open || !wo) return null;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const body = {
        title: form.title.trim(),
        status: form.status,
        priority: form.priority,
        type: form.type,
        safety_requirements: form.safety_requirements,
      };
      if (form.assigned_to.trim())            body.assigned_to            = form.assigned_to.trim();
      if (form.due_date)                      body.due_date               = form.due_date;
      if (form.description.trim())            body.description            = form.description.trim();
      if (form.required_skills.trim())        body.required_skills        = form.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      if (form.estimated_duration_min !== '') body.estimated_duration_min = Number(form.estimated_duration_min);

      await _api(`/fm/${wo.model_id}/work-orders/${wo.id}`, {
        method: 'PATCH', body: JSON.stringify(body),
      });
      push({ tone: 'success', title: `Updated ${wo.work_order_number || wo.id.slice(0, 8)}` });
      onSaved();
      onClose();
    } catch (e2) {
      setErr(e2.message);
      push({ tone: 'error', title: 'Update failed', description: e2.message });
    } finally { setBusy(false); }
  }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--brand-surface)', border: '1px solid var(--brand-line-strong)',
        borderRadius: 'var(--r-lg)', width: 'min(700px, 100%)', maxHeight: '85vh', overflow: 'auto', boxShadow: 'var(--shadow-card)',
      }} role="dialog" aria-modal="true">
        <header style={{ padding: '14px 16px', borderBottom: '1px solid var(--brand-line)', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, background: 'var(--brand-surface)', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>Edit work order</h3>
            <div className="micro" style={{ marginTop: 2 }}>{wo.work_order_number || wo.id.slice(0, 8)} · {wo.model_id}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)', color: 'var(--brand-muted)', borderRadius: 'var(--r-md)', width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>×</button>
        </header>
        <form onSubmit={submit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} fullWidth required autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              ['status',   ['open','in_progress','completed','cancelled']],
              ['priority', ['urgent','high','normal','low']],
              ['type',     ['corrective','preventive','inspection']],
              ['safety_requirements', ['none','PPE_L1','hot_work','confined_space','electrical_HV','fall_protection','chemical','radiation']],
            ].map(([k, opts]) => (
              <div key={k}>
                <label className="micro" style={{ display: 'block', marginBottom: 4 }}>{k === 'safety_requirements' ? 'Safety' : k}</label>
                <select value={form[k]} onChange={(e) => set(k, e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)' }}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Input label="Assigned to" value={form.assigned_to} onChange={(e) => set('assigned_to', e.target.value)} placeholder="name or username" />
            <Input label="Due date" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
          </div>
          <div>
            <label className="micro" style={{ display: 'block', marginBottom: 4 }}>Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)', fontFamily: 'inherit', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Input label="Required skills (comma-separated)" value={form.required_skills} onChange={(e) => set('required_skills', e.target.value)} placeholder="electrical, HVAC" />
            <Input label="Est. duration (min)" type="number" min="0" step="5" value={form.estimated_duration_min} onChange={(e) => set('estimated_duration_min', e.target.value)} />
          </div>
          {err && <div style={{ color: 'var(--brand-error, #f88)', fontSize: 12 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="primary" loading={busy} disabled={!form.title.trim() || busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrdersPanel({ project, push, onOpenMap }) {
  const mobile = _useIsMobile();
  const [filter, setFilter] = React.useState({ model_id: '', status: '', priority: '', type: '', safety: '', assigned_to: '', number: '' });
  const [state, setState]   = React.useState({ items: [], total: 0, has_more: false, loading: true, error: null, offset: 0 });
  const [stats, setStats]   = React.useState(null);
  const [modal, setModal]   = React.useState({ open: false, wo: null });

  const buildQs = React.useCallback((append) => {
    const qs = new URLSearchParams();
    if (filter.model_id)    qs.set('model_id', filter.model_id);
    if (filter.number)      qs.set('number', filter.number);
    if (filter.status)      qs.set('status', filter.status);
    if (filter.priority)    qs.set('priority', filter.priority);
    if (filter.type)        qs.set('type', filter.type);
    if (filter.safety)      qs.set('safety', filter.safety);
    if (filter.assigned_to) qs.set('assigned_to', filter.assigned_to);
    qs.set('limit', String(_PWO_PAGE));
    qs.set('offset', String(append ? state.offset : 0));
    return qs;
  }, [filter, state.offset]);

  const load = React.useCallback(async (append = false) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const qs = buildQs(append);
      const data = await _api(`/projects/${project.id}/work-orders?${qs}`);
      const page = data.items || [];
      const items = append ? state.items.concat(page) : page;
      setState({
        items, loading: false, error: null,
        total: typeof data.total === 'number' ? data.total : items.length,
        has_more: !!data.has_more,
        offset: (append ? state.offset : 0) + page.length,
      });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  }, [project.id, buildQs, state.items, state.offset]);

  const loadStats = React.useCallback(async () => {
    try {
      const qs = filter.model_id ? `?model_id=${encodeURIComponent(filter.model_id)}` : '';
      const s = await _api(`/projects/${project.id}/work-orders/stats${qs}`);
      setStats(s);
    } catch { setStats(null); }
  }, [project.id, filter.model_id]);

  React.useEffect(() => {
    load(false);
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, filter.model_id, filter.number, filter.status, filter.priority, filter.type, filter.safety, filter.assigned_to]);

  async function del(wo) {
    if (!window.confirm(`Delete WO ${wo.work_order_number || wo.id.slice(0, 8)} — "${wo.title}"?`)) return;
    try {
      await _api(`/fm/${wo.model_id}/work-orders/${wo.id}`, { method: 'DELETE' });
      push({ tone: 'success', title: `Deleted ${wo.work_order_number || wo.id.slice(0, 8)}` });
      load(false); loadStats();
    } catch (err) {
      push({ tone: 'error', title: 'Delete failed', description: err.message });
    }
  }

  function setF(k, v) { setState(s => ({ ...s, offset: 0 })); setFilter(f => ({ ...f, [k]: v })); }

  const totalCount = stats && typeof stats.total === 'number' ? stats.total : state.total;
  const byStatus   = (stats && stats.by_status)   || {};
  const byPriority = (stats && stats.by_priority) || {};

  const cols = [
    { key: 'number', header: '#', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.work_order_number || r.id.slice(0, 8)}</span> },
    { key: 'title',  header: 'Title', render: r => (
      <div>
        <strong style={{ fontWeight: 600 }}>{r.title}</strong>
        {r.assigned_to && <div className="micro" style={{ marginTop: 2 }}>{r.assigned_to}</div>}
      </div>
    ) },
    { key: 'model',  header: 'Model', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-muted)' }}>{r.model_id}</span> },
    { key: 'flags',  header: 'Status · priority · type', render: r => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        <Pill tone={_PWO_STATUS_TONE[r.status] || 'neutral'} dot>{r.status}</Pill>
        <Pill tone={_PWO_PRIO_TONE[r.priority] || 'neutral'}>{r.priority}</Pill>
        <span className="micro">{r.type}</span>
      </div>
    ) },
    { key: 'safety', header: 'Safety', render: r => (r.safety_requirements && r.safety_requirements !== 'none')
      ? <Pill tone="warn">{r.safety_requirements}</Pill>
      : <span className="micro">—</span> },
    { key: 'due',    header: 'Due / closed', render: r => {
      const due = r.due_date ? new Date(r.due_date).toISOString().slice(0, 10) : '';
      const closed = r.completion_date ? new Date(r.completion_date).toISOString().slice(0, 10) : '';
      if (closed) return <span style={{ fontSize: 11, color: 'var(--brand-muted)' }}>closed {closed}</span>;
      if (due)    return <span style={{ fontSize: 11, color: 'var(--brand-text)' }}>due {due}</span>;
      return <span className="micro">—</span>;
    } },
  ];
  const actions = r => (
    <React.Fragment>
      <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, wo: r })}>Edit</Button>
      <a href={`/app/viewer.html?model=${encodeURIComponent(r.model_id)}&focus=${encodeURIComponent(r.entity_global_id || '')}&project=${encodeURIComponent(project.id)}`}
         target="_blank" rel="noopener noreferrer"
         style={{ fontSize: 12, color: 'var(--brand-bim)', textDecoration: 'none', borderBottom: '1px dotted', alignSelf: 'center' }}>3D</a>
      <Button size="sm" variant="ghost" onClick={() => del(r)}>Delete</Button>
    </React.Fragment>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Stats card ── */}
      <Card title="Dashboard" subtitle={`${totalCount} work order${totalCount === 1 ? '' : 's'} in this project`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KpiTile label="Total" value={totalCount} />
          <KpiTile label="Open" value={byStatus.open || 0} tone="info" />
          <KpiTile label="In progress" value={byStatus.in_progress || 0} tone="warn" />
          <KpiTile label="Completed" value={byStatus.completed || 0} tone="ok" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {['urgent','high','normal','low'].map(p => (byPriority[p] || 0) > 0 && (
            <Pill key={p} tone={_PWO_PRIO_TONE[p] || 'neutral'}>{p}: {byPriority[p]}</Pill>
          ))}
        </div>
      </Card>

      {/* ── Filter + table ── */}
      <Card title="Work orders"
        subtitle={state.loading ? 'loading…' : `showing ${state.items.length} of ${state.total}`}
        dense>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--brand-line)' }}>
          <Input size="sm" placeholder="WO #" value={filter.number} onChange={(e) => setF('number', e.target.value)} />
          {[
            ['status',   ['', 'open','in_progress','completed','cancelled']],
            ['priority', ['', 'urgent','high','normal','low']],
            ['type',     ['', 'corrective','preventive','inspection']],
          ].map(([k, opts]) => (
            <select key={k} value={filter[k]} onChange={(e) => setF(k, e.target.value)}
              style={{ padding: '6px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              {opts.map(o => <option key={o || 'all'} value={o}>{o ? o : `— all ${k} —`}</option>)}
            </select>
          ))}
          <Input size="sm" placeholder="Assignee" value={filter.assigned_to} onChange={(e) => setF('assigned_to', e.target.value)} />
        </div>

        {state.loading && state.items.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center' }}><Spinner size="sm" /></div>
        ) : state.error ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--brand-error, #f88)', fontSize: 13 }}>{state.error}</div>
        ) : state.items.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--brand-muted)' }}>
            <div className="micro" style={{ marginBottom: 8 }}>NO WORK ORDERS MATCH THIS FILTER</div>
            <div style={{ fontSize: 'var(--fs-small)' }}>Create work orders from the 3D viewer's right-rail inspector — pick an entity, then "+ new WO".</div>
            <div style={{ marginTop: 12 }}><Button size="sm" variant="secondary" onClick={onOpenMap}>Open 3D viewer</Button></div>
          </div>
        ) : (
          <React.Fragment>
            {mobile
              ? <StackedCardTable columns={cols} rows={state.items} rowKey={r => r.id} actions={actions} />
              : <DataTable columns={cols} rows={state.items} rowKey={r => r.id} caption="" actions={actions} />}
            {state.has_more && (
              <div style={{ padding: 12, textAlign: 'center' }}>
                <Button size="sm" variant="ghost" onClick={() => load(true)} disabled={state.loading}>
                  {state.loading ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </React.Fragment>
        )}
      </Card>

      <WoEditModal open={modal.open} wo={modal.wo} onClose={() => setModal({ open: false, wo: null })}
        onSaved={() => { load(false); loadStats(); }} push={push} />
    </div>
  );
}

// ─── Optimize tab — MDVRP-TW solver UI via SSE ────────────────────────────
// ─── Per-team route card (used by both live runs and loaded history) ─────
function _OptimalityBadge({ result }) {
  if (!result || !result.solver) return null;
  if (result.solver === 'ortools') {
    return result.proven_optimal
      ? <Pill tone="ok"   title="OR-Tools search completed before the time limit — could not find a better solution within the encoded model.">✓ OPTIMAL · proven</Pill>
      : <Pill tone="warn" title="OR-Tools returned the best solution within the time limit. A longer time limit might (or might not) improve it.">⏱ time limit · not proven optimal</Pill>;
  }
  if (result.solver === 'ga') {
    return result.converged_early
      ? <Pill tone="info" title="GA fitness stopped improving before the maximum generation count — likely a good local optimum.">~ converged · likely good</Pill>
      : <Pill tone="warn" title="GA ran the full generation budget without converging — increasing 'generations' might find a better solution.">⚠ budget hit · could improve</Pill>;
  }
  return null;
}

function _TeamRouteCard({ route, idx }) {
  const accent = _teamColor(idx);
  const cap = (route.capacity != null) ? Math.round(route.capacity * 10) / 10 : null;
  const used = (route.stops || []).length;
  const over = (route.over_capacity_by != null) ? route.over_capacity_by : (cap != null ? Math.max(0, used - cap) : 0);
  return (
    <details open style={{
      border: '1px solid var(--brand-line)', borderLeft: `3px solid ${accent}`,
      borderRadius: 'var(--r-md)', background: 'var(--brand-bg-2)', marginBottom: 8,
    }}>
      <summary style={{
        listStyle: 'none', cursor: 'pointer', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', userSelect: 'none',
      }}>
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 140, fontWeight: 600, color: 'var(--brand-text)' }}>{route.team_name || `Team ${route.team_id || idx + 1}`}</span>
        <span style={{ fontSize: 11, color: over > 0 ? 'var(--brand-warn, #e8a060)' : 'var(--brand-muted)' }}>
          {cap != null ? `${used} / ${cap}${over > 0 ? ` ⚠ +${over}` : ''}` : `${used} stops`}
        </span>
        <span style={{ fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>{_fmtDist(route.distance_m)}</span>
        <span style={{ fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>{_fmtDur(route.time_s)}</span>
      </summary>
      <div style={{ padding: '0 14px 12px', overflowX: 'auto' }}>
        {used === 0 ? (
          <div className="micro" style={{ padding: '8px 0' }}>NO STOPS ASSIGNED</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--brand-line)' }}>
                {['#', 'WO', 'Title', 'Priority', 'Arrival', 'From prev'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-faint)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(route.stops || []).map((s, i) => {
                const pri = s.priority || '—';
                const woNum = s.work_order_number || (s.work_order_id ? s.work_order_id.slice(0, 8) : '—');
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--brand-faint)', width: 28, textAlign: 'right' }}>{i + 1}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{woNum}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <strong>{s.name || s.work_order_id || '—'}</strong>
                      {s.safety_requirements && s.safety_requirements !== 'none' && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--brand-warn, #fec)' }}>⚠ {s.safety_requirements}</span>
                      )}
                      {s.model_id && <div className="micro" style={{ marginTop: 2 }}>{s.model_id}</div>}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ color: _PRIO_DOT[pri] || 'var(--brand-faint)', marginRight: 4 }}>●</span>
                      <span style={{ fontSize: 11 }}>{pri}</span>
                    </td>
                    <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)' }}>{_fmtArrival(s.arrival_s)}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)' }}>{s.from_prev_m != null ? _fmtDist(s.from_prev_m) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </details>
  );
}

// ─── Optimize tab — MDVRP-TW solver UI via SSE ────────────────────────────
function OptimizePanel({ project, push }) {
  const [solver, setSolver] = React.useState('ga');
  const [shared, setShared] = React.useState({ cruise_kmh: 30, service_minutes: 15, wo_per_member: 5 });
  const [ga, setGa]         = React.useState({ population: 80, generations: 120, crossover_rate: 0.85, mutation_rate: 0.20, alpha_time: 0, capacity_penalty_m: 500, beta_priority: 0, seed: '' });
  const [ot, setOt]         = React.useState({ ot_time_limit_s: 30, ot_first_solution: 'PATH_CHEAPEST_ARC', ot_metaheuristic: 'GUIDED_LOCAL_SEARCH' });
  const [roadLayerId, setRoadLayerId] = React.useState('');
  const [routingLayers, setRoutingLayers] = React.useState([]);
  const [running, setRunning]       = React.useState(false);
  const [progress, setProgress]     = React.useState(0);
  const [status, setStatus]         = React.useState('');
  const [log, setLog]               = React.useState([]);
  const [result, setResult]         = React.useState(null);   // full done-message OR loaded run
  const [history, setHistory]       = React.useState([]);
  const [loadingRun, setLoadingRun] = React.useState(null);
  const esRef = React.useRef(null);

  React.useEffect(() => () => { if (esRef.current) esRef.current.close(); }, []);

  const loadHistory = React.useCallback(async () => {
    try {
      const data = await _api(`/projects/${project.id}/optimize/runs`);
      setHistory(data.items || []);
    } catch { setHistory([]); }
  }, [project.id]);

  const loadLayers = React.useCallback(async () => {
    try {
      const data = await _api(`/projects/${project.id}/gis-layers`);
      const rl = (data.layers || []).filter(l => l.is_routing || l.routing || (l.layer_type || '').toLowerCase().includes('routing'));
      setRoutingLayers(rl);
    } catch { setRoutingLayers([]); }
  }, [project.id]);

  React.useEffect(() => { loadHistory(); loadLayers(); }, [loadHistory, loadLayers]);

  function appendLog(line) {
    setLog(L => [...L.slice(-200), `[${new Date().toLocaleTimeString()}] ${line}`]);
  }

  async function loadRun(id) {
    setLoadingRun(id);
    try {
      const run = await _api(`/projects/${project.id}/optimize/runs/${id}`);
      setResult(run);
      setProgress(100);
      setStatus(`loaded run ${id.slice(0, 8)}`);
    } catch (err) {
      push({ tone: 'error', title: 'Could not load run', description: err.message });
    } finally { setLoadingRun(null); }
  }

  async function deleteRun(id) {
    if (!window.confirm('Delete this run from history?')) return;
    try {
      await _api(`/projects/${project.id}/optimize/runs/${id}`, { method: 'DELETE' });
      push({ tone: 'success', title: 'Run deleted' });
      // If the displayed result IS this run, clear it.
      if (result && (result.id === id || result.run_id === id)) setResult(null);
      loadHistory();
    } catch (err) {
      push({ tone: 'error', title: 'Delete failed', description: err.message });
    }
  }

  function run() {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setRunning(true); setProgress(0); setStatus('starting…'); setLog([]); setResult(null);

    const params = new URLSearchParams({
      solver,
      cruise_kmh: String(shared.cruise_kmh),
      service_minutes: String(shared.service_minutes),
      wo_per_member: String(shared.wo_per_member),
    });
    if (roadLayerId) params.set('use_road_network', 'true');
    if (solver === 'ortools') {
      params.set('ot_time_limit_s',    String(ot.ot_time_limit_s));
      params.set('ot_first_solution',  ot.ot_first_solution);
      params.set('ot_metaheuristic',   ot.ot_metaheuristic);
    } else {
      params.set('population',          String(ga.population));
      params.set('generations',         String(ga.generations));
      params.set('crossover_rate',      String(ga.crossover_rate));
      params.set('mutation_rate',       String(ga.mutation_rate));
      params.set('alpha_time',          String(ga.alpha_time));
      params.set('capacity_penalty_m',  String(ga.capacity_penalty_m));
      params.set('beta_priority',       String(ga.beta_priority));
      if (ga.seed !== '') params.set('seed', String(ga.seed));
    }
    const token = window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken();
    if (token) params.set('token', token);

    const url = `/projects/${project.id}/optimize/run?${params}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.type === 'hello') {
        const which = m.config && m.config.solver === 'ortools'
          ? `OR-Tools (${(m.config.metaheuristic || '').replace(/_/g, ' ').toLowerCase()}, time limit ${m.config.time_limit_s}s)`
          : `GA — population ${m.config && m.config.population}, max ${m.config && m.config.generations} gens`;
        setStatus(`running ${which}`);
        appendLog(`running ${which}`);
      } else if (m.type === 'progress') {
        if (typeof m.generation === 'number' && typeof m.total_generations === 'number') {
          const pct = Math.round(100 * m.generation / m.total_generations);
          setProgress(pct);
          setStatus(`gen ${m.generation}/${m.total_generations}  ·  best fitness ${m.best_fitness != null ? m.best_fitness.toFixed(2) : '?'}`);
        } else if (m.message) {
          appendLog(m.message);
        }
      } else if (m.type === 'done') {
        setProgress(100);
        // Server may emit an error-shaped "done" with status=no-work-orders/no-teams
        if (m.status === 'no-work-orders' || m.status === 'no-teams') {
          setStatus(m.message || m.status);
          push({ tone: 'warn', title: 'Optimize finished with no result', description: m.message });
        } else {
          const totalDist = (m.routes || []).reduce((s, r) => s + (r.distance_m || 0), 0);
          setStatus(`done in ${_fmtDur(m.elapsed_s)}  ·  ${(m.routes || []).length} routes  ·  total ${_fmtDist(totalDist)}`);
          (m.log_lines || []).forEach(appendLog);
        }
        setResult(m);
        appendLog(`done · run_id=${m.run_id || '?'}`);
        setRunning(false);
        es.close(); esRef.current = null;
        loadHistory();
      } else if (m.type === 'error') {
        setStatus(`error: ${m.message || 'unknown'}`);
        appendLog(`ERROR: ${m.message || 'unknown'}`);
        push({ tone: 'error', title: 'Optimize failed', description: m.message });
        setRunning(false);
        es.close(); esRef.current = null;
      }
    };
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setStatus('SSE connection lost');
      appendLog('SSE connection lost');
      setRunning(false);
      es.close(); esRef.current = null;
    };
  }

  function stop() {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setRunning(false); setStatus('stopped by user');
  }

  function clear() { setResult(null); setProgress(0); setStatus(''); setLog([]); }

  function input(label, val, onChange, opts) {
    return <Input label={label} type="number" value={val} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} {...(opts || {})} />;
  }

  const routes = (result && result.routes) || [];
  const totalDist = routes.reduce((s, r) => s + (r.distance_m || 0), 0);
  const totalTime = routes.reduce((s, r) => s + (r.time_s    || 0), 0);
  const solverLabel = result && result.solver === 'ortools'
    ? `OR-Tools (${result.solver_status || '?'})`
    : result && result.solver === 'ga' ? 'Genetic Algorithm' : '';
  const runId = result && (result.run_id || result.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="MDVRP-TW scheduler"
        subtitle="Solve a multi-depot vehicle routing problem with time windows over this project's open work orders.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label className="micro" style={{ display: 'block', marginBottom: 4 }}>Solver</label>
            <select value={solver} onChange={(e) => setSolver(e.target.value)} disabled={running}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)' }}>
              <option value="ga">Genetic Algorithm (evolutionary, fast)</option>
              <option value="ortools">OR-Tools (CP-SAT + local search)</option>
            </select>
          </div>
          <div>
            <label className="micro" style={{ display: 'block', marginBottom: 4 }}>Routing layer (optional, enables pgRouting)</label>
            <select value={roadLayerId} onChange={(e) => setRoadLayerId(e.target.value)} disabled={running}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)' }}>
              <option value="">— none (straight-line Haversine) —</option>
              {routingLayers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          {input('Cruise km/h',   shared.cruise_kmh,      (v) => setShared(s => ({ ...s, cruise_kmh: v })),      { min: 1, max: 200, step: 1 })}
          {input('Service min/WO',shared.service_minutes, (v) => setShared(s => ({ ...s, service_minutes: v })), { min: 0, max: 600, step: 1 })}
          {input('WOs / member',  shared.wo_per_member,   (v) => setShared(s => ({ ...s, wo_per_member: v })),   { min: 0.5, max: 100, step: 0.5 })}
        </div>

        {solver === 'ga' ? (
          <React.Fragment>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              {input('Population', ga.population,  (v) => setGa(g => ({ ...g, population: v })),  { min: 10, max: 400 })}
              {input('Generations',ga.generations, (v) => setGa(g => ({ ...g, generations: v })), { min: 5,  max: 2000 })}
              {input('Crossover',  ga.crossover_rate, (v) => setGa(g => ({ ...g, crossover_rate: v })), { min: 0, max: 1, step: 0.05 })}
              {input('Mutation',   ga.mutation_rate,  (v) => setGa(g => ({ ...g, mutation_rate: v })),  { min: 0, max: 1, step: 0.05 })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              {input('α (time weight)',   ga.alpha_time,         (v) => setGa(g => ({ ...g, alpha_time: v })),         { min: 0, max: 10, step: 0.1 })}
              {input('Capacity penalty',  ga.capacity_penalty_m, (v) => setGa(g => ({ ...g, capacity_penalty_m: v })), { min: 0, max: 100000, step: 50 })}
              {input('β priority',        ga.beta_priority,      (v) => setGa(g => ({ ...g, beta_priority: v })),      { min: 0, max: 100, step: 0.05 })}
              <Input label="Seed (blank = random)" type="number" value={ga.seed} onChange={(e) => setGa(g => ({ ...g, seed: e.target.value }))} placeholder="random" />
            </div>
          </React.Fragment>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            {input('Time limit (s)', ot.ot_time_limit_s, (v) => setOt(o => ({ ...o, ot_time_limit_s: v })), { min: 5, max: 600 })}
            <div>
              <label className="micro" style={{ display: 'block', marginBottom: 4 }}>First solution</label>
              <select value={ot.ot_first_solution} onChange={(e) => setOt(o => ({ ...o, ot_first_solution: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)' }}>
                {['PATH_CHEAPEST_ARC','SAVINGS','PARALLEL_CHEAPEST_INSERTION','CHRISTOFIDES','AUTOMATIC'].map(o => <option key={o} value={o}>{o.replace(/_/g, ' ').toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="micro" style={{ display: 'block', marginBottom: 4 }}>Metaheuristic</label>
              <select value={ot.ot_metaheuristic} onChange={(e) => setOt(o => ({ ...o, ot_metaheuristic: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)' }}>
                {['GUIDED_LOCAL_SEARCH','TABU_SEARCH','SIMULATED_ANNEALING','GREEDY_DESCENT','AUTOMATIC'].map(o => <option key={o} value={o}>{o.replace(/_/g, ' ').toLowerCase()}</option>)}
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {running
            ? <Button variant="ghost" onClick={stop}>Stop</Button>
            : <Button variant="primary" leftIcon="▶" onClick={run}>Run optimiser</Button>}
        </div>
      </Card>

      {(running || progress > 0 || result) && (
        <Card title="Progress" subtitle={status}
          action={result && !running ? <Button size="sm" variant="ghost" onClick={clear}>Clear</Button> : null}>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--brand-bim), var(--brand-gis))', transition: 'width 200ms' }} />
          </div>
          {log.length > 0 && (
            <pre style={{
              margin: 0, padding: 10, background: 'var(--brand-bg-2)', borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)',
              maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap',
            }}>{log.join('\n')}</pre>
          )}
        </Card>
      )}

      {/* ── Rich result rendering: summary card + optimality badge + per-team routes ── */}
      {result && routes.length > 0 && (
        <Card title="Result"
          subtitle={
            result.work_order_count != null && result.team_count != null
              ? `${result.work_order_count} WOs across ${result.team_count} teams`
              : `${routes.length} route${routes.length === 1 ? '' : 's'}`
          }
          action={runId && (
            <a href={`/projects/${project.id}/optimize/runs/${runId}/export.zip${(window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken()) ? '?token=' + encodeURIComponent(window.PlatformAuth.getToken()) : ''}`}
               style={{ fontSize: 12, color: 'var(--brand-bim)', textDecoration: 'none', alignSelf: 'center' }}>Export .zip</a>
          )}>
          {/* ── Stat tiles ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 14 }}>
            <KpiTile label="Total distance" value={_fmtDist(totalDist)} />
            <KpiTile label="Total time"     value={_fmtDur(totalTime)} />
            <KpiTile label="Routes"         value={routes.length} />
            <KpiTile label="Fitness"        value={result.fitness != null ? Math.round(result.fitness) : '—'} tone="ok" />
          </div>

          {/* ── Optimality + provider line ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--brand-muted)', marginBottom: 14 }}>
            {solverLabel && <span className="micro">{solverLabel}</span>}
            <_OptimalityBadge result={result} />
            {result.distance_provider && <span className="micro">distance: {result.distance_provider}</span>}
            {result.unreachable_pairs > 0 && (
              <span style={{ color: 'var(--brand-warn, #e8a060)', fontSize: 11 }}>
                ⚠ {result.unreachable_pairs} unreachable pair(s) fell back to Haversine
              </span>
            )}
            {runId && <span className="micro" style={{ marginLeft: 'auto' }}>run_id: {runId.toString().slice(0, 8)}</span>}
          </div>

          {/* ── 2D route map (Leaflet) ── */}
          <div style={{ marginBottom: 14 }}>
            <RouteMap routes={routes} />
          </div>

          {/* ── Per-team route cards ── */}
          {routes.map((r, i) => <_TeamRouteCard key={r.team_id || i} route={r} idx={i} />)}
        </Card>
      )}

      {result && routes.length === 0 && (
        <Card title="Result">
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--brand-muted)' }}>
            <div className="micro">{result.status === 'no-work-orders' ? 'NO OPEN WORK ORDERS' : result.status === 'no-teams' ? 'NO ACTIVE TEAMS' : 'NO ROUTES'}</div>
            <div style={{ fontSize: 'var(--fs-small)', marginTop: 8 }}>{result.message || 'The solver returned no routes — check that you have at least one active team and one open WO.'}</div>
          </div>
        </Card>
      )}

      <Card title="Run history" subtitle={`${history.length} saved run${history.length === 1 ? '' : 's'}`} dense>
        {history.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--brand-muted)' }} className="micro">NO SAVED RUNS YET</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 320, overflow: 'auto' }}>
            {history.map((h, i) => (
              <li key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--brand-line)' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-text)' }}>{h.id.slice(0, 8)}</span>
                  <span className="micro" style={{ marginLeft: 8 }}>
                    {h.created_at ? _fmtDate(h.created_at) : ''}
                    {h.solver ? ` · ${h.solver}` : ''}
                    {(h.summary && h.summary.total_distance_m != null) ? ` · ${_fmtDist(h.summary.total_distance_m)}` : (h.total_distance_m != null ? ` · ${_fmtDist(h.total_distance_m)}` : '')}
                    {(h.summary && h.summary.routes_count != null) ? ` · ${h.summary.routes_count} route${h.summary.routes_count === 1 ? '' : 's'}` : (h.routes_count != null ? ` · ${h.routes_count} route${h.routes_count === 1 ? '' : 's'}` : '')}
                  </span>
                </span>
                <Button size="sm" variant="secondary" loading={loadingRun === h.id} disabled={loadingRun === h.id} onClick={() => loadRun(h.id)}>Load</Button>
                <a href={`/projects/${project.id}/optimize/runs/${h.id}/export.zip${(window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken()) ? '?token=' + encodeURIComponent(window.PlatformAuth.getToken()) : ''}`}
                   style={{ fontSize: 12, color: 'var(--brand-bim)', textDecoration: 'none' }}>Export</a>
                <Button size="sm" variant="ghost" onClick={() => deleteRun(h.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ─── GeoServer card (admin only) ─────────────────────────────────────────
function GeoServerCard({ project, push, refresh }) {
  const [state, setState]   = React.useState({ loading: true, layers: [], workspace: 'propos', error: null });
  const [picked, setPicked] = React.useState('');
  const [name, setName]     = React.useState('');
  const [busy, setBusy]     = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setState(s => ({ ...s, loading: true }));
      try {
        const data = await _api('/admin/geoserver/layers');
        setState({ loading: false, layers: data.layers || [], workspace: data.workspace || 'propos', error: null });
      } catch (err) {
        setState({ loading: false, layers: [], workspace: 'propos', error: err.message });
      }
    })();
  }, []);

  const apiOrigin = (window.PROPOS_CONFIG && window.PROPOS_CONFIG.apiBase) || window.location.origin;
  const wmsUrl = `${apiOrigin}/geoserver/${state.workspace}/wms?service=WMS&version=1.3.0&request=GetCapabilities`;
  const wfsUrl = `${apiOrigin}/geoserver/${state.workspace}/wfs?service=WFS&version=2.0.0&request=GetCapabilities`;

  async function copy(url, label) {
    try {
      await navigator.clipboard.writeText(url);
      push({ tone: 'success', title: `${label} URL copied` });
    } catch {
      push({ tone: 'error', title: 'Could not copy', description: 'Clipboard access denied — copy from address bar instead.' });
    }
  }

  async function importFromGs(e) {
    e.preventDefault();
    if (!picked) return;
    setBusy(true);
    try {
      const data = await _api(`/projects/${project.id}/gis-layers/from-geoserver`, {
        method: 'POST',
        body: JSON.stringify({ workspace: state.workspace, layer: picked, name: name.trim() || null, model_id: null }),
      });
      const layer = data && data.layer;
      push({ tone: 'success', title: 'Imported from GeoServer',
        description: layer ? `${layer.name}${data.features_added != null ? ` · ${data.features_added} features` : ''}` : picked });
      setPicked(''); setName('');
      refresh();
    } catch (err) {
      push({ tone: 'error', title: 'Import failed', description: err.message });
    } finally { setBusy(false); }
  }

  async function resync() {
    if (!window.confirm(`Re-publish every layer of this project to GeoServer?\n\nUseful after editing features directly in QGIS / psql so the WMS extent stays in sync.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/projects/${project.id}/gis-layers/resync`, { method: 'POST' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json().catch(() => ({}));
      push({ tone: 'success', title: 'GeoServer re-sync started',
        description: d.published != null ? `${d.published} layer(s) published` : undefined });
    } catch (err) {
      push({ tone: 'error', title: 'Re-sync failed', description: err.message });
    } finally { setBusy(false); }
  }

  const connected = !state.loading && !state.error;
  const dotColor = state.loading ? '#9ab' : state.error ? '#f06868' : '#6cd8a8';
  const dotPulse = state.loading;

  return (
    <div style={{
      borderRadius: 'var(--r-lg)', overflow: 'hidden',
      border: '1px solid var(--brand-line-strong)',
      background: 'var(--brand-surface)',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* ── Branded header band — teal→orange gradient (the brand pair) ── */}
      <div style={{
        position: 'relative',
        padding: '16px 18px',
        background: 'linear-gradient(135deg, rgba(54,224,212,0.18) 0%, rgba(54,224,212,0.06) 50%, rgba(255,154,82,0.08) 100%)',
        borderBottom: '1px solid var(--brand-line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Globe / GS mark */}
          <div style={{
            width: 42, height: 42, borderRadius: 'var(--r-md)', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #36e0d4 0%, #1f9fa0 100%)',
            color: '#06121a', fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(54,224,212,0.25)',
          }}>GS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>GeoServer</h3>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '2px 9px', borderRadius: 'var(--r-pill)', fontSize: 10,
                fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em',
                background: connected ? 'rgba(108,216,168,0.15)' : state.error ? 'rgba(240,104,104,0.15)' : 'rgba(255,255,255,0.06)',
                color: connected ? '#bff5d8' : state.error ? '#ffc4c4' : 'var(--brand-muted)',
                border: `1px solid ${connected ? 'rgba(108,216,168,0.4)' : state.error ? 'rgba(240,104,104,0.4)' : 'var(--brand-line)'}`,
              }}>
                <span style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                  background: dotColor,
                  animation: dotPulse ? 'gs-pulse 1.4s ease-in-out infinite' : undefined,
                }} />
                {state.loading ? 'checking' : state.error ? 'offline' : 'connected'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 4 }}>
              OGC services · workspace <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 3, color: 'var(--brand-text)' }}>{state.workspace}</code> · your propos login also works as GeoServer login
            </div>
          </div>
          {/* Stat block */}
          <div style={{
            display: 'flex', gap: 14, flexShrink: 0,
            paddingLeft: 14, borderLeft: '1px solid var(--brand-line)',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div className="micro" style={{ fontSize: 9 }}>LAYERS</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--brand-text)' }}>
                {state.loading ? '…' : state.layers.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action grid — coloured tiles per intent ── */}
      <div style={{
        padding: 16,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10,
        borderBottom: '1px solid var(--brand-line)',
      }}>
        {[
          { label: 'Open GeoServer admin', sub: 'browse / publish layers, edit styles', icon: '↗',
            tone: { bg: 'rgba(54,224,212,0.10)', border: 'rgba(54,224,212,0.35)', icon: '#36e0d4', hover: 'rgba(54,224,212,0.16)' },
            onClick: () => window.open(`${apiOrigin}/geoserver/web/`, '_blank', 'noopener') },
          { label: 'Copy WMS URL', sub: 'GetCapabilities · QGIS / ArcGIS', icon: '⎘',
            tone: { bg: 'rgba(106,155,232,0.10)', border: 'rgba(106,155,232,0.35)', icon: '#6a9be8', hover: 'rgba(106,155,232,0.16)' },
            onClick: () => copy(wmsUrl, 'WMS GetCapabilities') },
          { label: 'Copy WFS URL', sub: 'GetCapabilities · vector features', icon: '⎘',
            tone: { bg: 'rgba(106,155,232,0.10)', border: 'rgba(106,155,232,0.35)', icon: '#6a9be8', hover: 'rgba(106,155,232,0.16)' },
            onClick: () => copy(wfsUrl, 'WFS GetCapabilities') },
        ].map(t => (
          <button key={t.label} type="button" onClick={t.onClick}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.tone.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.tone.bg; }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              background: t.tone.bg, border: `1px solid ${t.tone.border}`,
              borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
              transition: 'background 120ms, border-color 120ms',
              color: 'var(--brand-text)', fontFamily: 'inherit',
            }}>
            <span style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 'var(--r-sm)',
              background: 'rgba(0,0,0,0.25)', color: t.tone.icon,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>{t.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{t.label}</span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--brand-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{t.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ── Import from GeoServer (reference, not copy) ── */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ display: 'inline-block', width: 4, height: 14, background: 'var(--brand-bim)', borderRadius: 2 }} />
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--brand-text)' }}>Reference a GeoServer layer</h4>
          <span className="micro" style={{ marginLeft: 'auto' }}>links by reference · GS stays source of truth</span>
        </div>
        <form onSubmit={importFromGs} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 220 }}>
            <select value={picked} onChange={(e) => setPicked(e.target.value)} disabled={busy || state.loading}
              style={{ width: '100%', padding: '8px 10px', background: 'var(--brand-bg-2)', color: 'var(--brand-text)', border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
              <option value="">{state.loading ? 'loading layers…' : state.layers.length === 0 ? 'no layers in workspace yet' : `— choose from ${state.layers.length} layer${state.layers.length === 1 ? '' : 's'} —`}</option>
              {state.layers.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Input placeholder="local name (optional)" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          </div>
          <Button type="submit" variant="primary" leftIcon="+" loading={busy} disabled={!picked || busy}>Add reference</Button>
        </form>
        {state.error && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(240,104,104,0.10)', border: '1px solid rgba(240,104,104,0.35)', borderRadius: 'var(--r-md)', color: '#ffc4c4', fontSize: 12 }}>
            <strong>Couldn't reach GeoServer:</strong> {state.error}
          </div>
        )}
      </div>

      {/* ── Danger zone — re-sync overwrites GS state ── */}
      <div style={{
        padding: '10px 16px',
        background: 'rgba(255,154,82,0.06)',
        borderTop: '1px solid rgba(255,154,82,0.25)',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--brand-muted)' }}>
          ⚠ Re-publishes every layer of this project to GeoServer. Useful after editing features directly in QGIS / psql.
        </span>
        <button type="button" onClick={resync} disabled={busy}
          style={{
            padding: '6px 12px', borderRadius: 'var(--r-md)', cursor: busy ? 'progress' : 'pointer',
            background: 'rgba(255,154,82,0.18)', border: '1px solid rgba(255,154,82,0.5)',
            color: '#ffd1a8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
          }}>
          ⟳ Re-sync layers
        </button>
      </div>

      <style>{`
        @keyframes gs-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

// ─── GIS overlays tab — list + toggle + add (file + URL) + routing + download + delete ──
function OverlaysPanel({ project, overlays, loading, push, refresh, who }) {
  const isAdmin = !!(who && who.is_admin);
  const [pendingId, setPendingId]   = React.useState(null);  // for toggle / mark / download / delete
  const [addMode, setAddMode]       = React.useState(null);  // null | 'url' | 'file'
  const [showMap, setShowMap]       = React.useState(true);
  const [url, setUrl]               = React.useState('');
  const [name, setName]             = React.useState('');
  const [file, setFile]             = React.useState(null);
  const [busy, setBusy]             = React.useState(false);
  const [pct, setPct]               = React.useState(0);
  const [addErr, setAddErr]         = React.useState(null);
  const fileRef = React.useRef(null);

  function isRouting(layer) {
    return !!(layer && (layer.is_routing || layer.routing || (layer.layer_type || '').toLowerCase().includes('routing')));
  }

  async function toggle(layer) {
    setPendingId(layer.id);
    try {
      const next = !layer.visible;
      await _api(`/projects/${project.id}/gis-layers/${layer.id}`, {
        method: 'PATCH', body: JSON.stringify({ visible: next }),
      });
      push({ tone: 'success', title: next ? `Enabled ${layer.name}` : `Hidden ${layer.name}` });
      refresh();
    } catch (err) {
      push({ tone: 'error', title: 'Could not toggle layer', description: err.message });
    } finally { setPendingId(null); }
  }

  async function markRouting(layer) {
    if (!window.confirm(`Mark "${layer.name}" as a road network?\n\nThis builds pgRouting topology on its LineString features so the optimiser can route on them.`)) return;
    setPendingId(layer.id);
    try {
      const d = await _api(`/projects/${project.id}/gis-layers/${layer.id}/mark-as-routing`, { method: 'POST' });
      push({ tone: 'success', title: 'Marked as routing layer',
        description: d && d.edges != null ? `${d.edges.toLocaleString()} edges, ${(d.vertices || 0).toLocaleString()} vertices` : undefined });
      refresh();
    } catch (err) {
      push({ tone: 'error', title: 'Mark-as-routing failed', description: err.message });
    } finally { setPendingId(null); }
  }

  async function unmarkRouting(layer) {
    if (!window.confirm(`Unmark "${layer.name}" as a routing layer?`)) return;
    setPendingId(layer.id);
    try {
      await _api(`/projects/${project.id}/gis-layers/${layer.id}/unmark-routing`, { method: 'POST' });
      push({ tone: 'success', title: 'Unmarked routing layer' });
      refresh();
    } catch (err) {
      push({ tone: 'error', title: 'Unmark failed', description: err.message });
    } finally { setPendingId(null); }
  }

  async function download(layer) {
    setPendingId(layer.id);
    try {
      const r = await fetch(`/projects/${project.id}/gis-layers/${layer.id}/export`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url2 = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `${(layer.name || 'layer').replace(/[^a-zA-Z0-9._-]+/g, '-')}.geojson`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url2), 1000);
    } catch (err) {
      push({ tone: 'error', title: 'Download failed', description: err.message });
    } finally { setPendingId(null); }
  }

  async function del(layer) {
    if (!window.confirm(`Delete layer "${layer.name}"?\n\nThis removes the layer from the project. The original data file (if any) is left on disk.`)) return;
    setPendingId(layer.id);
    try {
      await _api(`/projects/${project.id}/gis-layers/${layer.id}`, { method: 'DELETE' });
      push({ tone: 'success', title: `Deleted ${layer.name}` });
      refresh();
    } catch (err) {
      push({ tone: 'error', title: 'Delete failed', description: err.message });
    } finally { setPendingId(null); }
  }

  function resetAdd() { setUrl(''); setName(''); setFile(null); setAddErr(null); setPct(0); setAddMode(null); }

  async function addFromUrl(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true); setAddErr(null);
    try {
      const body = { url: url.trim() };
      if (name.trim()) body.name = name.trim();
      const data = await _api(`/projects/${project.id}/gis-layers/from-url`, {
        method: 'POST', body: JSON.stringify(body),
      });
      const layer = data && (data.layer || data);
      push({ tone: 'success', title: 'Overlay added',
        description: (layer && layer.name) ? `${layer.name}${data.features_added != null ? ` · ${data.features_added} features` : ''}` : undefined });
      resetAdd();
      refresh();
    } catch (err) {
      setAddErr(err.message);
      push({ tone: 'error', title: 'Could not add overlay', description: err.message });
    } finally { setBusy(false); }
  }

  async function addFromFile(e) {
    e.preventDefault();
    if (!file) { setAddErr('Pick a file first'); return; }
    setBusy(true); setAddErr(null); setPct(0);
    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/projects/${project.id}/gis-layers`);
        const auth = window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken();
        if (auth) xhr.setRequestHeader('Authorization', 'Bearer ' + auth);
        xhr.upload.onprogress = (e2) => { if (e2.lengthComputable) setPct(Math.round(100 * e2.loaded / e2.total)); };
        xhr.onload  = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({}); }
          } else { reject(new Error(`${xhr.status} ${xhr.responseText || xhr.statusText}`)); }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        const fd = new FormData();
        fd.append('file', file);
        if (name.trim()) fd.append('name', name.trim());
        xhr.send(fd);
      });
      const layer = data && data.layer;
      push({ tone: 'success', title: 'Overlay added',
        description: layer ? `${layer.name}${data.features_added != null ? ` · ${data.features_added} features` : ''}` : file.name });
      resetAdd();
      refresh();
    } catch (err) {
      setAddErr(err.message);
      push({ tone: 'error', title: 'Upload failed', description: err.message });
    } finally { setBusy(false); setPct(0); }
  }

  if (loading) {
    return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}><Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING OVERLAYS</div></div>;
  }

  // ── Add modal (URL or File) ──
  if (addMode) {
    return (
      <Card title={addMode === 'url' ? 'Add overlay from URL' : 'Upload overlay file'}
        subtitle={addMode === 'url'
          ? 'WMS, WFS, GeoJSON, KML, TopoJSON, MVT — backend infers the source type'
          : 'GeoJSON, KML, Shapefile (.zip), GeoPackage (.gpkg) — backend infers from the file extension'}
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" variant={addMode === 'url'  ? 'primary' : 'ghost'} onClick={() => { setAddMode('url');  setAddErr(null); }}>URL</Button>
            <Button size="sm" variant={addMode === 'file' ? 'primary' : 'ghost'} onClick={() => { setAddMode('file'); setAddErr(null); }}>File</Button>
            <button type="button" onClick={resetAdd} aria-label="Close"
              style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)', color: 'var(--brand-muted)', borderRadius: 'var(--r-md)', width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>×</button>
          </div>
        }>
        {addMode === 'url' ? (
          <form onSubmit={addFromUrl} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="URL" placeholder="https://example.org/data.geojson  or  https://wfs.example.org/?service=WFS&…"
              fullWidth required type="url"
              value={url} onChange={(e) => { setUrl(e.target.value); setAddErr(null); }}
              error={addErr || undefined} />
            <Input label="Layer name (optional)" placeholder="auto-derived from the URL if blank"
              fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" disabled={busy} onClick={resetAdd}>Cancel</Button>
              <Button type="submit" variant="primary" loading={busy} disabled={!url.trim() || busy}>
                {busy ? 'Fetching…' : 'Fetch + add'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={addFromFile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div onClick={() => !busy && fileRef.current && fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { setFile(f); setAddErr(null); } }}
              style={{
                padding: 24, textAlign: 'center', cursor: busy ? 'progress' : 'pointer',
                border: '1px dashed var(--brand-line-strong)', borderRadius: 'var(--r-md)',
                color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
              }}>
              <div style={{ marginBottom: 6, fontSize: 22 }}>↥</div>
              <div>{busy
                ? `Uploading… ${pct}%`
                : file ? `Selected: ${file.name} (${Math.round((file.size || 0) / 1024).toLocaleString()} KB)`
                  : 'Drop a GeoJSON / KML / Shapefile (.zip) / GeoPackage here or click to browse'}</div>
              {busy && (
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand-bim)', transition: 'width 120ms' }} />
                </div>
              )}
              <input ref={fileRef} type="file" hidden
                accept=".geojson,.json,.kml,.kmz,.zip,.gpkg,.topojson"
                onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) { setFile(f); setAddErr(null); } e.target.value = ''; }} />
            </div>
            <Input label="Layer name (optional)" placeholder="auto-derived from the filename if blank"
              fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            {addErr && <div style={{ color: 'var(--brand-error, #f88)', fontSize: 12 }}>{addErr}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" disabled={busy} onClick={resetAdd}>Cancel</Button>
              <Button type="submit" variant="primary" loading={busy} disabled={!file || busy}>
                {busy ? `Uploading… ${pct}%` : 'Upload + add'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isAdmin && <GeoServerCard project={project} push={push} refresh={refresh} />}

      {overlays.length > 0 && (
        <Card title="Preview map"
          subtitle="2D preview of every visible layer · toggle layers in the list below to show/hide them"
          action={<Button size="sm" variant="ghost" onClick={() => setShowMap(s => !s)}>{showMap ? 'Hide' : 'Show'}</Button>}>
          {showMap && <LayerPreviewMap project={project} overlays={overlays} />}
        </Card>
      )}

      <Card title="GIS overlays"
        subtitle={`${overlays.length} layer${overlays.length === 1 ? '' : 's'} on this project`}
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" variant="ghost"   leftIcon="↥" onClick={() => setAddMode('file')}>Upload file</Button>
            <Button size="sm" variant="primary" leftIcon="+" onClick={() => setAddMode('url')}>From URL</Button>
          </div>
        } dense>
      {overlays.length === 0 ? (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--brand-muted)' }}>
          <div className="micro" style={{ marginBottom: 8 }}>NO OVERLAYS YET</div>
          <div style={{ fontSize: 'var(--fs-small)' }}>Upload a GeoJSON/KML/Shapefile file, or add a WFS/WMS endpoint or GeoJSON URL.</div>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {overlays.map((l, i) => {
            const routing = isRouting(l);
            const isPending = pendingId === l.id;
            return (
              <li key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--brand-line)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 'var(--r-sm)', background: routing ? 'var(--brand-warn, #fec060)' : 'var(--brand-gis)' }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 'var(--fs-body)' }}>
                      {l.name}
                      {routing && <Pill tone="warn" style={{ marginLeft: 8 }}>routing</Pill>}
                    </span>
                    <span className="micro" style={{ display: 'block', marginTop: 2 }}>
                      {l.layer_type || l.source || '—'}
                      {l.feature_count != null && ` · ${l.feature_count.toLocaleString()} features`}
                      {l.geometry_type && ` · ${l.geometry_type}`}
                    </span>
                  </span>
                </span>
                <Toggle checked={!!l.visible} disabled={isPending} onChange={() => toggle(l)} />
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {routing
                    ? <Button size="sm" variant="ghost" disabled={isPending} onClick={() => unmarkRouting(l)}>Unmark routing</Button>
                    : <Button size="sm" variant="ghost" disabled={isPending} onClick={() => markRouting(l)}>Mark as routing</Button>}
                  <Button size="sm" variant="ghost" disabled={isPending} onClick={() => download(l)}>Download</Button>
                  <Button size="sm" variant="ghost" disabled={isPending} onClick={() => del(l)}>Delete</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      </Card>
    </div>
  );
}

// ─── Sharing tab — grant/revoke/leave collaborators ───────────────────────
function SharingPanel({ project, who, push }) {
  const [state, setState]  = React.useState({ loading: true, is_owner: false, people: [], error: null });
  const [email, setEmail]  = React.useState('');
  const [busy,  setBusy]   = React.useState(false);
  const [grantErr, setErr] = React.useState(null);

  const load = React.useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const data = await _api(`/projects/${project.id}/shares`);
      setState({ loading: false, is_owner: !!data.is_owner, people: data.people || [], error: null });
    } catch (err) {
      setState({ loading: false, is_owner: false, people: [], error: err.message });
    }
  }, [project.id]);

  React.useEffect(() => { load(); }, [load]);

  async function grant(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setErr(null);
    try {
      const data = await _api(`/projects/${project.id}/shares`, {
        method: 'POST', body: JSON.stringify({ email: email.trim() }),
      });
      push({ tone: 'success', title: 'Access granted', description: (data && data.collaborator && data.collaborator.email) || email.trim() });
      setEmail('');
      load();
    } catch (err) {
      setErr(err.message);
      push({ tone: 'error', title: 'Grant failed', description: err.message });
    } finally { setBusy(false); }
  }

  async function revoke(p) {
    const youAreLeaving = !state.is_owner && p.id === (who && who.id);
    const verb = youAreLeaving ? 'Leave this project' : `Revoke ${p.email}'s access`;
    if (!window.confirm(`${verb}?`)) return;
    try {
      await _api(`/projects/${project.id}/shares/${p.id}`, { method: 'DELETE' });
      push({ tone: 'success', title: youAreLeaving ? 'Left the project' : `Revoked ${p.email}` });
      if (youAreLeaving) { window.location.hash = 'projects'; return; }
      load();
    } catch (err) {
      push({ tone: 'error', title: 'Revoke failed', description: err.message });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Share this project"
        subtitle="Owners can grant access by email. Collaborators can upload, edit teams, and run the optimiser — only the owner can delete the project or manage sharing.">
        {state.is_owner ? (
          <form onSubmit={grant} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <Input label="Collaborator email" type="email" placeholder="user@example.com" fullWidth
                value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                error={grantErr || undefined} required />
            </div>
            <Button type="submit" variant="primary" leftIcon="+" loading={busy} disabled={!email.trim() || busy}>
              {busy ? 'Granting…' : 'Grant access'}
            </Button>
          </form>
        ) : (
          <div className="micro">You're a collaborator on this project — only the owner can grant or revoke access.</div>
        )}
      </Card>

      <Card title="People with access"
        subtitle={state.loading ? 'loading…' : `${state.people.length} ${state.people.length === 1 ? 'person' : 'people'}`} dense>
        {state.loading ? (
          <div style={{ padding: 30, textAlign: 'center' }}><Spinner size="sm" /></div>
        ) : state.error ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--brand-error, #f88)', fontSize: 13 }}>{state.error}</div>
        ) : state.people.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--brand-muted)' }} className="micro">NO COLLABORATORS YET</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {state.people.map((p, i) => {
              const isMe = who && p.id === who.id;
              const canRevoke = state.is_owner && p.role !== 'owner';
              const canLeave  = !state.is_owner && isMe && p.role === 'collaborator';
              const tone = p.role === 'owner' ? 'warn' : 'info';
              return (
                <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--brand-line)' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 'var(--fs-body)' }}>
                      {p.email}{isMe && <span className="micro" style={{ marginLeft: 8 }}>(you)</span>}
                    </span>
                    <span className="micro" style={{ display: 'block', marginTop: 2 }}>{p.display_name || '—'}</span>
                  </span>
                  <Pill tone={tone}>{p.role}</Pill>
                  {canRevoke ? <Button size="sm" variant="ghost" onClick={() => revoke(p)}>Revoke</Button>
                    : canLeave ? <Button size="sm" variant="ghost" onClick={() => revoke(p)}>Leave</Button>
                    : <span style={{ width: 72 }} />}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────
function ProjectScreen({ project, who, nav, onMenu, onBack, onOpenMap, onOpenModels }) {
  const mobile = _useIsMobile();
  const [tab, setTab] = React.useState('overview');
  const [toasts, setToasts] = React.useState([]);
  const [models,   setModels]   = React.useState({ items: [], loading: true, error: null });
  const [overlays, setOverlays] = React.useState({ items: [], loading: true, error: null });

  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4200);
  };

  const loadModels = React.useCallback(async () => {
    if (!project || !project.id) return;
    setModels(s => ({ ...s, loading: true }));
    try {
      const data = await _api(`/projects/${project.id}/ingest-status`);
      setModels({ items: data.items || [], loading: false, error: null });
    } catch (err) { setModels({ items: [], loading: false, error: err.message }); }
  }, [project && project.id]);

  const loadOverlays = React.useCallback(async () => {
    if (!project || !project.id) return;
    setOverlays(s => ({ ...s, loading: true }));
    try {
      const data = await _api(`/projects/${project.id}/gis-layers`);
      setOverlays({ items: data.layers || [], loading: false, error: null });
    } catch (err) { setOverlays({ items: [], loading: false, error: err.message }); }
  }, [project && project.id]);

  React.useEffect(() => { loadModels(); loadOverlays(); }, [loadModels, loadOverlays]);

  if (!project || !project.id) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu} nav={nav} who={who} />
        <main style={{ flex: 1, padding: '60px 24px', maxWidth: 720, margin: '0 auto' }}>
          <EmptyState icon="◇" title="No project selected"
            description="Pick a project from the Projects page to see its details."
            action={<Button variant="primary" onClick={() => { window.location.hash = 'projects'; }}>Back to Projects</Button>} />
        </main>
        <Footer brand="BIM·GIS Platform · 2026" right={<span>v0.6.0</span>} />
      </div>
    );
  }

  const tone = (project.model_count || 0) > 0 ? 'ok' : 'neutral';
  const status = (project.model_count || 0) > 0 ? 'active' : 'empty';

  const items = [
    { value: 'overview',  label: 'Overview' },
    { value: 'models',    label: 'Models',       count: project.model_count ?? models.items.length },
    { value: 'teams',     label: 'Teams' },
    { value: 'orders',    label: 'Work orders' },
    { value: 'optimize',  label: 'Optimize' },
    { value: 'overlays',  label: 'GIS overlays', count: overlays.items.length },
    { value: 'sharing',   label: 'Sharing' },
  ];

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#projects', label: 'Projects', active: true }]} who={who}>
        <button onClick={onBack} className="bp-btn bp-btn--sm bp-btn--ghost" style={{ marginLeft: 4 }} aria-label="Back to projects">←</button>
      </SiteHeader>

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '24px 24px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            <div className="micro" style={{ marginBottom: 6 }}>Project · {project.id.slice(0, 8)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'var(--fs-h1)', margin: 0 }}>{project.name}</h1>
              <Pill tone={tone} dot={tone !== 'neutral'}>{status}</Pill>
            </div>
            <div className="micro" style={{ marginTop: 6 }}>{project.description || 'No description'} · created {_fmtDate(project.created_at)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" leftIcon="◎" onClick={onOpenMap}>Open map</Button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--brand-line)', marginBottom: 20, overflowX: 'auto' }}>
          <Tabs items={items} value={tab} onChange={setTab} />
        </div>

        {tab === 'overview'  && <OverviewPanel project={project} models={models.items} modelsLoading={models.loading} overlays={overlays.items} overlaysLoading={overlays.loading} />}
        {tab === 'models'    && <ModelsPanel mobile={mobile} models={models.items} loading={models.loading} project={project} onOpenMap={onOpenMap} push={push} refresh={loadModels} />}
        {tab === 'teams'     && <TeamsPanel project={project} push={push} />}
        {tab === 'orders'    && <OrdersPanel project={project} push={push} onOpenMap={onOpenMap} />}
        {tab === 'optimize'  && <OptimizePanel project={project} push={push} />}
        {tab === 'overlays'  && <OverlaysPanel project={project} overlays={overlays.items} loading={overlays.loading} push={push} refresh={loadOverlays} who={who} />}
        {tab === 'sharing'   && <SharingPanel project={project} who={who} push={push} />}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.6.0</span>} />

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>

      <style>{`
        @media (max-width: 720px) {
          .bp-proj-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .bp-proj-overview { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .bp-proj-kpis { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.ProjectScreen = ProjectScreen;
