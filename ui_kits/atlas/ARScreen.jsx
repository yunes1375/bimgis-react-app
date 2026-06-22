const {
  SiteHeader, Card, Pill, Button, Spinner, Toast, ToastStack,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

async function _api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  return r.json();
}

function _fmtBytes(n) {
  if (n == null) return '—';
  if (n < 1024)            return n + ' B';
  if (n < 1024 * 1024)     return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 ** 3)       return (n / 1024 / 1024).toFixed(1) + ' MB';
  return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

// ─── WebXR capability detection (immersive-vr / immersive-ar) ────────────
function useXrCaps() {
  // null = checking, true = supported, false = unavailable
  const [vr, setVr] = React.useState(null);
  const [ar, setAr] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.xr) { setVr(false); setAr(false); return; }
      try {
        const v = await navigator.xr.isSessionSupported('immersive-vr');
        if (!cancelled) setVr(v);
      } catch { if (!cancelled) setVr(false); }
      try {
        const a = await navigator.xr.isSessionSupported('immersive-ar');
        if (!cancelled) setAr(a);
      } catch { if (!cancelled) setAr(false); }
    })();
    return () => { cancelled = true; };
  }, []);
  return { vr, ar };
}

function CapPill({ label, state }) {
  const tone = state === true ? 'ok' : state === false ? 'error' : 'neutral';
  const text = state === null ? 'checking…' : state === true ? 'supported' : 'unavailable';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      padding: '8px 12px', background: 'var(--brand-bg-2)',
      border: '1px solid var(--brand-line)', borderRadius: 'var(--r-md)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--brand-text)' }}>{label}</span>
      <Pill tone={tone} dot={state !== null}>{text}</Pill>
    </div>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div style={{
      padding: '12px 14px', background: 'var(--brand-bg-2)',
      border: '1px solid var(--brand-line)', borderRadius: 'var(--r-md)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span className="micro">{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--brand-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {hint && <span style={{ fontSize: 10, color: 'var(--brand-faint)' }}>{hint}</span>}
    </div>
  );
}

function ARScreen({ who, nav, onMenu, onBack, modelId, project }) {
  const [models, setModels]   = React.useState({ loading: true, error: null, items: [], allItems: [], scopeName: null });
  const [picked, setPicked]   = React.useState(null);
  const [projects, setProjects] = React.useState({ loading: true, items: [] });
  // Filter dropdown: '' = all projects, otherwise project.id.
  // Default to the project we arrived from (Models tab click); if AR was
  // hit directly via #ar the field starts at "all projects".
  const [filterPid, setFilterPid] = React.useState(project && project.id ? project.id : '');
  const [glbSize, setGlbSize] = React.useState(null);
  const [error, setError]     = React.useState(null);
  const [toasts, setToasts]   = React.useState([]);
  const xr = useXrCaps();
  const mvRef = React.useRef(null);

  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3600);
  };

  // Re-sync filterPid when the prop-passed project changes (e.g. the user
  // navigated from a different project's row).
  React.useEffect(() => {
    if (project && project.id) setFilterPid(project.id);
  }, [project && project.id]);

  // Load every project the user can access (for the filter dropdown).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/projects');
        if (!cancelled) setProjects({ loading: false, items: data.projects || [] });
      } catch {
        if (!cancelled) setProjects({ loading: false, items: [] });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load models; intersect with the picked project's model_ids when the
  // filter is set, otherwise show every tileset-ready model.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/models');
        if (cancelled) return;
        const allReady = (data.models || []).filter(m => m.has_tileset);
        let items = allReady;
        let scopeName = null;
        if (filterPid) {
          try {
            const proj = await _api(`/projects/${filterPid}`);
            const ids = new Set(proj.model_ids || []);
            items = allReady.filter(m => ids.has(m.model_id));
            scopeName = proj.name || null;
          } catch { /* fall through to global list */ }
        }
        if (cancelled) return;
        setModels({ loading: false, error: null, items, allItems: allReady, scopeName });

        // Prefer the prop-passed modelId. Look it up across both the
        // scoped list AND the full list so a deep-link to a model that
        // doesn't belong to the current filter still resolves.
        if (modelId) {
          const hit = items.find(m => m.model_id === modelId) || allReady.find(m => m.model_id === modelId);
          if (hit) { setPicked(hit); return; }
        }
        setPicked(prev => prev || items[0] || null);
      } catch (err) {
        if (!cancelled) setModels({ loading: false, error: err.message, items: [], allItems: [], scopeName: null });
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPid, modelId]);

  // Fetch GLB size via HEAD whenever the picked model changes.
  React.useEffect(() => {
    if (!picked || !picked.model_id) { setGlbSize(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/tiles/${encodeURIComponent(picked.model_id)}/model.glb`, { method: 'HEAD' });
        if (cancelled) return;
        const len = r.headers.get('content-length');
        setGlbSize(len ? parseInt(len, 10) : null);
      } catch { if (!cancelled) setGlbSize(null); }
    })();
    return () => { cancelled = true; };
  }, [picked && picked.model_id]);

  // Wire model-viewer error → React state.
  React.useEffect(() => {
    const mv = mvRef.current; if (!mv) return;
    const onErr = (e) => {
      const msg = (e.detail && (e.detail.sourceError && e.detail.sourceError.message)) || e.detail || 'unknown error';
      setError(`glTF load failed: ${msg}`);
    };
    const onLoad = () => setError(null);
    mv.addEventListener('error', onErr);
    mv.addEventListener('load', onLoad);
    return () => { mv.removeEventListener('error', onErr); mv.removeEventListener('load', onLoad); };
  }, [picked && picked.model_id]);

  async function enterVR() {
    setError(null);
    const mv = mvRef.current; if (!mv) return;
    try {
      if (typeof mv.activateVR === 'function') { await mv.activateVR(); return; }
      // Older model-viewer falls back to AR session if VR is unavailable.
      if (typeof mv.activateAR === 'function') { mv.activateAR(); }
    } catch (e) {
      try { mv.activateAR && mv.activateAR(); }
      catch { setError('No immersive session available — try a WebXR-capable browser.'); }
    }
  }

  async function enterAR() {
    setError(null);
    const mv = mvRef.current; if (!mv) return;
    try {
      if (typeof mv.activateAR === 'function') {
        mv.activateAR();
      } else {
        setError('AR is not supported on this device / browser.');
      }
    } catch (e) {
      setError('AR launch failed: ' + (e && e.message ? e.message : 'unknown'));
    }
  }

  const glbUrl = picked && picked.model_id ? `/tiles/${encodeURIComponent(picked.model_id)}/model.glb` : null;
  const viewerUrl = picked && picked.model_id ? `/app/viewer.html?model=${encodeURIComponent(picked.model_id)}` : null;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--brand-bg-1)' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#ar', label: 'AR / VR', active: true }]} who={who}>
        {onBack && <button onClick={onBack} className="bp-btn bp-btn--sm bp-btn--ghost" style={{ marginLeft: 4 }} aria-label="Back">←</button>}
      </SiteHeader>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 380px)', gap: 16, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '20px 16px 32px', boxSizing: 'border-box' }} className="bp-ar-main">

        {/* ── model-viewer stage ── */}
        <div style={{
          position: 'relative', minHeight: 'min(70vh, 640px)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          background: 'radial-gradient(120% 80% at 50% 0%, #15242c 0%, #0c141b 55%, #070b11 100%)',
          border: '1px solid var(--brand-line)',
        }}>
          {!picked ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-muted)', gap: 10 }}>
              {models.loading ? <Spinner size="lg" /> : (
                <React.Fragment>
                  <div className="micro">
                    {filterPid && models.scopeName
                      ? `NO TILESET-READY MODELS IN ${models.scopeName.toUpperCase()}`
                      : 'NO MODELS WITH TILESETS'}
                  </div>
                  <p style={{ fontSize: 13, maxWidth: 320, textAlign: 'center', margin: 0 }}>
                    {models.error || (
                      filterPid && models.allItems.length > 0
                        ? <>{models.allItems.length} model{models.allItems.length === 1 ? '' : 's'} elsewhere — <button onClick={() => setFilterPid('')} style={{ background: 'none', border: 'none', color: 'var(--brand-bim)', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}>switch to All projects</button>?</>
                        : 'Upload an IFC from a project page and let the worker build its tileset, then come back.'
                    )}
                  </p>
                </React.Fragment>
              )}
            </div>
          ) : (
            // model-viewer is a custom element; React treats it as plain HTML.
            // We pass attributes as strings (React lowercases unknown DOM props,
            // which matches model-viewer's expected attribute names).
            React.createElement('model-viewer', {
              ref: mvRef,
              src: glbUrl,
              ar: true,
              'ar-modes': 'webxr scene-viewer quick-look',
              'ar-scale': 'auto',
              'camera-controls': true,
              'auto-rotate': true,
              'shadow-intensity': '0.5',
              exposure: '1.0',
              'environment-image': 'neutral',
              'tone-mapping': 'commerce',
              'interaction-prompt': 'none',
              style: { width: '100%', height: '100%', display: 'block', background: 'transparent' },
            }, React.createElement('button', {
              slot: 'ar-button',
              style: {
                position: 'absolute', bottom: 24, right: 24,
                padding: '10px 16px',
                background: 'linear-gradient(145deg, rgba(54,224,212,0.32), rgba(54,224,212,0.16))',
                color: '#d5fce8',
                border: '1px solid rgba(54,224,212,0.55)',
                borderRadius: 'var(--r-md)',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
                cursor: 'pointer',
              },
            }, '⊞ Enter AR'))
          )}

          {/* Picked-model badge top-left */}
          {picked && (
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 5,
              padding: '6px 12px', background: 'rgba(9,11,17,0.82)',
              border: '1px solid var(--brand-line)', borderRadius: 'var(--r-pill)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-text)',
              backdropFilter: 'blur(6px)',
            }}>
              <span style={{ color: 'var(--brand-bim)', marginRight: 6 }}>●</span>
              {picked.model_id}
            </div>
          )}
        </div>

        {/* ── Right rail: model picker + capabilities + actions ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {/* Header */}
          <div>
            <div className="micro" style={{ marginBottom: 4 }}>AR / VR field mode</div>
            <h1 style={{ fontSize: 'var(--fs-h2)', margin: 0 }}>Field & immersive</h1>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 6, lineHeight: 1.55 }}>
              Same glTF binary the 3D viewer embeds in its b3dm tiles. Drives Web · AR · VR from one source.
            </div>
          </div>

          {/* Model picker */}
          <Card title="Pick a model" dense
            subtitle={models.loading ? 'loading…' :
              filterPid && models.scopeName
                ? `${models.items.length} of ${models.scopeName} · ${models.allItems.length - models.items.length} elsewhere`
                : `${models.items.length} model${models.items.length === 1 ? '' : 's'} across ${projects.items.length || 'all'} project${projects.items.length === 1 ? '' : 's'}`}
            action={
              projects.items.length > 0 && (
                <select value={filterPid}
                  onChange={(e) => setFilterPid(e.target.value)}
                  title="Filter the picker to a project you have access to"
                  style={{
                    padding: '4px 8px', maxWidth: 180,
                    background: 'var(--brand-bg-2)', color: 'var(--brand-text)',
                    border: '1px solid var(--brand-line-strong)', borderRadius: 'var(--r-md)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                  }}>
                  <option value="">All projects ({projects.items.length})</option>
                  {projects.items.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.model_count != null ? ` · ${p.model_count}` : ''}
                    </option>
                  ))}
                </select>
              )
            }>
            {models.loading ? (
              <div style={{ padding: 24, textAlign: 'center' }}><Spinner size="sm" /></div>
            ) : models.items.length === 0 ? (
              <div style={{ padding: 14, textAlign: 'center', color: 'var(--brand-muted)' }} className="micro">{models.error || 'NO MODELS READY'}</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 220, overflow: 'auto' }}>
                {models.items.map((m, i) => {
                  const active = picked && picked.model_id === m.model_id;
                  return (
                    <li key={m.model_id}
                      onClick={() => setPicked(m)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                        borderTop: i === 0 ? 'none' : '1px solid var(--brand-line)',
                        background: active ? 'rgba(54,224,212,0.06)' : 'transparent',
                      }}>
                      <span style={{
                        width: 28, height: 28, flexShrink: 0, borderRadius: 'var(--r-sm)',
                        background: active ? 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))' : 'rgba(255,255,255,0.06)',
                        color: active ? '#06121a' : 'var(--brand-muted)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                      }}>⊞</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.model_id}</span>
                        <span className="micro" style={{ display: 'block', marginTop: 2 }}>{(m.entities ?? 0).toLocaleString()} entities</span>
                      </span>
                      {active && <Pill tone="ok" dot>active</Pill>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Capabilities */}
          <Card title="Device capabilities" dense subtitle="Android: WebXR / Scene Viewer · iOS: AR Quick Look · Desktop: Quest, Vision Pro, HoloLens over WebXR">
            <div style={{ display: 'grid', gap: 8, padding: '4px 0' }}>
              <CapPill label="WebXR (VR)" state={xr.vr} />
              <CapPill label="WebXR (AR)" state={xr.ar} />
            </div>
          </Card>

          {/* Actions */}
          <Card title="Actions" dense>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost"   leftIcon="◑" onClick={enterVR} disabled={!picked}>VR</Button>
              <Button variant="primary" leftIcon="⊞" onClick={enterAR} disabled={!picked}>AR</Button>
              {viewerUrl && (
                <a href={viewerUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--r-md)',
                    background: 'transparent', border: '1px solid var(--brand-line-strong)',
                    color: 'var(--brand-text)', fontSize: 13, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                  3D viewer ↗
                </a>
              )}
            </div>
            {error && (
              <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(240,104,104,0.10)', border: '1px solid rgba(240,104,104,0.35)', borderRadius: 'var(--r-md)', color: '#ffc4c4', fontSize: 12 }}>
                {error}
              </div>
            )}
          </Card>

          {/* Stats */}
          {picked && (
            <Card title="Same data layer" dense subtitle="exact glTF embedded in the Cesium b3dm">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <StatTile label="Graph entities" value={(picked.entities ?? 0).toLocaleString()} />
                <StatTile label="3D features"    value={(picked.geometry_rows ?? 0).toLocaleString()} />
                <StatTile label="Work orders"    value={(picked.work_orders ?? 0).toLocaleString()} />
                <StatTile label="Asset size"     value={_fmtBytes(glbSize)} hint="model.glb" />
              </div>
            </Card>
          )}
        </aside>
      </main>

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>

      <style>{`
        @media (max-width: 880px) {
          .bp-ar-main { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.ARScreen = ARScreen;
