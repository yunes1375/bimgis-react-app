const {
  SiteHeader, Footer, KpiTile, FilterSearch, DataTable, StackedCardTable,
  Card, Input, Pill, Button, EmptyState, Toast, ToastStack, Spinner,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

function _useIsMobileM(bp = 720) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const on = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

async function _api(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  return r.json();
}

// ─── Global Upload IFC card with project picker ──────────────────────────
function GlobalIfcUploader({ projects, projectsLoading, onUploaded, push }) {
  const fileRef = React.useRef(null);
  const [projectId, setProjectId] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [pct,  setPct]  = React.useState(0);
  const [drag, setDrag] = React.useState(false);

  React.useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0].id);
  }, [projects, projectId]);

  async function upload(file) {
    if (!file)      { push({ tone: 'error', title: 'Pick a file first' }); return; }
    if (!projectId) { push({ tone: 'error', title: 'Pick a project to attach the model to' }); return; }
    setBusy(true); setPct(0);
    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/projects/${projectId}/ifc`);
        const auth = window.PlatformAuth && window.PlatformAuth.getToken && window.PlatformAuth.getToken();
        if (auth) xhr.setRequestHeader('Authorization', 'Bearer ' + auth);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round(100 * e.loaded / e.total)); };
        xhr.onload  = () => {
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

  const projectName = (projects.find(p => p.id === projectId) || {}).name || '—';
  const noProjects  = !projectsLoading && projects.length === 0;

  return (
    <Card title="Upload IFC"
      subtitle={projectsLoading ? 'Loading projects…' : noProjects ? 'Create a project first' : `Attach to project: ${projectName}`}
      action={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={busy || projectsLoading || noProjects}
            style={{
              padding: '6px 10px', minWidth: 200,
              background: 'var(--brand-bg-2)', color: 'var(--brand-text)',
              border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-mono)', fontSize: 12,
            }}>
            {projectsLoading && <option value="">Loading…</option>}
            {noProjects && <option value="">No projects yet</option>}
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Button size="sm" variant="primary" leftIcon="↥" disabled={busy || noProjects || !projectId}
            onClick={() => fileRef.current && fileRef.current.click()}>
            {busy ? `Uploading… ${pct}%` : 'Choose file'}
          </Button>
        </div>
      }>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !busy && !noProjects && projectId && fileRef.current && fileRef.current.click()}
        style={{
          padding: 24, textAlign: 'center', cursor: (busy || noProjects || !projectId) ? 'not-allowed' : 'pointer',
          border: `1px dashed ${drag ? 'var(--brand-bim)' : 'var(--brand-line-strong)'}`,
          background: drag ? 'rgba(54,224,212,0.06)' : 'transparent',
          borderRadius: 'var(--r-md)',
          color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
          transition: 'border-color 120ms, background 120ms',
          opacity: (noProjects || !projectId) && !busy ? 0.5 : 1,
        }}>
        <div style={{ marginBottom: 6, fontSize: 22 }}>↥</div>
        <div>{busy ? `Uploading… ${pct}%` : noProjects ? 'No projects to attach a model to' : 'Drop an .ifc file here or click to browse'}</div>
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

function ModelsScreen({ who, nav, onMenu, onOpen3D, onOpenAR }) {
  const mobile = _useIsMobileM();
  const [q, setQ] = React.useState('');
  const [state, setState] = React.useState({ loading: true, error: null, models: [] });
  const [projects, setProjects] = React.useState({ loading: true, items: [] });
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4200);
  };

  const loadModels = React.useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const data = await _api('/models');
      setState({ loading: false, error: null, models: data.models || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, models: [] });
    }
  }, []);

  React.useEffect(() => {
    loadModels();
    (async () => {
      try {
        const data = await _api('/projects');
        setProjects({ loading: false, items: data.projects || [] });
      } catch { setProjects({ loading: false, items: [] }); }
    })();
  }, [loadModels]);

  const filtered = state.models.filter(m => (m.model_id + '').toLowerCase().includes(q.toLowerCase()));
  const ready    = state.models.filter(m => m.has_tileset).length;
  const pending  = state.models.filter(m => !m.has_tileset).length;
  const withWOs  = state.models.filter(m => (m.work_orders || 0) > 0).length;

  const cols = [
    { key: 'model_id', header: 'Model', sortable: true, render: r => (
      <a href="#map" onClick={(e) => { e.preventDefault(); onOpen3D && onOpen3D(r); }}
         style={{ color: 'var(--brand-text)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand-line-strong)' }}>{r.model_id}</a>
    ) },
    { key: 'has_tileset', header: 'Status', render: r => r.has_tileset ? <Pill tone="ok" dot>ready</Pill> : <Pill tone="warn" dot>no tileset</Pill> },
    { key: 'entities', header: 'Entities', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{(r.entities ?? 0).toLocaleString()}</span> },
    { key: 'geometry_rows', header: 'Geometry', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{(r.geometry_rows ?? 0).toLocaleString()}</span> },
    { key: 'work_orders', header: 'WOs', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: (r.work_orders || 0) > 0 ? 'var(--brand-bim)' : 'var(--brand-faint)' }}>{r.work_orders ?? 0}</span> },
  ];
  const actions = r => (
    <React.Fragment>
      <Button size="sm" variant="secondary" leftIcon="⊞" disabled={!r.has_tileset} onClick={() => onOpen3D && onOpen3D(r)}>3D</Button>
      <Button size="sm" variant="ghost" leftIcon="◎" disabled={!r.has_tileset} onClick={() => onOpenAR && onOpenAR(r)}>AR</Button>
    </React.Fragment>
  );

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#models', label: 'Models', active: true }]} who={who} />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '28px 24px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="micro" style={{ marginBottom: 6 }}>Catalogue</div>
            <h1 style={{ fontSize: 'var(--fs-h1)', margin: 0 }}>Models</h1>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <GlobalIfcUploader
            projects={projects.items}
            projectsLoading={projects.loading}
            onUploaded={loadModels}
            push={push} />
        </div>

        {state.loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}>
            <Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING MODELS</div>
          </div>
        ) : state.error ? (
          <EmptyState icon="!" title="Couldn't load models" description={state.error}
            action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>} />
        ) : (
          <React.Fragment>
            <div className="bp-models-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <KpiTile label="Total models" value={state.models.length} />
              <KpiTile label="Ready (tileset)" value={ready} tone={ready > 0 ? 'ok' : 'default'} />
              <KpiTile label="Pending" value={pending} tone={pending > 0 ? 'warn' : 'default'} />
              <KpiTile label="With WOs" value={withWOs} tone={withWOs > 0 ? 'bim' : 'default'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <FilterSearch value={q} onChange={setQ} placeholder="Search by model_id…"
                count={{ matched: filtered.length, total: state.models.length }} onClear={() => setQ('')} />
            </div>

            {state.models.length === 0 ? (
              <EmptyState icon="⊞" title="No models yet"
                description="Upload an IFC above to populate the catalogue." />
            ) : filtered.length === 0 ? (
              <EmptyState icon="⌕" title="No matching models" description="Try a different model_id." />
            ) : mobile ? (
              <StackedCardTable columns={cols} rows={filtered} rowKey={r => r.model_id} actions={actions} />
            ) : (
              <DataTable columns={cols} rows={filtered} rowKey={r => r.model_id} caption={`${filtered.length} of ${state.models.length} models`} actions={actions} />
            )}
          </React.Fragment>
        )}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.3.0</span>} />

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>

      <style>{`
        @media (max-width: 720px) { .bp-models-kpis { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 420px) { .bp-models-kpis { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

window.ModelsScreen = ModelsScreen;
