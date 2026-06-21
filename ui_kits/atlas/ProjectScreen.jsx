const {
  SiteHeader, Footer, Tabs, Card, Pill, KpiTile, DataTable, StackedCardTable,
  FilterSearch, Button, Toggle, EmptyState, Toast, ToastStack, Spinner,
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
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  return r.json();
}

const _fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return iso.slice(0, 10); }
};

const _toneFor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'ready' || s === 'done' || s === 'aligned') return 'ok';
  if (s === 'pending' || s === 'importing' || s === 'in_progress' || s === 'in progress') return 'warn';
  if (s === 'failed' || s === 'error') return 'error';
  return 'neutral';
};

// ── tab panels (all data-loaded via fetch) ────────────────────────────────

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

function ModelsPanel({ mobile, models, loading, project, onOpenMap, push }) {
  if (loading) {
    return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}><Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING MODELS</div></div>;
  }
  if (models.length === 0) {
    const expected = project.model_count || 0;
    return (
      <EmptyState icon="⊞"
        title={expected > 0 ? `${expected} model(s) attached to this project` : 'No models in this project'}
        description={expected > 0
          ? 'The per-project model list endpoint is not wired yet — open the global Models page to see and manage them.'
          : 'Upload an IFC file to overlay it on the site basemap.'}
        action={<Button size="sm" variant={expected > 0 ? 'secondary' : 'primary'} onClick={() => { window.location.hash = 'models'; }}>
          {expected > 0 ? 'Open Models' : 'Upload IFC'}
        </Button>} />
    );
  }

  const cols = [
    { key: 'model_id', header: 'Model', sortable: true,
      render: r => <strong style={{ fontWeight: 600 }}>{r.model_id || r.name || '—'}</strong> },
    { key: 'status',   header: 'Status',
      render: r => <Pill tone={_toneFor(r.status)} dot={_toneFor(r.status) !== 'neutral'}>{r.status || '—'}</Pill> },
    { key: 'entities', header: 'Entities', align: 'end',
      render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{(r.entities ?? 0).toLocaleString()}</span> },
    { key: 'geometry_rows', header: 'Geometry', align: 'end',
      render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{(r.geometry_rows ?? 0).toLocaleString()}</span> },
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
}

function TeamsPanel({ project }) {
  return (
    <EmptyState icon="◌"
      title="Teams are managed per-model"
      description="Open a model in the 3D map to see its repair teams. A project-level teams roster is on the roadmap." />
  );
}

function OrdersPanel({ project, push }) {
  return (
    <EmptyState icon="≡"
      title="Work orders are scoped per-model"
      description={`This project has ${project.model_count || 0} model(s). Open a model in the 3D map and use the right-rail inspector to create or list work orders for its entities.`}
      action={<Button size="sm" variant="secondary" onClick={() => { window.location.hash = 'models'; }}>Open Models</Button>} />
  );
}

function OverlaysPanel({ project, overlays, loading, push, refresh }) {
  const [pendingId, setPendingId] = React.useState(null);

  async function toggle(layer) {
    setPendingId(layer.id);
    try {
      const next = !layer.visible;
      await _api(`/projects/${project.id}/gis-layers/${layer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: next }),
      });
      push({ tone: 'success', title: next ? `Enabled ${layer.name}` : `Hidden ${layer.name}` });
      refresh();
    } catch (err) {
      push({ tone: 'error', title: 'Could not toggle layer', description: err.message });
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}><Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING OVERLAYS</div></div>;
  }
  return (
    <Card title="GIS overlays"
      action={<Button size="sm" variant="primary" leftIcon="+" disabled title="Add overlay coming soon">Add overlay</Button>}
      dense>
      {overlays.length === 0 ? (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--brand-muted)' }}>
          <div className="micro" style={{ marginBottom: 8 }}>NO OVERLAYS YET</div>
          <div style={{ fontSize: 'var(--fs-small)' }}>Add a WFS layer or upload a GeoJSON to overlay it on the project map.</div>
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
  );
}

// ── screen ────────────────────────────────────────────────────────────────
function ProjectScreen({ project, who, nav, onMenu, onBack, onOpenMap, onOpenModels }) {
  const mobile = _useIsMobile();
  const [tab, setTab] = React.useState('overview');
  const [toasts, setToasts] = React.useState([]);
  const [models, setModels] = React.useState({ items: [], loading: true, error: null });
  const [overlays, setOverlays] = React.useState({ items: [], loading: true, error: null });

  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4200);
  };

  const loadModels = React.useCallback(async () => {
    if (!project?.id) return;
    setModels(s => ({ ...s, loading: true }));
    try {
      const data = await _api(`/projects/${project.id}/ingest-status`);
      setModels({ items: data.items || [], loading: false, error: null });
    } catch (err) {
      setModels({ items: [], loading: false, error: err.message });
    }
  }, [project?.id]);

  const loadOverlays = React.useCallback(async () => {
    if (!project?.id) return;
    setOverlays(s => ({ ...s, loading: true }));
    try {
      const data = await _api(`/projects/${project.id}/gis-layers`);
      setOverlays({ items: data.layers || [], loading: false, error: null });
    } catch (err) {
      setOverlays({ items: [], loading: false, error: err.message });
    }
  }, [project?.id]);

  React.useEffect(() => { loadModels(); loadOverlays(); }, [loadModels, loadOverlays]);

  // No project selected — user landed here directly via #project
  if (!project || !project.id) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu} nav={nav} who={who} />
        <main style={{ flex: 1, padding: '60px 24px', maxWidth: 720, margin: '0 auto' }}>
          <EmptyState icon="◇" title="No project selected"
            description="Pick a project from the Projects page to see its details."
            action={<Button variant="primary" onClick={() => { window.location.hash = 'projects'; }}>Back to Projects</Button>} />
        </main>
        <Footer brand="BIM·GIS Platform · 2026" right={<span>v0.2.0</span>} />
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
    { value: 'analytics', label: 'Analytics' },
    { value: 'overlays',  label: 'GIS overlays', count: overlays.items.length },
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
            <Button variant="ghost" onClick={() => push({ tone: 'info', title: 'Edit project name', description: 'Rename coming soon (PATCH /projects/{id}).' })}>Edit name</Button>
            <Button variant="secondary" leftIcon="◎" onClick={onOpenMap}>Open map</Button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--brand-line)', marginBottom: 20, overflowX: 'auto' }}>
          <Tabs items={items} value={tab} onChange={setTab} />
        </div>

        {tab === 'overview'  && <OverviewPanel project={project} models={models.items} modelsLoading={models.loading} overlays={overlays.items} overlaysLoading={overlays.loading} />}
        {tab === 'models'    && <ModelsPanel mobile={mobile} models={models.items} loading={models.loading} project={project} onOpenMap={onOpenMap} push={push} />}
        {tab === 'teams'     && <TeamsPanel project={project} />}
        {tab === 'orders'    && <OrdersPanel project={project} push={push} />}
        {tab === 'analytics' && (
          <EmptyState icon="◳" title="Analytics coming soon"
            description="Drift trends, import throughput and work-order burndown will appear here once the analytics service is connected." />
        )}
        {tab === 'overlays'  && <OverlaysPanel project={project} overlays={overlays.items} loading={overlays.loading} push={push} refresh={loadOverlays} />}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.2.0</span>} />

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
