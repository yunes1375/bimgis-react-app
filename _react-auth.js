// Shared auth bootstrap for the React app at /app/atlas-live/.
// Uses the SAME localStorage key (`propos.auth`) as the legacy /app/* pages
// so a user signed in on one side stays signed in on the other.
//
// Differences from legacy auth.js:
// - Never redirects. Auth state goes through React (window.PlatformAuth).
// - Wraps fetch() to attach Bearer + auto-clear on 401.

(function () {
  const KEY = "propos.auth";

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj && obj.access_token ? obj : null;
    } catch { return null; }
  }
  function write(obj) { localStorage.setItem(KEY, JSON.stringify(obj)); }
  function clear()   { localStorage.removeItem(KEY); }

  function expired(a) {
    if (!a || !a.expires_at) return false;
    return new Date(a.expires_at).getTime() < Date.now();
  }

  // ----- fetch wrapper (Bearer token + 401 handling) ------------------
  const ORIGIN = location.origin;
  const native = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    init = init || {};
    const url = typeof input === "string" ? input : input.url;
    const same = url.startsWith("/") || url.startsWith(ORIGIN);
    if (same) {
      const a = read();
      if (a && a.access_token) {
        const headers = new Headers(init.headers || (typeof input !== "string" && input.headers) || {});
        if (!headers.has("Authorization")) headers.set("Authorization", "Bearer " + a.access_token);
        init.headers = headers;
      }
    }
    const res = await native(input, init);
    if (res.status === 401 && same) {
      clear();
      // Notify React the session died — App.jsx listens and re-routes to login.
      window.dispatchEvent(new CustomEvent("platform-auth-changed"));
    }
    return res;
  };

  // ----- public API ----------------------------------------------------
  window.PlatformAuth = {
    get: read,
    getUser:  () => (read() || {}).user || null,
    getToken: () => (read() || {}).access_token || null,
    isAuthenticated: () => { const a = read(); return !!(a && a.access_token && !expired(a)); },
    signIn:  (obj) => { write(obj); window.dispatchEvent(new CustomEvent("platform-auth-changed")); },
    signOut: ()    => { clear();    window.dispatchEvent(new CustomEvent("platform-auth-changed")); },
    onChange: (cb) => { window.addEventListener("platform-auth-changed", cb); return () => window.removeEventListener("platform-auth-changed", cb); },

    async login(email, password) {
      const r = await native("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(txt || `Login failed (${r.status})`);
      }
      const obj = await r.json();
      write(obj);
      window.dispatchEvent(new CustomEvent("platform-auth-changed"));
      return obj;
    },

    async refreshMe() {
      const r = await fetch("/auth/me");
      if (!r.ok) { clear(); window.dispatchEvent(new CustomEvent("platform-auth-changed")); return null; }
      const user = await r.json();
      const cur = read();
      if (cur) write({ ...cur, user });
      return user;
    },
  };
})();
