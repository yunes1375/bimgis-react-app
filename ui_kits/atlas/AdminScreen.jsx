const {
  SiteHeader, Footer, Card, Input, Button, DataTable, StackedCardTable, Toggle,
  Pill, EmptyState, Toast, ToastStack, Spinner,
} = window.BIMGISBlueprintDesignSystem_f8b0c8;

function _useIsMobileA(bp = 720) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const on = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

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
function _fmtRelative(iso) {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (diff < 0) return new Date(iso).toLocaleDateString('en-GB');
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB');
}

function Avatar({ name }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 30, height: 30, borderRadius: 'var(--r-pill)', flex: 'none',
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#06121a',
      background: 'linear-gradient(135deg, var(--brand-bim), var(--brand-gis))',
    }}>{_initials(name)}</span>
  );
}

function AdminScreen({ who, nav, onMenu }) {
  const mobile = _useIsMobileA();
  const [state, setState] = React.useState({ loading: true, error: null, users: [] });
  const [busyId, setBusyId] = React.useState(null);
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [inviteBusy, setInviteBusy] = React.useState(false);
  const [inviteErr, setInviteErr] = React.useState('');
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { ...t, id }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 5000);
  };

  const load = React.useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const data = await _api('/admin/users');
      setState({ loading: false, error: null, users: data.users || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, users: [] });
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const invite = async (e) => {
    e.preventDefault();
    setInviteErr('');
    const v = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { setInviteErr('Enter a valid work email.'); return; }
    setInviteBusy(true);
    try {
      await _api('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: v, display_name: displayName.trim() || null, is_admin: isAdmin }),
      });
      push({ tone: 'success', title: 'User invited', description: v });
      setEmail(''); setDisplayName(''); setIsAdmin(false);
      load();
    } catch (err) {
      setInviteErr(err.message);
      push({ tone: 'error', title: 'Invite failed', description: err.message });
    } finally {
      setInviteBusy(false);
    }
  };

  const toggleAdmin = async (u) => {
    setBusyId(u.id);
    try {
      await _api(`/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_admin: !u.is_admin }),
      });
      push({ tone: 'success', title: 'Role updated', description: `${u.email} → ${!u.is_admin ? 'Admin' : 'Member'}` });
      load();
    } catch (err) {
      push({ tone: 'error', title: 'Role update failed', description: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (u) => {
    setBusyId(u.id);
    try {
      const out = await _api(`/admin/users/${u.id}/reset-password`, { method: 'POST' });
      const tempPw = out && (out.temp_password || out.password || out.new_password);
      push({
        tone: 'success',
        title: 'Reset link sent',
        description: tempPw ? `Temp password: ${tempPw}` : u.email,
      });
    } catch (err) {
      push({ tone: 'error', title: 'Reset failed', description: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Remove ${u.email}? This cannot be undone.`)) return;
    setBusyId(u.id);
    try {
      await _api(`/admin/users/${u.id}`, { method: 'DELETE' });
      push({ tone: 'success', title: 'User removed', description: u.email });
      load();
    } catch (err) {
      push({ tone: 'error', title: 'Remove failed', description: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const cols = [
    { key: 'name', header: 'User', sortable: true, render: r => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={r.display_name || r.email} />
        <span>
          <strong style={{ fontWeight: 600 }}>{r.display_name || r.email.split('@')[0]}</strong>
          <span className="micro" style={{ display: 'block', marginTop: 2, textTransform: 'none', letterSpacing: 0 }}>{r.email}</span>
        </span>
      </span>
    ) },
    { key: 'role', header: 'Role', render: r => r.is_admin ? <Pill tone="warn" dot>admin</Pill> : <Pill tone="neutral">member</Pill> },
    { key: 'last_login_at', header: 'Last seen', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>{_fmtRelative(r.last_login_at)}</span> },
    { key: 'created_at', header: 'Joined', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-faint)' }}>{_fmtRelative(r.created_at)}</span> },
  ];
  const actions = r => {
    const me = who && r.email === who.email;
    return (
      <React.Fragment>
        <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => resetPassword(r)}>Reset password</Button>
        <Button size="sm" variant="ghost" disabled={busyId === r.id || me} onClick={() => toggleAdmin(r)}>
          {r.is_admin ? 'Demote to member' : 'Promote to admin'}
        </Button>
        <Button size="sm" variant="ghost" disabled={busyId === r.id || me} onClick={() => removeUser(r)}>Remove</Button>
      </React.Fragment>
    );
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#admin', label: 'Admin', active: true }]} who={who} />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '28px 24px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="micro" style={{ marginBottom: 6 }}>Administration</div>
            <h1 style={{ fontSize: 'var(--fs-h1)', margin: 0 }}>Users &amp; roles</h1>
          </div>
          {!state.loading && !state.error && <Pill tone="neutral">{state.users.length} members</Pill>}
        </div>

        <Card title="Invite user" style={{ marginBottom: 20 }}>
          <form onSubmit={invite} className="bp-admin-form" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto auto', gap: 12, alignItems: 'flex-start' }}>
            <Input label="Work email" type="email" placeholder="name@bimgis.io" fullWidth required
              value={email} onChange={(e) => { setEmail(e.target.value); setInviteErr(''); }} error={inviteErr || undefined} />
            <Input label="Display name (optional)" placeholder="Jane Doe" fullWidth
              value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <div style={{ alignSelf: 'flex-start', paddingTop: 22 }}>
              <Toggle label="Admin" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            </div>
            <div style={{ alignSelf: 'flex-start', paddingTop: 18 }}>
              <Button type="submit" variant="primary" leftIcon="+" loading={inviteBusy} disabled={!email || inviteBusy}>Invite</Button>
            </div>
          </form>
        </Card>

        {state.loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--brand-muted)' }}>
            <Spinner /><div className="micro" style={{ marginTop: 14 }}>LOADING USERS</div>
          </div>
        ) : state.error ? (
          <EmptyState icon="!" title="Couldn't load users" description={state.error}
            action={<Button variant="primary" onClick={load}>Retry</Button>} />
        ) : state.users.length === 0 ? (
          <EmptyState icon="◳" title="No users yet" description="Invite teammates by email above." />
        ) : mobile ? (
          <StackedCardTable columns={cols} rows={state.users} rowKey={r => r.id} actions={actions} />
        ) : (
          <DataTable columns={cols} rows={state.users} rowKey={r => r.id} caption={`${state.users.length} users`} actions={actions} />
        )}
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.2.0</span>} />

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>

      <style>{`
        @media (max-width: 720px) {
          .bp-admin-form { grid-template-columns: 1fr !important; }
          .bp-admin-form > div { padding-top: 0 !important; }
        }
      `}</style>
    </div>
  );
}

window.AdminScreen = AdminScreen;
