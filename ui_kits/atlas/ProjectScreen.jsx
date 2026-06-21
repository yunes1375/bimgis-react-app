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

function OrdersPanel({ project }) {
  return (
    <EmptyState icon="≡"
      title="Work orders are scoped per-model"
      description={`This project has ${project.model_count || 0} model(s). Open a model in the 3D map and use the right-rail inspector to create or list work orders for its entities.`}
      action={<Button size="sm" variant="secondary" onClick={() => { window.location.hash = 'models'; }}>Open Models</Button>} />
  );
}

// ─── GIS overlays tab ─────────────────────────────────────────────────────
function OverlaysPanel({ project, overlays, loading, push, refresh }) {
  const [pendingId, setPendingId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [name, setName] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [addErr, setAddErr] = React.useState(null);

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
      push({ tone: 'success', title: 'Overlay added', description: (layer && layer.name) || (layer && layer.id) });
      setUrl(''); setName(''); setShowAdd(false);
      refresh();
    } catch (err) {
      setAddErr(err.message);
      push({ tone: 'error', title: 'Could not add overlay', description: err.message });
    } finally { setBusy(false); }
  }

  if (loading) {
    return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}><Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING OVERLAYS</div></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {showAdd ? (
        <Card title="Add overlay from URL"
          subtitle="WMS, WFS, GeoJSON, KML, TopoJSON, MVT — backend infers the source type"
          action={<button type="button" onClick={() => { setShowAdd(false); setAddErr(null); }} aria-label="Close"
            style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)', color: 'var(--brand-muted)', borderRadius: 'var(--r-md)', width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>×</button>}>
          <form onSubmit={addFromUrl} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="URL" placeholder="https://example.org/data.geojson  or  https://wfs.example.org/?service=WFS&…"
              fullWidth required type="url"
              value={url} onChange={(e) => { setUrl(e.target.value); setAddErr(null); }}
              error={addErr || undefined} />
            <Input label="Layer name (optional)" placeholder="auto-derived from the URL if blank"
              fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => { setShowAdd(false); setAddErr(null); }}>Cancel</Button>
              <Button type="submit" variant="primary" loading={busy} disabled={!url.trim() || busy}>
                {busy ? 'Fetching…' : 'Fetch + add'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="GIS overlays"
          subtitle={`${overlays.length} layer${overlays.length === 1 ? '' : 's'} on this project`}
          action={<Button size="sm" variant="primary" leftIcon="+" onClick={() => setShowAdd(true)}>Add overlay</Button>}
          dense>
          {overlays.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--brand-muted)' }}>
              <div className="micro" style={{ marginBottom: 8 }}>NO OVERLAYS YET</div>
              <div style={{ fontSize: 'var(--fs-small)' }}>Add a WFS/WMS endpoint or GeoJSON URL to overlay it on the project map.</div>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {overlays.map((l, i) => (
                <li key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--brand-line)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 'var(--r-sm)', background: 'var(--brand-gis)' }} />
                    <span>
                      <span style={{ fontSize: 'var(--fs-body)' }}>{l.name}</span>
                      <span className="micro" style={{ display: 'block', marginTop: 2 }}>{l.layer_type || l.source || '—'} · {l.feature_count != null ? `${l.feature_count} features` : '—'}</span>
                    </span>
                  </span>
                  <Toggle checked={!!l.visible} disabled={pendingId === l.id} onChange={() => toggle(l)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
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
        <Footer brand="BIM·GIS Platform · 2026" right={<span>v0.4.0</span>} />
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
        {tab === 'orders'    && <OrdersPanel project={project} />}
        {tab === 'overlays'  && <OverlaysPanel project={project} overlays={overlays.items} loading={overlays.loading} push={push} refresh={loadOverlays} />}
        {tab === 'sharing'   && <SharingPanel project={project} who={who} push={push} />}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.4.0</span>} />

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
