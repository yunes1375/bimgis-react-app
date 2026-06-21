const {
  SiteHeader, Footer, Card, Pill, Input, PasswordInput, Button, Toast, ToastStack, Spinner,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

async function _api(path, opts = {}) {
  const headers = opts.body && !(opts.body instanceof FormData)
    ? { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    : opts.headers;
  const r = await fetch(path, { ...opts, headers });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text().catch(() => '')) || r.statusText}`);
  if (r.status === 204) return null;
  return r.json();
}

function _initials(s) {
  return (s || '?').split(/[ .@]+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase();
}
function _fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso.slice(0, 16); }
}

function AccountScreen({ who, nav, onMenu, onSignOut }) {
  const [me, setMe] = React.useState(() => window.PlatformAuth?.getUser() || null);
  const [loading, setLoading] = React.useState(!me);
  const [cur, setCur] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [pwErr, setPwErr] = React.useState('');
  const [pwBusy, setPwBusy] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4200);
  };

  // Always re-fetch from /auth/me so freshly-changed display_name is current.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await _api('/auth/me');
        if (!cancelled) {
          setMe(data);
          setLoading(false);
          // also keep PlatformAuth cache fresh
          const cur = window.PlatformAuth?.get();
          if (cur) localStorage.setItem('propos.auth', JSON.stringify({ ...cur, user: data }));
        }
      } catch (err) {
        if (!cancelled) { setLoading(false); push({ tone: 'error', title: 'Couldn’t load profile', description: err.message }); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();
    setPwErr('');
    if (!cur) { setPwErr('Enter your current password.'); return; }
    if (next.length < 8) { setPwErr('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setPwErr('New password and confirmation do not match.'); return; }
    setPwBusy(true);
    try {
      await _api('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: cur, new_password: next }),
      });
      setCur(''); setNext(''); setConfirm('');
      push({ tone: 'success', title: 'Password updated', description: 'Use the new password next sign-in.' });
    } catch (err) {
      setPwErr(err.message);
      push({ tone: 'error', title: 'Password update failed', description: err.message });
    } finally {
      setPwBusy(false);
    }
  };

  const name = me?.display_name || me?.email || who?.name || 'You';
  const email = me?.email || who?.email || '—';
  const role = me?.is_admin ? { label: 'Admin', tone: 'warn' } : { label: 'Member', tone: 'neutral' };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#account', label: 'Account', active: true }]} who={who} />

      <main style={{ flex: 1, width: '100%', maxWidth: 480, margin: '0 auto', padding: '32px 24px 48px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="micro" style={{ marginBottom: 6 }}>Account</div>
          <h1 style={{ fontSize: 'var(--fs-h1)', margin: 0 }}>Your profile</h1>
        </div>

        <Card variant="accent">
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}><Spinner /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: '#06121a',
                background: 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))',
              }}>{_initials(name)}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h2)', fontWeight: 600, letterSpacing: '-0.01em' }}>{name}</div>
                <div style={{ fontSize: 'var(--fs-body)', color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{email}</div>
              </div>
              <Pill tone={role.tone} dot>{role.label}</Pill>

              {me && (
                <dl style={{ width: '100%', marginTop: 14, padding: '12px 16px', borderTop: '1px solid var(--brand-line)', display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  <dt style={{ color: 'var(--brand-faint)' }}>JOINED</dt>
                  <dd style={{ margin: 0, color: 'var(--brand-muted)', textAlign: 'right' }}>{_fmtDate(me.created_at)}</dd>
                  <dt style={{ color: 'var(--brand-faint)' }}>LAST LOGIN</dt>
                  <dd style={{ margin: 0, color: 'var(--brand-muted)', textAlign: 'right' }}>{_fmtDate(me.last_login_at)}</dd>
                </dl>
              )}
            </div>
          )}
        </Card>

        <Card title="Change password">
          <form onSubmit={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PasswordInput label="Current password" fullWidth autoComplete="current-password"
              value={cur} onChange={(e) => { setCur(e.target.value); setPwErr(''); }} />
            <PasswordInput label="New password" fullWidth autoComplete="new-password"
              value={next} onChange={(e) => { setNext(e.target.value); setPwErr(''); }}
              hint={!pwErr ? 'At least 8 characters.' : undefined} />
            <PasswordInput label="Confirm new password" fullWidth autoComplete="new-password"
              value={confirm} onChange={(e) => { setConfirm(e.target.value); setPwErr(''); }}
              error={pwErr || undefined} />
            <Button type="submit" variant="primary" fullWidth loading={pwBusy} disabled={!cur || !next || !confirm || pwBusy}>
              {pwBusy ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </Card>

        <Button variant="danger" onClick={onSignOut} style={{ alignSelf: 'center' }}>Sign out</Button>
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.2.0</span>} />

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>
    </div>
  );
}

window.AccountScreen = AccountScreen;
