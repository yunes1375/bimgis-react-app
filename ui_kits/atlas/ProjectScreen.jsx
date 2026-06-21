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
function OptimizePanel({ project, push }) {
  const [solver, setSolver] = React.useState('ga');
  const [shared, setShared] = React.useState({ cruise_kmh: 30, service_minutes: 15, wo_per_member: 5 });
  const [ga, setGa]         = React.useState({ population: 80, generations: 120, crossover_rate: 0.85, mutation_rate: 0.20, alpha_time: 0, capacity_penalty_m: 500, beta_priority: 0, seed: '' });
  const [ot, setOt]         = React.useState({ ot_time_limit_s: 30, ot_first_solution: 'PATH_CHEAPEST_ARC', ot_metaheuristic: 'GUIDED_LOCAL_SEARCH' });
  const [roadLayerId, setRoadLayerId] = React.useState('');
  const [routingLayers, setRoutingLayers] = React.useState([]);
  const [running, setRunning]   = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus]     = React.useState('');
  const [log, setLog]           = React.useState([]);
  const [summary, setSummary]   = React.useState(null);
  const [history, setHistory]   = React.useState([]);
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
      const rl = (data.layers || []).filter(l => l.is_routing || l.routing || (l.layer_type || '').includes('routing'));
      setRoutingLayers(rl);
    } catch { setRoutingLayers([]); }
  }, [project.id]);

  React.useEffect(() => { loadHistory(); loadLayers(); }, [loadHistory, loadLayers]);

  function appendLog(line) {
    setLog(L => [...L.slice(-200), `[${new Date().toLocaleTimeString()}] ${line}`]);
  }

  async function deleteRun(id) {
    if (!window.confirm('Delete this run from history?')) return;
    try {
      await _api(`/projects/${project.id}/optimize/runs/${id}`, { method: 'DELETE' });
      push({ tone: 'success', title: 'Run deleted' });
      loadHistory();
    } catch (err) {
      push({ tone: 'error', title: 'Delete failed', description: err.message });
    }
  }

  function run() {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setRunning(true); setProgress(0); setStatus('starting…'); setLog([]); setSummary(null);

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
          setStatus(`gen ${m.generation}/${m.total_generations}  ·  best ${m.best_distance != null ? Math.round(m.best_distance).toLocaleString() : '?'} m`);
        } else if (m.message) {
          appendLog(m.message);
        }
      } else if (m.type === 'done') {
        setProgress(100);
        setStatus(`done — ${m.summary && m.summary.routes_count != null ? `${m.summary.routes_count} route(s)` : 'finished'}`);
        setSummary(m.summary || m.result || m);
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

  function input(label, val, onChange, opts) {
    return <Input label={label} type="number" value={val} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} {...(opts || {})} />;
  }

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

      {(running || progress > 0 || summary) && (
        <Card title="Progress" subtitle={status}>
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
          {summary && (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                ['Total distance', summary.total_distance_m != null ? `${Math.round(summary.total_distance_m / 1000)} km` : '—'],
                ['Routes',         summary.routes_count != null ? summary.routes_count : (summary.routes ? summary.routes.length : '—')],
                ['Unserved',       summary.unserved_count != null ? summary.unserved_count : '—'],
                ['Run ID',         summary.run_id || summary.id || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: 10, background: 'var(--brand-bg-2)', border: '1px solid var(--brand-line)', borderRadius: 'var(--r-md)' }}>
                  <div className="micro">{k}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--brand-text)', marginTop: 4 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          )}
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
                    {h.total_distance_m != null ? ` · ${Math.round(h.total_distance_m / 1000)} km` : ''}
                    {h.routes_count != null ? ` · ${h.routes_count} route${h.routes_count === 1 ? '' : 's'}` : ''}
                  </span>
                </span>
                <a href={`/projects/${project.id}/optimize/runs/${h.id}/export.zip${(window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken()) ? '?token=' + encodeURIComponent(window.PlatformAuth.getToken()) : ''}`}
                   style={{ fontSize: 12, color: 'var(--brand-bim)', textDecoration: 'none' }}>Export .zip</a>
                <Button size="sm" variant="ghost" onClick={() => deleteRun(h.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
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
        <Footer brand="BIM·GIS Platform · 2026" right={<span>v0.5.0</span>} />
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
        {tab === 'overlays'  && <OverlaysPanel project={project} overlays={overlays.items} loading={overlays.loading} push={push} refresh={loadOverlays} />}
        {tab === 'sharing'   && <SharingPanel project={project} who={who} push={push} />}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.5.0</span>} />

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
