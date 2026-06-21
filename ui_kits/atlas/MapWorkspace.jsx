const {
  Pill, Button, EmptyState, Spinner,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

async function _api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  return r.json();
}

// Inject CSS into the iframe to hide its built-in topbar (we render our own
// slim React topbar on top). Same-origin so direct DOM access works.
function injectIframeOverrides(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return;
    let s = doc.getElementById('atlas-live-overrides');
    if (s) return;
    s = doc.createElement('style');
    s.id = 'atlas-live-overrides';
    s.textContent = `
      .vp-topbar, .pp-topbar, .site-header, .ar-topbar { display: none !important; }
      body { padding-top: 0 !important; }
      #cesium, #cesium-container { top: 0 !important; height: 100vh !important; }
      #left-panel, #panel { top: 12px !important; max-height: calc(100vh - 24px) !important; }
    `;
    doc.head.appendChild(s);
  } catch (err) {
    // cross-origin (shouldn't happen — same host)
  }
}

function _initial(s) { return (s || '?').trim().slice(0, 1).toUpperCase(); }

function ModelPicker({ onPick, project }) {
  const [state, setState] = React.useState({ loading: true, error: null, models: [], scope: 'all' });
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/models');
        const all = (data.models || []).filter(m => m.has_tileset);
        if (cancelled) return;

        // Project scope: ask the backend which models belong to this project
        // by querying /models/{m}/project for each (no list endpoint exists).
        if (project?.id && !showAll) {
          const tagged = await Promise.all(all.map(async m => {
            try {
              const meta = await _api(`/models/${encodeURIComponent(m.model_id)}/project`);
              return { ...m, project_id: meta?.project_id, project_name: meta?.project_name };
            } catch {
              return { ...m, project_id: null };
            }
          }));
          if (cancelled) return;
          const mine = tagged.filter(m => m.project_id === project.id);
          setState({ loading: false, error: null, models: mine, scope: 'project' });
        } else {
          setState({ loading: false, error: null, models: all, scope: 'all' });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, models: [], scope: 'all' });
      }
    })();
    return () => { cancelled = true; };
  }, [project?.id, showAll]);

  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 'min(900px, 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(54,224,212,0.12)', border: '1px solid rgba(54,224,212,0.4)', borderRadius: 999, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-bim)' }} />
            <span className="micro" style={{ color: 'var(--brand-bim)' }}>STEP 1 · CHOOSE A MODEL</span>
          </div>
          {!state.loading && !state.error && (
            <div style={{ marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', color: 'var(--brand-faint)' }}>
              {state.scope === 'project' && project?.id
                ? <>SCOPE: <strong style={{ color: 'var(--brand-bim)' }}>{project.name}</strong> · {state.models.length} of project · v3</>
                : <>SCOPE: <strong style={{ color: 'var(--brand-gis)' }}>ALL MODELS</strong> · {state.models.length} total · v3</>}
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, margin: '0 0 8px', fontWeight: 600 }}>
            Click a model below to open the 3D viewer
          </h2>
          <p style={{ color: 'var(--brand-muted)', fontSize: 14, margin: 0, maxWidth: 540, marginInline: 'auto' }}>
            {project?.name && !showAll
              ? <>Pick which model from <strong style={{ color: 'var(--brand-text)' }}>{project.name}</strong> to load. Cesium will boot inside the panel below once you click.</>
              : <>The Cesium viewer will boot here once you pick a tileset-ready model.</>}
          </p>
          {project?.name && showAll && (
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => setShowAll(false)}
                style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)', color: 'var(--brand-muted)', borderRadius: 999, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                ← Filter to {project.name}
              </button>
            </div>
          )}
        </div>

        {state.loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--brand-muted)' }}>
            <Spinner /><div className="micro" style={{ marginTop: 12 }}>LOADING MODELS</div>
          </div>
        ) : state.error ? (
          <EmptyState icon="!" title="Couldn't load models" description={state.error}
            action={<Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>} />
        ) : state.models.length === 0 ? (
          <EmptyState icon="⊞"
            title={state.scope === 'project' ? `No tileset-ready models in “${project?.name || 'this project'}”` : 'No tileset-ready models'}
            description={state.scope === 'project'
              ? `This project has ${project?.model_count ?? 0} model(s), but none have a generated tileset yet, or they belong to a different project owner.`
              : 'Upload an IFC file and wait for tileset generation to open it in 3D.'}
            action={state.scope === 'project'
              ? <Button variant="primary" onClick={() => setShowAll(true)}>Show all models</Button>
              : undefined} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {state.models.map(m => (
              <button key={m.model_id} onClick={() => onPick(m.model_id)} style={{
                textAlign: 'left', padding: 16, background: 'var(--brand-surface)',
                border: '1px solid var(--brand-line)', borderRadius: 'var(--r-md)',
                cursor: 'pointer', color: 'var(--brand-text)', display: 'flex',
                flexDirection: 'column', gap: 10, transition: 'border-color 120ms, transform 80ms, background 120ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-bim)'; e.currentTarget.style.background = 'var(--brand-surface-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--brand-line)'; e.currentTarget.style.background = 'var(--brand-surface)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--brand-bg-1)', fontWeight: 700, fontFamily: 'var(--font-head)', fontSize: 16 }}>
                    {_initial(m.model_id)}
                  </span>
                  <span style={{
                    flex: 1, minWidth: 0, fontWeight: 600, fontSize: 14,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{m.model_id}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Pill tone="ok" dot>tileset</Pill>
                  {m.work_orders > 0 && <Pill tone="bim">{m.work_orders} WOs</Pill>}
                  {state.scope === 'all' && m.project_name && <Pill tone="neutral">{m.project_name}</Pill>}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-faint)' }}>
                  {(m.entities ?? 0).toLocaleString()} entities · {(m.geometry_rows ?? 0).toLocaleString()} geom
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--brand-line)', marginTop: 2 }}>
                  <span className="micro" style={{ color: 'var(--brand-bim)' }}>OPEN IN 3D</span>
                  <span style={{ color: 'var(--brand-bim)', fontSize: 16 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapWorkspace({ project, who, nav, onMenu, onBack, modelId, onPickModel }) {
  const iframeRef = React.useRef(null);
  const [chosen, setChosen] = React.useState(modelId || null);
  React.useEffect(() => { setChosen(modelId || null); }, [modelId]);

  const pickModel = (id) => { setChosen(id); if (onPickModel) onPickModel(id); };

  const src = chosen
    ? `/app/viewer.html?model=${encodeURIComponent(chosen)}`
    : null;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--brand-bg-1)' }}>
      {/* slim React topbar */}
      <header style={{
        height: 44, flex: 'none', display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', background: 'rgba(9,11,17,0.92)',
        borderBottom: '1px solid var(--brand-line)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        zIndex: 30, color: 'var(--brand-text)',
      }}>
        <button onClick={onBack} className="bp-btn bp-btn--sm bp-btn--ghost" aria-label="Back" style={{ minWidth: 32 }}>←</button>
        <span style={{
          width: 22, height: 22, borderRadius: 'var(--r-md)',
          background: 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand-bg-1)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>B</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)',
          letterSpacing: '.04em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
        }}>
          BIM·GIS Platform
          {project?.name && <> · {project.name}</>}
          {chosen && <> · {chosen}</>}
        </span>
        {chosen && <Pill tone="ok" dot>3D ready</Pill>}
        <span style={{ flex: 1 }} />
        {chosen && (
          <Button size="sm" variant="ghost" onClick={() => setChosen(null)} title="Choose a different model">
            Switch model
          </Button>
        )}
        <button onClick={onMenu} className="bp-btn bp-btn--sm bp-btn--ghost" aria-label="Menu" style={{ minWidth: 32 }}>☰</button>
      </header>

      {/* body — either the picker or the live Cesium iframe */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {!chosen ? (
          <ModelPicker onPick={pickModel} project={project} />
        ) : (
          <iframe
            ref={iframeRef}
            key={chosen /* force remount when model changes */}
            src={src}
            title="3D viewer"
            allow="geolocation; camera; xr-spatial-tracking; fullscreen; clipboard-write"
            onLoad={(e) => injectIframeOverrides(e.target)}
            style={{ display: 'block', width: '100%', height: '100%', border: 'none', background: '#000' }}
          />
        )}
      </div>
    </div>
  );
}

window.MapWorkspace = MapWorkspace;
