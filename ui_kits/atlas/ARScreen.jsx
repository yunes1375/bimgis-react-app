const {
  SiteHeader, Pill, KpiTile, FabPill, BasemapPicker, GpsAccuracyBadge,
  Button, Spinner, Panel, Toast, ToastStack,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

async function _api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  return r.json();
}

const _TONES = ['var(--brand-bim)', 'var(--brand-gis)', 'var(--brand-ok)', 'var(--brand-warn)'];

function ARScreen({ who, onMenu, onBack }) {
  const [models, setModels] = React.useState({ loading: true, error: null, items: [] });
  const [placed, setPlaced] = React.useState(null);
  const [stagingLoad, setStagingLoad] = React.useState(false);
  const [mode, setMode] = React.useState('walk');
  const [basemap, setBasemap] = React.useState('sat');
  const [sheet, setSheet] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3600);
  };

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/models');
        if (cancelled) return;
        const items = (data.models || [])
          .filter(m => m.has_tileset)
          .map((m, i) => ({ ...m, tone: _TONES[i % _TONES.length] }));
        setModels({ loading: false, error: null, items });
        if (items.length) setPlaced(items[0]);
      } catch (err) {
        if (!cancelled) setModels({ loading: false, error: err.message, items: [] });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!placed) return;
    setStagingLoad(true);
    const t = setTimeout(() => setStagingLoad(false), 900);
    return () => clearTimeout(t);
  }, [placed]);

  const place = (m) => { setPlaced(m); setSheet(false); push({ tone: 'info', title: 'Loading model', description: m.model_id }); };
  const saveAnchor = () => push({ tone: 'success', title: 'Anchor saved', description: 'GPS-anchored at current position.' });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-bg-3)' }}>
      <div className="bp-ar-phone" style={{
        position: 'relative', width: 'min(420px, 100%)', height: 'min(860px, 100%)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'radial-gradient(120% 80% at 50% 0%, #15242c 0%, #0c141b 55%, #070b11 100%)',
        border: '1px solid var(--brand-line)',
      }}>
        {/* slim header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 12px', flex: 'none', borderBottom: '1px solid var(--brand-line)', background: 'rgba(9,11,17,0.72)', backdropFilter: 'blur(8px)', zIndex: 5 }}>
          <button onClick={onBack} className="bp-btn bp-btn--sm bp-btn--ghost" aria-label="Back">←</button>
          <span style={{ width: 22, height: 22, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#06121a', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13 }}>B</span>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14 }}>AR field</span>
          <span style={{ flex: 1 }} />
          <button onClick={onMenu} className="bp-btn bp-btn--sm bp-btn--ghost" aria-label="Menu">☰</button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 12px', flex: 'none', zIndex: 5 }}>
          <Pill tone={'ARSession' in window || 'xr' in (navigator || {}) ? 'ok' : 'warn'} dot>AR {('xr' in (navigator || {})) ? 'supported' : 'demo'}</Pill>
          <Pill tone="bim" dot>GPS</Pill>
          <Pill tone="bim" dot>Compass</Pill>
        </div>

        {/* AR stage */}
        <div id="ar-stage" style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(54,138,224,0.10), transparent 40%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 38px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 38px)', transform: 'perspective(420px) rotateX(58deg)', transformOrigin: 'bottom', opacity: 0.7 }} />

          {placed && !stagingLoad && (
            <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', width: 132, height: 150 }}>
              <div style={{ position: 'absolute', inset: 0, border: `1.5px solid ${placed.tone}`, borderRadius: 2, background: `color-mix(in oklch, ${placed.tone} 16%, transparent)`, boxShadow: `0 0 28px color-mix(in oklch, ${placed.tone} 30%, transparent)`, transform: 'skewX(-12deg) scaleY(0.9)' }}>
                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#0c141b', padding: '1px 6px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', color: placed.tone, whiteSpace: 'nowrap' }}>{placed.model_id}</span>
              </div>
            </div>
          )}

          {(models.loading || stagingLoad) && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--brand-bim)', background: 'rgba(7,11,17,0.4)' }}>
              <Spinner size="lg" />
              <span className="micro">{models.loading ? 'Loading models…' : 'Placing model…'}</span>
            </div>
          )}

          {!models.loading && !placed && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--brand-muted)', textAlign: 'center', padding: 24 }}>
              <div className="micro">NO MODELS READY</div>
              <p style={{ fontSize: 13, maxWidth: 280, margin: 0 }}>{models.error || 'Upload an IFC from a project and generate its tileset to place it here.'}</p>
            </div>
          )}

          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
            <GpsAccuracyBadge accuracy={4} />
          </div>
          <div className="bp-ar-basemap" style={{ position: 'absolute', top: 12, right: 12, zIndex: 6 }}>
            <BasemapPicker value={basemap} onChange={setBasemap}
              options={[{ id: 'sat', label: 'Satellite', swatchColor: '#2c4a2c' }, { id: 'dark', label: 'Dark', swatchColor: '#11141d' }, { id: 'street', label: 'Streets', swatchColor: '#3a3f4a' }]} />
          </div>

          <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: 4, borderRadius: 'var(--r-pill)', background: 'rgba(15,25,45,0.92)', backdropFilter: 'blur(8px)', border: '1px solid var(--brand-line)', zIndex: 6 }}>
            <button onClick={() => setMode('walk')} className={`bp-btn bp-btn--sm ${mode === 'walk' ? 'bp-btn--primary' : 'bp-btn--ghost'}`} style={{ minHeight: 40, borderRadius: 'var(--r-pill)' }}>Walk</button>
            <button onClick={() => { setMode('manual'); push({ tone: 'info', title: 'Manual placement', description: 'Drag to position, pinch to rotate.' }); }} className={`bp-btn bp-btn--sm ${mode === 'manual' ? 'bp-btn--primary' : 'bp-btn--ghost'}`} style={{ minHeight: 40, borderRadius: 'var(--r-pill)' }}>Manual</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '10px 12px', flex: 'none' }}>
          <KpiTile label="Models ready" value={models.items.length} tone={models.items.length > 0 ? 'ok' : 'default'} />
          <KpiTile label="Placed" value={placed ? '1' : '0'} />
          <KpiTile label="Entities" value={placed ? (placed.entities ?? 0).toLocaleString() : '—'} />
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px', flex: 'none' }}>
          <Button variant="secondary" leftIcon="⊞" disabled={models.items.length === 0} onClick={() => setSheet(true)} style={{ minHeight: 44, flex: 1 }}>Models</Button>
          <Button variant="primary" leftIcon="◎" disabled={!placed} onClick={saveAnchor} style={{ minHeight: 44, flex: 1 }}>Save anchor</Button>
        </div>

        <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', opacity: sheet ? 1 : 0, pointerEvents: sheet ? 'auto' : 'none', transition: 'opacity .2s ease', zIndex: 20 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 21, transform: sheet ? 'translateY(0)' : 'translateY(102%)', transition: 'transform .26s cubic-bezier(0.22,1,0.36,1)' }}>
          <Panel title="Place a model" onClose={() => setSheet(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {models.items.map(m => (
                <div key={m.model_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, border: '1px solid var(--brand-line)', borderRadius: 'var(--r-md)', background: 'var(--brand-surface)' }}>
                  <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 'var(--r-sm)', border: `1.5px solid ${m.tone}`, background: `color-mix(in oklch, ${m.tone} 14%, transparent)`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: m.tone, fontSize: 16 }}>⊞</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 'var(--fs-small)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.model_id}</span>
                    <span className="micro">{(m.entities ?? 0).toLocaleString()} entities · {m.geometry_rows ?? 0} geom</span>
                  </span>
                  <Button size="sm" variant={placed?.model_id === m.model_id ? 'ghost' : 'secondary'} onClick={() => place(m)} style={{ minHeight: 40 }} disabled={placed?.model_id === m.model_id}>
                    {placed?.model_id === m.model_id ? 'Placed' : 'Place'}
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>

      <style>{`
        @media (max-width: 700px) { .bp-ar-basemap { display: none; } }
      `}</style>
    </div>
  );
}

window.ARScreen = ARScreen;
