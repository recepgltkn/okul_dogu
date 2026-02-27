const STORE_KEY = 'okul_auth_user';
const listeners = new Set();

function mapUser(u) {
  if (!u) return null;
  return {
    uid: String(u.uid || u.id),
    email: u.email || '',
    displayName: u.displayName || u.name || '',
    role: u.role || 'student',
    class_name: u.class_name || null,
    section: u.section || null,
  };
}

function emit(auth) {
  for (const cb of listeners) cb(auth.currentUser || null);
}

function loadStored() {
  try {
    return mapUser(JSON.parse(localStorage.getItem(STORE_KEY) || 'null'));
  } catch {
    return null;
  }
}

function persist(user) {
  if (!user) localStorage.removeItem(STORE_KEY);
  else localStorage.setItem(STORE_KEY, JSON.stringify(user));
}

async function api(path, options = {}) {
  const base = (() => {
    const p = String(window.location.pathname || "");
    const i = p.indexOf("/public/");
    return i >= 0 ? p.slice(0, i + "/public".length) : "";
  })();
  const res = await fetch(`${base}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'İstek başarısız');
  return data;
}

export function getAuth(app) {
  return {
    app,
    currentUser: loadStored(),
  };
}

export async function signInWithEmailAndPassword(auth, email, password) {
  const data = await api('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const user = mapUser(data.user);
  auth.currentUser = user;
  persist(user);
  emit(auth);
  return { user };
}

export async function createUserWithEmailAndPassword(auth, email, password) {
  const username = String(email || '').split('@')[0] || 'kullanici';
  const data = await api('/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      username,
      name: username,
      role: 'student',
    }),
  });
  const user = mapUser(data.user);
  auth.currentUser = user;
  persist(user);
  emit(auth);
  return { user };
}

export async function updatePassword(user, newPassword) {
  await api(`/users/${encodeURIComponent(user.uid)}/password`, {
    method: 'PUT',
    body: JSON.stringify({ new_password: newPassword }),
  });
}

export async function deleteUser(user) {
  await api(`/users/${encodeURIComponent(user.uid)}`, { method: 'DELETE' });
}

export function onAuthStateChanged(auth, callback) {
  listeners.add(callback);
  callback(auth.currentUser || null);
  return () => listeners.delete(callback);
}

export async function signOut(auth) {
  auth.currentUser = null;
  persist(null);
  emit(auth);
  await api('/logout', { method: 'POST' }).catch(() => {});
}
