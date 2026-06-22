const { MobileDrawer } = window.BIMGISBlueprintDesignSystem_f8b0c8;

const SCREENS = ['landing', 'login', 'projects', 'project', 'map', 'models', 'admin', 'ar', 'account'];
const PROTECTED = new Set(['projects', 'project', 'map', 'models', 'admin', 'ar', 'account']);

function readHash() {
  const h = (window.location.hash || '').replace(/^#/, '').split('/')[0];
  return SCREENS.includes(h) ? h : 'landing';
}

function buildNav(active) {
  return [
    { href: '#projects', label: 'Projects', screen: 'projects' },
    { href: '#models',   label: 'Models',   screen: 'models' },
    { href: '#admin',    label: 'Admin',    screen: 'admin' },
    { href: '#account',  label: 'Account',  screen: 'account' },
  ].map(n => ({ ...n, active: n.screen === active }));
}

function deriveWho(user) {
  if (!user) return null;
  const name = user.display_name || user.full_name || user.email || 'User';
  const initials = (user.display_name || user.full_name
    ? (user.display_name || user.full_name).split(/\s+/).map(s => s[0]).slice(0, 2).join('')
    : (user.email || 'U')[0]).toUpperCase();
  return {
    name, initials, email: user.email,
    role: user.is_admin ? 'admin' : 'member',
    is_admin: !!user.is_admin,
    id: user.id,
    href: '#account',
  };
}

function App() {
  const [authed, setAuthed] = React.useState(() => !!window.PlatformAuth?.isAuthenticated());
  const [user,   setUser]   = React.useState(() => window.PlatformAuth?.getUser() || null);
  const [screen, setScreen] = React.useState(readHash());
  const [project, setProject] = React.useState(null);
  const [selectedModel, setSelectedModel] = React.useState(null);
  const [drawer, setDrawer] = React.useState(false);

  // hash routing
  React.useEffect(() => {
    const onHash = () => { setScreen(readHash()); setDrawer(false); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // auth state listener — fires after login, signout, or 401
  React.useEffect(() => {
    if (!window.PlatformAuth) return;
    return window.PlatformAuth.onChange(() => {
      const ok = window.PlatformAuth.isAuthenticated();
      setAuthed(ok);
      setUser(window.PlatformAuth.getUser());
      if (!ok && PROTECTED.has(readHash())) window.location.hash = 'login';
    });
  }, []);

  // gate: unauthed user lands on a protected route → bounce to login
  React.useEffect(() => {
    if (!authed && PROTECTED.has(screen)) window.location.hash = 'login';
  }, [authed, screen]);

  const go = (s) => { window.location.hash = s; setScreen(s); setDrawer(false); };
  const openProject = (p) => { if (p) setProject(p); go('project'); };
  const onMenu = () => setDrawer(true);

  // Open 3D viewer for a specific model
  const openMapWithModel = (m) => {
    const id = typeof m === 'string' ? m : (m && (m.model_id || m.id));
    if (id) setSelectedModel(id);
    go('map');
  };
  const openARWithModel = (m) => {
    const id = typeof m === 'string' ? m : (m && (m.model_id || m.id));
    if (id) setSelectedModel(id);
    go('ar');
  };

  const onSignedIn = () => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (next && next.startsWith('/')) { window.location.href = next; return; }
    go('projects');
  };

  const onSignOut = () => { window.PlatformAuth.signOut(); go('landing'); };

  const who = React.useMemo(() => deriveWho(user), [user]);
  const nav = buildNav(screen);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: screen === 'map' || screen === 'ar' ? 'hidden' : 'auto' }}>
      {screen === 'landing' && <window.LandingScreen onSignIn={() => go('login')} onMenu={onMenu} nav={nav} />}

      {screen === 'login' && <window.LoginScreen onSignIn={onSignedIn} />}

      {screen === 'projects' && authed && (
        <window.ProjectsScreen who={who} nav={nav} onMenu={onMenu} onOpenProject={openProject} onSignOut={onSignOut} />
      )}
      {screen === 'project' && authed && (
        <window.ProjectScreen project={project} who={who} nav={nav} onMenu={onMenu}
          onBack={() => go('projects')} onOpenMap={openMapWithModel} onOpenModels={() => go('models')}
          onSignOut={onSignOut} />
      )}
      {screen === 'map' && authed && (
        <window.MapWorkspace
          project={project}
          who={who}
          nav={nav}
          onMenu={onMenu}
          modelId={selectedModel}
          onPickModel={setSelectedModel}
          onBack={() => go(project ? 'project' : 'projects')}
          onSignOut={onSignOut} />
      )}
      {screen === 'models' && authed && (
        <window.ModelsScreen who={who} nav={nav} onMenu={onMenu}
          onOpen3D={openMapWithModel}
          onOpenAR={openARWithModel}
          onSignOut={onSignOut} />
      )}
      {screen === 'admin' && authed && <window.AdminScreen who={who} nav={nav} onMenu={onMenu} onSignOut={onSignOut} />}
      {screen === 'ar' && authed && (
        <window.ARScreen who={who} nav={nav} onMenu={onMenu}
          modelId={selectedModel}
          onPickModel={setSelectedModel}
          onBack={() => go('models')} onSignOut={onSignOut} />
      )}
      {screen === 'account' && authed && (
        <window.AccountScreen who={who} nav={nav} onMenu={onMenu} onSignOut={onSignOut} />
      )}

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} title="BIM·GIS Platform">
        {authed && nav.map(n => (
          <a key={n.label} href={n.href} className="bp-mdrawer__link"
            aria-current={screen === n.screen ? 'page' : undefined}
            onClick={() => go(n.screen)}>{n.label}</a>
        ))}
        {authed && (
          <a href="#ar" className="bp-mdrawer__link" aria-current={screen === 'ar' ? 'page' : undefined}
            onClick={() => go('ar')}>AR field mode</a>
        )}
        {authed
          ? <a href="#" className="bp-mdrawer__link" onClick={(e) => { e.preventDefault(); onSignOut(); }} style={{ color: 'var(--brand-error)' }}>Sign out</a>
          : <a href="#login" className="bp-mdrawer__link" onClick={() => go('login')}>Sign in</a>}
      </MobileDrawer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
