const { Card, Input, PasswordInput, Button, Pill } = window.BIMGISBlueprintDesignSystem_f8b0c8;

function LoginScreen({ onSignIn }) {
  const [tab, setTab] = React.useState('login');     // 'login' | 'register'

  // Sign-in form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Register form state
  const [rName, setRName] = React.useState('');
  const [rEmail, setREmail] = React.useState('');
  const [rPassword, setRPassword] = React.useState('');
  const [rBusy, setRBusy] = React.useState(false);
  const [rError, setRError] = React.useState(null);
  const [rOk, setROk] = React.useState(null);   // success message

  async function submitLogin(e) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await window.PlatformAuth.login(email.trim(), password);
      onSignIn();
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally { setBusy(false); }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setRError(null); setROk(null); setRBusy(true);
    try {
      const r = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: rEmail.trim(),
          password: rPassword,
          display_name: rName.trim() || null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.detail || data.message || `HTTP ${r.status}`);

      // Two common back-end behaviours:
      // 1. /auth/register returns a {access_token, user} pair → auto sign-in
      // 2. /auth/register returns a success message only → prompt user to sign in
      if (data && data.access_token) {
        window.PlatformAuth.signIn(data);
        onSignIn();
        return;
      }

      // Try auto-login with the supplied creds — covers the case where the
      // server creates the account but doesn't return a token.
      try {
        await window.PlatformAuth.login(rEmail.trim(), rPassword);
        onSignIn();
        return;
      } catch {
        // Auto-login failed (e.g. server requires email verification first).
        // Fall through to success message + tab switch.
      }

      setROk(`Account created for ${rEmail.trim()}. You can sign in now.`);
      setEmail(rEmail.trim());
      setRName(''); setREmail(''); setRPassword('');
      setTimeout(() => setTab('login'), 1200);
    } catch (err) {
      setRError(err.message || 'Registration failed.');
    } finally { setRBusy(false); }
  }

  const tabBtn = (id, label) => (
    <button type="button" onClick={() => { setTab(id); setError(null); setRError(null); setROk(null); }}
      style={{
        flex: 1, padding: '8px 12px',
        background: tab === id ? 'rgba(54, 224, 212, 0.12)' : 'transparent',
        color: tab === id ? 'var(--brand-text)' : 'var(--brand-muted)',
        border: 'none',
        borderBottom: tab === id ? '2px solid var(--brand-bim)' : '2px solid transparent',
        fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'background 120ms, color 120ms, border-color 120ms',
      }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="bp-grid-backdrop"></div>
      <div style={{ width: 380, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <img src="../../assets/brandmark.svg" width="46" height="46" alt="BIM·GIS Platform" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>BIM·GIS Platform</div>
            <div className="micro" style={{ marginTop: 4 }}>Model · Site · One coordinate space</div>
          </div>
        </div>

        <Card variant="accent" style={{ boxShadow: 'var(--shadow-card)', padding: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--brand-line)' }}>
            {tabBtn('login', 'Sign in')}
            {tabBtn('register', 'Create account')}
          </div>
          <div style={{ padding: 20 }}>
            {tab === 'login' ? (
              <form onSubmit={submitLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rOk && <div style={{ padding: '8px 12px', background: 'rgba(108,216,168,0.15)', border: '1px solid rgba(108,216,168,0.4)', borderRadius: 'var(--r-md)', color: '#bff5d8', fontSize: 12 }}>{rOk}</div>}
                <Input label="Work email" type="email" fullWidth required autoComplete="username"
                  value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  error={error ? ' ' : undefined} />
                <PasswordInput fullWidth required autoComplete="current-password"
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  error={error || undefined} />
                <Button type="submit" variant="primary" size="lg" fullWidth loading={busy} disabled={!email || !password || busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </Button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" onClick={() => setTab('register')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                             fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)',
                             textTransform: 'uppercase', letterSpacing: '.08em', padding: 0 }}>
                    Don't have an account?
                  </button>
                  <Pill tone="bim" dot>SSO ready</Pill>
                </div>
              </form>
            ) : (
              <form onSubmit={submitRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Display name (optional)" fullWidth autoComplete="name"
                  value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Your name" />
                <Input label="Work email" type="email" fullWidth required autoComplete="email"
                  value={rEmail} onChange={(e) => { setREmail(e.target.value); setRError(null); }}
                  error={rError && /email|exist|taken/i.test(rError) ? rError : undefined} />
                <PasswordInput label="Password" fullWidth required autoComplete="new-password"
                  hint={!rError ? 'At least 8 characters.' : undefined}
                  value={rPassword} onChange={(e) => { setRPassword(e.target.value); setRError(null); }}
                  error={rError && !/email|exist|taken/i.test(rError) ? rError : undefined} />
                <Button type="submit" variant="primary" size="lg" fullWidth loading={rBusy}
                  disabled={!rEmail || rPassword.length < 8 || rBusy}>
                  {rBusy ? 'Creating account…' : 'Create account'}
                </Button>
                <button type="button" onClick={() => setTab('login')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                           fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)',
                           textTransform: 'uppercase', letterSpacing: '.08em', padding: 0, alignSelf: 'center' }}>
                  Already have an account? Sign in
                </button>
              </form>
            )}
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 18 }} className="micro">© 2026 BIM·GIS Platform · v0.6.0</div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
