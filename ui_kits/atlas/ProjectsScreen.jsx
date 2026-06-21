const {
  SiteHeader, Footer, FilterSearch, Card,
  KpiTile, Pill, Button, EmptyState, Spinner,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

async function _api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  return r.json();
}

function _fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso.slice(0, 10); }
}
function _shortId(uuid) { return (uuid || '').slice(0, 8); }

function _initial(name) {
  return (name || '?').trim().slice(0, 1).toUpperCase();
}

function ProjectCard({ project, onOpen }) {
  const hasModels = (project.model_count || 0) > 0;
  return (
    <article style={{
      background: 'var(--brand-surface)',
      border: '1px solid var(--brand-line)',
      borderRadius: 'var(--r-lg)',
      padding: 'var(--sp-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)',
      transition: 'border-color 120ms, transform 80ms',
    }}>
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: hasModels ? 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))' : 'rgba(255,255,255,.06)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: hasModels ? 'var(--brand-bg-1)' : 'var(--brand-muted)',
          fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700,
          flexShrink: 0,
        }}>{_initial(project.name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', letterSpacing: '.06em', color: 'var(--brand-faint)' }}>
              {_shortId(project.id)}
            </span>
            {hasModels
              ? <Pill tone="ok" dot>active</Pill>
              : <Pill tone="neutral">empty</Pill>}
          </div>
          <h3 style={{
            margin: '4px 0 0', fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)',
            fontWeight: 600, letterSpacing: '-0.005em', color: 'var(--brand-text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{project.name || '—'}</h3>
        </div>
      </header>

      {project.description && (
        <p style={{
          margin: 0, color: 'var(--brand-muted)', fontSize: 'var(--fs-small)',
          lineHeight: 1.5, minHeight: '2.6em',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{project.description}</p>
      )}

      <dl style={{
        margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 11,
      }}>
        <div>
          <dt style={{ color: 'var(--brand-faint)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Models</dt>
          <dd style={{ margin: '2px 0 0', color: 'var(--brand-text)', fontWeight: 600, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
            {project.model_count ?? 0}
          </dd>
        </div>
        <div>
          <dt style={{ color: 'var(--brand-faint)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Created</dt>
          <dd style={{ margin: '2px 0 0', color: 'var(--brand-muted)', fontSize: 12 }}>{_fmtDate(project.created_at)}</dd>
        </div>
      </dl>

      <Button variant={hasModels ? 'primary' : 'default'} fullWidth onClick={() => onOpen(project)} disabled={!hasModels}>
        {hasModels ? 'Open project' : 'No models yet'}
      </Button>
    </article>
  );
}

function ProjectsScreen({ onOpenProject, onMenu, who, nav, onSignOut }) {
  const [state, setState] = React.useState({ loading: true, error: null, projects: [] });
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/projects');
        if (!cancelled) setState({ loading: false, error: null, projects: data.projects || [] });
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, projects: [] });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = state.projects
    .filter(p => (p.name + ' ' + (p.description || '') + ' ' + p.id).toLowerCase().includes(q.toLowerCase()))
    .slice()
    .sort((a, b) => (b.model_count || 0) - (a.model_count || 0) || a.name.localeCompare(b.name));

  const totalModels = state.projects.reduce((s, p) => s + (p.model_count || 0), 0);
  const withModels = state.projects.filter(p => (p.model_count || 0) > 0).length;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#projects', label: 'Projects', active: true }, { href: '#models', label: 'Models' }, { href: '#admin', label: 'Admin' }, { href: '#account', label: 'Account' }]}
        who={who} />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '28px 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="micro" style={{ marginBottom: 6 }}>Workspace</div>
            <h1 style={{ fontSize: 32, margin: 0 }}>Projects</h1>
          </div>
          <Button variant="primary" leftIcon="+" disabled title="Create coming soon">New project</Button>
        </div>

        {state.loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}>
            <Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING PROJECTS</div>
          </div>
        ) : state.error ? (
          <EmptyState icon="!" title="Couldn't load projects" description={state.error}
            action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>} />
        ) : (
          <React.Fragment>
            <div className="bp-proj-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <KpiTile label="Projects" value={state.projects.length} />
              <KpiTile label="With models" value={withModels} tone={withModels > 0 ? 'ok' : 'default'} />
              <KpiTile label="Models indexed" value={totalModels.toLocaleString()} tone="ok" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <FilterSearch value={q} onChange={setQ} placeholder="Search projects, descriptions, IDs…"
                count={{ matched: filtered.length, total: state.projects.length }} onClear={() => setQ('')} />
            </div>

            {state.projects.length === 0 ? (
              <EmptyState icon="◇" title="No projects yet"
                description="Create your first project to start uploading IFC models and GIS overlays."
                action={<Button variant="primary" leftIcon="+" disabled>New project</Button>} />
            ) : filtered.length === 0 ? (
              <EmptyState icon="⌕" title="No matching projects" description="Try a different name, description or ID." />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 14,
              }}>
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} onOpen={onOpenProject} />
                ))}
              </div>
            )}
          </React.Fragment>
        )}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.2.0</span>} />

      <style>{`
        @media (max-width: 720px) {
          .bp-proj-kpis { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .bp-proj-kpis { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.ProjectsScreen = ProjectsScreen;
