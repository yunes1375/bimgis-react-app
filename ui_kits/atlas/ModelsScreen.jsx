const {
  SiteHeader, Footer, KpiTile, FilterSearch, DataTable, StackedCardTable,
  Pill, Button, EmptyState, Toast, ToastStack, Spinner,
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

function ModelsScreen({ who, nav, onMenu, onOpen3D, onOpenAR }) {
  const mobile = _useIsMobileM();
  const [q, setQ] = React.useState('');
  const [state, setState] = React.useState({ loading: true, error: null, models: [] });
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4200);
  };

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/models');
        if (!cancelled) setState({ loading: false, error: null, models: data.models || [] });
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, models: [] });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = state.models.filter(m => (m.model_id + '').toLowerCase().includes(q.toLowerCase()));

  const ready    = state.models.filter(m => m.has_tileset).length;
  const pending  = state.models.filter(m => !m.has_tileset).length;
  const withWOs  = state.models.filter(m => (m.work_orders || 0) > 0).length;

  const cols = [
    { key: 'model_id', header: 'Model', sortable: true, render: r => (
      <span>
        <a href="#map" onClick={(e) => { e.preventDefault(); onOpen3D && onOpen3D(r); }}
           style={{ color: 'var(--brand-text)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand-line-strong)' }}>
          {r.model_id}
        </a>
      </span>
    ) },
    { key: 'has_tileset', header: 'Status',
      render: r => r.has_tileset
        ? <Pill tone="ok" dot>ready</Pill>
        : <Pill tone="warn" dot>no tileset</Pill> },
    { key: 'entities', header: 'Entities', align: 'end',
      render: r => <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{(r.entities ?? 0).toLocaleString()}</span> },
    { key: 'geometry_rows', header: 'Geometry', align: 'end',
      render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{(r.geometry_rows ?? 0).toLocaleString()}</span> },
    { key: 'work_orders', header: 'WOs', align: 'end',
      render: r => <span style={{ fontFamily: 'var(--font-mono)', color: (r.work_orders || 0) > 0 ? 'var(--brand-bim)' : 'var(--brand-faint)' }}>{r.work_orders ?? 0}</span> },
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
          <Button variant="primary" leftIcon="↥" disabled title="Upload coming soon">Upload IFC</Button>
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
                description="Upload an IFC file from a project page to populate the catalogue." />
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
        right={<span>v0.2.0</span>} />

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
