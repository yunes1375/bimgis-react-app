const {
  SiteHeader, Footer, Card, KpiTile, Pill, Button,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

const L_FEATURES = [
  { glyph: '⊞', title: 'BIM models', body: 'Import IFC structural, MEP and architectural models. Inspect 248 to 3,000+ elements per storey with full property tables.' },
  { glyph: '◳', title: 'GIS overlays', body: 'Drape cadastral parcels, utilities and WFS feeds over the same coordinate space. Georeference to any EPSG.' },
  { glyph: '◎', title: 'Work orders', body: 'Turn drift and clash findings into assignable field tasks. Track priority, team and due date to sign-off.' },
];

const L_USECASES = [
  { who: 'Asset owners', tone: 'bim', props: ['Portfolio drift report', 'ISO 19650 records', 'Single source of truth'] },
  { who: 'Operators', tone: 'gis', props: ['Live overlay status', 'Utility conflict checks', 'Maintenance routing'] },
  { who: 'Field crews', tone: 'neutral', props: ['AR on-site placement', 'GPS-anchored survey', 'Offline re-snap'] },
];

const L_STEPS = [
  { n: '01', title: 'Upload IFC', body: 'Drop a model file. The parser indexes every element and its georeference metadata.' },
  { n: '02', title: 'Place on map', body: 'Snap the model footprint to its parcel. Inspect drift in centimetres, then re-snap.' },
  { n: '03', title: 'Plan work', body: 'Raise work orders from findings and assign them to the right team with a due date.' },
];

const L_FAQ = [
  { q: 'Which file formats are supported?', a: 'IFC 2x3 and IFC4 for models; GeoJSON, WFS and CSV control points for GIS overlays. Raster DEM tiles for terrain.' },
  { q: 'What coordinate systems can I use?', a: 'Any EPSG-registered CRS. Models are reprojected on import; the default workspace projection is EPSG:3857 (Web Mercator).' },
  { q: 'How is drift measured?', a: 'Drift is the planar offset between a model control point and its surveyed GIS position, reported in metres with easting/northing components.' },
  { q: 'Is field use offline-capable?', a: 'AR field mode caches the active model and last basemap tiles. Anchors and re-snap offsets sync when the device reconnects.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--brand-line)' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--brand-text)' }}>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>{q}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-bim)', fontSize: 18 }}>{open ? '−' : '+'}</span>
      </button>
      {open && <p style={{ margin: '0 0 18px', color: 'var(--brand-muted)', fontSize: 'var(--fs-body)', lineHeight: 1.55, maxWidth: 640 }}>{a}</p>}
    </div>
  );
}

function Section({ children, style }) {
  return <section style={{ maxWidth: 1080, width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box', ...style }}>{children}</section>;
}

function LandingScreen({ onSignIn, onMenu, nav }) {
  const marketingNav = [
    { href: '#features', label: 'Features' },
    { href: '#usecases', label: 'Use cases' },
    { href: '#faq', label: 'FAQ' },
  ];
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu} nav={marketingNav}>
        <span style={{ flex: 1 }} />
        <Button variant="primary" size="sm" onClick={onSignIn} className="bp-landing-signin">Sign in</Button>
      </SiteHeader>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="bp-grid-backdrop" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.9 }} />
        <Section style={{ position: 'relative', zIndex: 1, padding: '72px 24px 64px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 20 }}>
            <Pill tone="bim" dot>BIM × GIS · one coordinate space</Pill>
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.05, margin: '0 auto 16px', maxWidth: 760, letterSpacing: '-0.02em' }}>
            BIM × GIS for asset operators
          </h1>
          <p style={{ fontSize: 'var(--fs-h3)', color: 'var(--brand-muted)', lineHeight: 1.55, margin: '0 auto 28px', maxWidth: 560 }}>
            Overlay building models onto live geographic basemaps. Georeference, inspect drift in centimetres, and re-snap alignment in the field.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={onSignIn}>Sign in</Button>
            <Button variant="secondary" size="lg" rightIcon="→">Read docs</Button>
          </div>
        </Section>
      </div>

      {/* Trust strip */}
      <Section style={{ paddingTop: 8, paddingBottom: 56 }}>
        <div className="bp-landing-trust" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KpiTile label="Models indexed" value="12k" tone="ok" />
          <KpiTile label="Routing accuracy" value="94%" />
          <KpiTile label="Query p50" value="3 ms" tone="ok" />
          <KpiTile label="Standard" value="ISO 19650" />
        </div>
      </Section>

      {/* Feature grid */}
      <Section id="features" style={{ paddingBottom: 56 }}>
        <div className="micro" style={{ marginBottom: 10 }}>Platform</div>
        <h2 style={{ fontSize: 'var(--fs-h2)', margin: '0 0 24px' }}>One workspace, two domains</h2>
        <div className="bp-landing-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {L_FEATURES.map(f => (
            <Card key={f.title}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span aria-hidden style={{ fontSize: 26, lineHeight: 1, color: 'var(--brand-bim)' }}>{f.glyph}</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>{f.title}</span>
                <span style={{ color: 'var(--brand-muted)', fontSize: 'var(--fs-small)', lineHeight: 1.55 }}>{f.body}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Use cases */}
      <Section id="usecases" style={{ paddingBottom: 56 }}>
        <div className="micro" style={{ marginBottom: 10 }}>Built for</div>
        <h2 style={{ fontSize: 'var(--fs-h2)', margin: '0 0 24px' }}>Whoever owns the asset</h2>
        <div className="bp-landing-uc" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {L_USECASES.map(u => (
            <Card key={u.who} variant="accent">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>{u.who}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                  {u.props.map(p => <Pill key={p} tone={u.tone} dot>{p}</Pill>)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section style={{ paddingBottom: 56 }}>
        <div className="micro" style={{ marginBottom: 10 }}>Workflow</div>
        <h2 style={{ fontSize: 'var(--fs-h2)', margin: '0 0 24px' }}>How it works</h2>
        <div className="bp-landing-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {L_STEPS.map(s => (
            <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px', border: '1px solid var(--brand-line)', borderRadius: 'var(--r-lg)', background: 'var(--brand-surface)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--brand-gis)', fontWeight: 600 }}>{s.n}</span>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>{s.title}</span>
              <span style={{ color: 'var(--brand-muted)', fontSize: 'var(--fs-small)', lineHeight: 1.55 }}>{s.body}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" style={{ paddingBottom: 56 }}>
        <div className="micro" style={{ marginBottom: 10 }}>Questions</div>
        <h2 style={{ fontSize: 'var(--fs-h2)', margin: '0 0 12px' }}>FAQ</h2>
        <div style={{ borderBottom: '1px solid var(--brand-line)' }}>
          {L_FAQ.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </Section>

      {/* Final CTA */}
      <Section style={{ paddingBottom: 72, textAlign: 'center' }}>
        <div style={{ border: '1px solid var(--brand-line)', borderRadius: 'var(--r-lg)', background: 'var(--brand-surface)', padding: '48px 24px' }}>
          <h2 style={{ fontSize: 'var(--fs-h2)', margin: '0 0 10px' }}>Put your model on the map</h2>
          <p style={{ color: 'var(--brand-muted)', margin: '0 auto 24px', maxWidth: 460, lineHeight: 1.55 }}>
            Start with one project. Upload an IFC, georeference it, and raise your first work order in minutes.
          </p>
          <Button variant="primary" size="lg" onClick={onSignIn}>Start your trial</Button>
        </div>
      </Section>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#docs', label: 'Docs' }, { href: '#pricing', label: 'Pricing' }, { href: '#legal', label: 'Legal' }, { href: '#contact', label: 'Contact' }]}
        right={<span>v0.1.0</span>} />

      <style>{`
        @media (max-width: 720px) {
          .bp-landing-trust { grid-template-columns: repeat(2, 1fr) !important; }
          .bp-landing-features, .bp-landing-uc, .bp-landing-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.LandingScreen = LandingScreen;
