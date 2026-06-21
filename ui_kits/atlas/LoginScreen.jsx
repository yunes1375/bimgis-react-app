const { Card, Input, PasswordInput, Button, Pill } = window.BIMGISBlueprintDesignSystem_f8b0c8;

function LoginScreen({ onSignIn }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await window.PlatformAuth.login(email.trim(), password);
      onSignIn();
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="bp-grid-backdrop"></div>
      <div style={{ width: 360, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <img src="../../assets/brandmark.svg" width="46" height="46" alt="BIM·GIS Platform" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>BIM·GIS Platform</div>
            <div className="micro" style={{ marginTop: 4 }}>Model · Site · One coordinate space</div>
          </div>
        </div>

        <Card variant="accent" style={{ boxShadow: 'var(--shadow-card)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Work email"
              type="email"
              fullWidth
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error ? ' ' : undefined}
            />
            <PasswordInput
              fullWidth
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error || undefined}
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={busy} disabled={!email || !password || busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>Reset password</a>
              <Pill tone="bim" dot>SSO ready</Pill>
            </div>
          </form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 18 }} className="micro">© 2026 BIM·GIS Platform · v0.2.0</div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
