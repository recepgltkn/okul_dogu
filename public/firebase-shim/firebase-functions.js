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

export function getFunctions(app) {
  return { app };
}

export function httpsCallable(_functions, name) {
  return async (payload = {}) => {
    if (name === 'deleteUserByAdmin') {
      const uid = payload?.uid;
      const result = await api(`/users/${encodeURIComponent(uid)}`, { method: 'DELETE' });
      return { data: result };
    }
    if (name === 'setUserPasswordByAdmin') {
      const uid = payload?.uid;
      const newPassword = payload?.newPassword || payload?.password;
      const result = await api(`/users/${encodeURIComponent(uid)}/password`, {
        method: 'PUT',
        body: JSON.stringify({ new_password: newPassword }),
      });
      return { data: result };
    }
    throw new Error(`Callable bulunamadı: ${name}`);
  };
}
