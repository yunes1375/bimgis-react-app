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

// ─── Credentials modal — shown once when a GS/PG account is provisioned ─
function CredentialsModal({ open, kind, data, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);
  if (!open || !data) return null;

  const fields = kind === 'geoserver'
    ? [['URL', data.url || ''], ['Username', data.username || ''], ['Password', data.password || '']]
    : [['Host', data.host || ''], ['Port', String(data.port || '')], ['Database', data.database || ''],
       ['Username', data.username || ''], ['Password', data.password || ''], ['SSL mode', data.ssl_mode || '']];

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); }
    catch { /* user can select manually */ }
  }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--brand-surface)', border: '1px solid var(--brand-line-strong)',
        borderRadius: 'var(--r-lg)', width: 'min(560px, 100%)', boxShadow: 'var(--shadow-card)',
      }} role="dialog" aria-modal="true">
        <header style={{
          padding: '14px 16px', borderBottom: '1px solid var(--brand-line)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: kind === 'geoserver'
            ? 'linear-gradient(135deg, rgba(54,224,212,0.18), rgba(54,224,212,0.04))'
            : 'linear-gradient(135deg, rgba(106,155,232,0.18), rgba(106,155,232,0.04))',
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
            background: kind === 'geoserver' ? 'linear-gradient(135deg, #36e0d4, #1f9fa0)' : 'linear-gradient(135deg, #6a9be8, #3f6db3)',
            color: '#06121a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14,
          }}>{kind === 'geoserver' ? 'GS' : 'PG'}</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 'var(--fs-h3)', fontWeight: 600 }}>
              {kind === 'geoserver' ? 'GeoServer credentials' : 'PostGIS credentials'}
            </h3>
            <div className="micro" style={{ marginTop: 2 }}>
              for {data.email}{data.rotated && ' · ⚠ previous password rotated'}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)', color: 'var(--brand-muted)', borderRadius: 'var(--r-md)', width: 28, height: 28, fontSize: 18, cursor: 'pointer' }}>×</button>
        </header>

        <div style={{ padding: 16 }}>
          <div style={{ padding: '8px 12px', marginBottom: 14, background: 'rgba(255,154,82,0.10)', border: '1px solid rgba(255,154,82,0.35)', borderRadius: 'var(--r-md)', color: '#ffd1a8', fontSize: 12 }}>
            ⚠ Copy these credentials NOW — the password is shown only once. Closing this dialog hides it forever.
          </div>

          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr auto', rowGap: 8, columnGap: 12, alignItems: 'center' }}>
            {fields.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="micro" style={{ alignSelf: 'center' }}>{k}</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-text)',
                  padding: '6px 10px', background: 'var(--brand-bg-2)', border: '1px solid var(--brand-line)',
                  borderRadius: 'var(--r-sm)', overflow: 'auto', whiteSpace: 'nowrap' }}>{v || '—'}</dd>
                <button type="button" onClick={() => copy(v)} title={`Copy ${k}`}
                  style={{ background: 'transparent', border: '1px solid var(--brand-line-strong)',
                    color: 'var(--brand-muted)', borderRadius: 'var(--r-sm)', padding: '4px 8px',
                    fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>⎘ copy</button>
              </React.Fragment>
            ))}
          </dl>

          {kind === 'postgis' && (
            <div style={{ marginTop: 14, padding: 10, background: 'var(--brand-bg-2)', borderRadius: 'var(--r-md)', fontSize: 11, color: 'var(--brand-muted)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--brand-text)' }}>QGIS:</strong> Browser panel → PostgreSQL → New Connection.
              Paste the fields above. Test → Save.
            </div>
          )}
          {kind === 'geoserver' && (
            <div style={{ marginTop: 14, padding: 10, background: 'var(--brand-bg-2)', borderRadius: 'var(--r-md)', fontSize: 11, color: 'var(--brand-muted)', lineHeight: 1.55 }}>
              ADMIN role granted on GeoServer. Use the credentials at the URL above to publish layers or edit styles.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="primary" onClick={onClose}>I've saved them</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── All-projects card (admin-only) ───────────────────────────────────────
function AllProjectsCard({ mobile }) {
  const [state, setState] = React.useState({ loading: true, projects: [], error: null });
  const load = React.useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const data = await _api('/admin/projects');
      setState({ loading: false, projects: data.projects || [], error: null });
    } catch (err) {
      setState({ loading: false, projects: [], error: err.message });
    }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const cols = [
    { key: 'name', header: 'Project', render: r => (
      <a href={`#project/${r.id}`} onClick={(e) => { e.preventDefault(); window.location.hash = `project/${r.id}`; }}
         style={{ color: 'var(--brand-text)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--brand-line-strong)' }}>{r.name}</a>
    ) },
    { key: 'owner_email', header: 'Owner', render: r => r.owner_email
      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.owner_email}</span>
      : <Pill tone="warn">ownerless</Pill> },
    { key: 'model_count', header: 'Models', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.model_count ?? 0}</span> },
    { key: 'created_at', header: 'Created', align: 'end', render: r => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>{_fmtRelative(r.created_at)}</span> },
    { key: 'id', header: 'ID', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-faint)' }}>{(r.id || '').slice(0, 8)}</span> },
  ];

  return (
    <Card title="All projects"
      subtitle={state.loading ? 'loading…' : `${state.projects.length} project${state.projects.length === 1 ? '' : 's'} across every owner`}
      action={<Button size="sm" variant="ghost" onClick={load} disabled={state.loading}>Refresh</Button>}>
      {state.loading ? (
        <div style={{ padding: 30, textAlign: 'center' }}><Spinner size="sm" /></div>
      ) : state.error ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--brand-error, #f88)', fontSize: 13 }}>{state.error}</div>
      ) : state.projects.length === 0 ? (
        <EmptyState icon="◇" title="No projects yet" description="When users create projects, they appear here." />
      ) : mobile ? (
        <StackedCardTable columns={cols} rows={state.projects} rowKey={r => r.id} />
      ) : (
        <DataTable columns={cols} rows={state.projects} rowKey={r => r.id} caption={`${state.projects.length} projects`} />
      )}
    </Card>
  );
}

function AdminScreen({ who, nav, onMenu }) {
  const mobile = _useIsMobileA();
  const [state, setState] = React.useState({ loading: true, error: null, users: [] });
  const [busyId, setBusyId] = React.useState(null);
  const [busyKey, setBusyKey] = React.useState(null);  // composite: `${userId}:${action}`
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [inviteBusy, setInviteBusy] = React.useState(false);
  const [inviteErr, setInviteErr] = React.useState('');
  const [credModal, setCredModal] = React.useState({ open: false, kind: null, data: null });
  const [ownerlessBusy, setOwnerlessBusy] = React.useState(false);
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
    } finally { setBusyId(null); }
  };

  const resetPassword = async (u) => {
    if (!window.confirm(`Reset password for ${u.email}?\n\nThey will receive a fresh temporary password that you must hand them out of band.`)) return;
    setBusyKey(`${u.id}:reset`);
    try {
      const out = await _api(`/admin/users/${u.id}/reset-password`, { method: 'POST' });
      const tempPw = out && (out.temporary_password || out.temp_password || out.password || out.new_password);
      if (tempPw) {
        window.prompt(`Temporary password for ${out.email || u.email}:\n(copy it now; this dialog is the only place it will appear.)`, tempPw);
      }
      push({ tone: 'success', title: 'Password reset', description: `share the temp password with ${u.email}` });
    } catch (err) {
      push({ tone: 'error', title: 'Reset failed', description: err.message });
    } finally { setBusyKey(null); }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.email}?\n\nTheir projects will become ownerless (you can claim them with the "Claim ownerless" button above).`)) return;
    setBusyKey(`${u.id}:delete`);
    try {
      await _api(`/admin/users/${u.id}`, { method: 'DELETE' });
      push({ tone: 'success', title: 'User removed', description: u.email });
      load();
    } catch (err) {
      push({ tone: 'error', title: 'Remove failed', description: err.message });
    } finally { setBusyKey(null); }
  };

  const provisionGs = async (u) => {
    if (!window.confirm(`Provision or rotate the GeoServer account for ${u.email}?\n\nThis creates a matching user on GeoServer with ADMIN role and shows the new password ONCE. If a previous GeoServer password was issued, this rotates it.`)) return;
    setBusyKey(`${u.id}:gs`);
    try {
      const data = await _api(`/admin/users/${u.id}/geoserver-credentials`, { method: 'POST' });
      setCredModal({ open: true, kind: 'geoserver', data: { ...data, email: data.email || u.email } });
      push({ tone: 'success', title: `GeoServer access ${data.rotated ? 'rotated' : 'granted'}`, description: u.email });
    } catch (err) {
      push({ tone: 'error', title: 'Provision failed', description: err.message });
    } finally { setBusyKey(null); }
  };

  const provisionPg = async (u) => {
    if (!window.confirm(`Provision or rotate the Postgres login role for ${u.email}?\n\nThis creates a role with SELECT/INSERT/UPDATE/DELETE on vector_layer + vector_feature and shows the new password ONCE. If a previous Postgres password was issued, this rotates it.`)) return;
    setBusyKey(`${u.id}:pg`);
    try {
      const data = await _api(`/admin/users/${u.id}/postgis-credentials`, { method: 'POST' });
      setCredModal({ open: true, kind: 'postgis', data: { ...data, email: data.email || u.email } });
      push({ tone: 'success', title: `PostGIS access ${data.rotated ? 'rotated' : 'granted'}`, description: u.email });
    } catch (err) {
      push({ tone: 'error', title: 'Provision failed', description: err.message });
    } finally { setBusyKey(null); }
  };

  const claimOwnerless = async () => {
    if (!window.confirm(`Assign every ownerless project to you?\n\nAfter this, you'll be the owner (and can manage sharing for) all projects with no current owner.`)) return;
    setOwnerlessBusy(true);
    try {
      const data = await _api('/admin/migrate-ownerless', { method: 'POST' });
      const n = (data && (data.claimed != null ? data.claimed : data.count != null ? data.count : null));
      push({ tone: 'success', title: 'Ownerless projects claimed', description: n != null ? `${n} project(s) reassigned to you` : undefined });
    } catch (err) {
      push({ tone: 'error', title: 'Claim failed', description: err.message });
    } finally { setOwnerlessBusy(false); }
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
    const busy = busyId === r.id || (busyKey && busyKey.startsWith(`${r.id}:`));
    return (
      <React.Fragment>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => resetPassword(r)}>Reset pwd</Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => provisionGs(r)}>GS creds</Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => provisionPg(r)}>PG creds</Button>
        <Button size="sm" variant="ghost" disabled={busy || me} onClick={() => toggleAdmin(r)}>
          {r.is_admin ? 'Demote' : 'Promote'}
        </Button>
        <Button size="sm" variant="ghost" disabled={busy || me} onClick={() => removeUser(r)}>Remove</Button>
      </React.Fragment>
    );
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader brand="BIM·GIS" tag="Platform" onMenuClick={onMenu}
        nav={nav || [{ href: '#admin', label: 'Admin', active: true }]} who={who} />

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '28px 24px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="micro" style={{ marginBottom: 6 }}>Administration</div>
            <h1 style={{ fontSize: 'var(--fs-h1)', margin: 0 }}>Users &amp; projects</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {!state.loading && !state.error && <Pill tone="neutral">{state.users.length} members</Pill>}
            <Button size="sm" variant="ghost" leftIcon="⚑" loading={ownerlessBusy} disabled={ownerlessBusy} onClick={claimOwnerless}
              title="Assign every ownerless project to you (the current admin)">
              Claim ownerless
            </Button>
          </div>
        </div>

        <Card title="Invite user">
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

        <AllProjectsCard mobile={mobile} />
      </main>

      <Footer brand="BIM·GIS Platform · 2026"
        links={[{ href: '#privacy', label: 'Privacy' }, { href: '#status', label: 'Status' }, { href: '#api', label: 'API' }]}
        right={<span>v0.6.0</span>} />

      <ToastStack>
        {toasts.map(t => <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </ToastStack>

      <CredentialsModal open={credModal.open} kind={credModal.kind} data={credModal.data}
        onClose={() => setCredModal({ open: false, kind: null, data: null })} />

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
