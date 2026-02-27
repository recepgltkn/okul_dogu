function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
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

export function getFirestore(app) {
  return { app };
}

export function doc(_dbOrRef, ...segments) {
  const path = Array.isArray(segments[0]) ? segments[0].join('/') : segments.join('/');
  return { __type: 'doc', path };
}

export function collection(_dbOrRef, ...segments) {
  return { __type: 'collection', path: segments.join('/'), filters: [], order: null, lim: null };
}

function readField(obj, path) {
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function writeField(obj, path, value) {
  const parts = path.split('.');
  let ptr = obj;
  while (parts.length > 1) {
    const p = parts.shift();
    if (!ptr[p] || typeof ptr[p] !== 'object') ptr[p] = {};
    ptr = ptr[p];
  }
  ptr[parts[0]] = value;
}

function resolveSentinels(incoming, current = {}) {
  const out = Array.isArray(current) ? [...current] : { ...(current || {}) };
  Object.entries(incoming || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && v.__op === 'increment') {
      const prev = Number(readField(out, k) || 0);
      writeField(out, k, prev + Number(v.value || 0));
      return;
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const prevObj = readField(out, k);
      writeField(out, k, resolveSentinels(v, typeof prevObj === 'object' ? prevObj : {}));
      return;
    }
    writeField(out, k, v);
  });
  return out;
}

export async function setDoc(ref, data, options = {}) {
  let payload = data || {};
  if (options.merge) {
    const cur = await getDoc(ref);
    const currentData = cur.exists() ? (cur.data() || {}) : {};
    payload = resolveSentinels(payload, currentData);
  } else {
    payload = resolveSentinels(payload, {});
  }

  await api(`/docs/${encodePath(ref.path)}`, {
    method: 'PUT',
    body: JSON.stringify({ data: payload, merge: false }),
  });
}

export async function getDoc(ref) {
  const out = await api(`/docs/${encodePath(ref.path)}`);
  return {
    exists: () => !!out.exists,
    id: ref.path.split('/').pop(),
    data: () => out.data || null,
    ref,
  };
}

export async function addDoc(colRef, data) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const ref = doc(null, colRef.path, id);
  await setDoc(ref, data);
  return ref;
}

export function where(field, op, value) {
  return { type: 'where', field, op, value };
}

export function orderBy(field, direction = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(n) {
  return { type: 'limit', n };
}

export function query(base, ...parts) {
  const q = { ...base, filters: [...(base.filters || [])], order: base.order || null, lim: base.lim || null };
  for (const p of parts) {
    if (!p) continue;
    if (p.type === 'where') q.filters.push(p);
    if (p.type === 'orderBy') q.order = p;
    if (p.type === 'limit') q.lim = p.n;
  }
  return q;
}

function passes(docData, f) {
  const v = readField(docData, f.field);
  if (f.op === '==') return v === f.value;
  if (f.op === '!=') return v !== f.value;
  if (f.op === '>') return v > f.value;
  if (f.op === '>=') return v >= f.value;
  if (f.op === '<') return v < f.value;
  if (f.op === '<=') return v <= f.value;
  if (f.op === 'array-contains') return Array.isArray(v) && v.includes(f.value);
  if (f.op === 'in') return Array.isArray(f.value) && f.value.includes(v);
  return true;
}

function makeQuerySnap(_q, docs) {
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach(cb) { docs.forEach(cb); },
  };
}

function isImmediateChildDoc(docPath, collectionPath) {
  const d = String(docPath || '').split('/').filter(Boolean);
  const c = String(collectionPath || '').split('/').filter(Boolean);
  if (d.length !== c.length + 1) return false;
  for (let i = 0; i < c.length; i++) {
    if (d[i] !== c[i]) return false;
  }
  return true;
}

function belongsToCollectionGroup(docPath, groupName) {
  const parts = String(docPath || '').split('/').filter(Boolean);
  if (parts.length < 2 || parts.length % 2 !== 0) return false;
  return parts[parts.length - 2] === groupName;
}

async function runQuery(q) {
  const rawPrefix = q.group ? '' : q.path;
  const list = await api(`/docs?prefix=${encodeURIComponent(rawPrefix)}&limit=${encodeURIComponent(q.lim || 500)}`);
  let docs = (list.documents || []).map((d) => {
    const ref = { __type: 'doc', path: d.path };
    return {
      id: d.path.split('/').pop(),
      ref,
      data: () => d.data || {},
      exists: () => true,
    };
  });

  if (q.group) {
    docs = docs.filter((d) => belongsToCollectionGroup(d.ref.path, q.path));
  } else {
    docs = docs.filter((d) => isImmediateChildDoc(d.ref.path, q.path));
  }

  if (q.filters?.length) {
    docs = docs.filter((d) => q.filters.every((f) => passes(d.data(), f)));
  }

  if (q.order?.field) {
    const dir = q.order.direction === 'desc' ? -1 : 1;
    docs.sort((a, b) => {
      const av = readField(a.data(), q.order.field);
      const bv = readField(b.data(), q.order.field);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }

  if (q.lim) docs = docs.slice(0, q.lim);
  return makeQuerySnap(q, docs);
}

export async function getDocs(q) {
  return runQuery(q);
}

export async function updateDoc(ref, patch) {
  const cur = await getDoc(ref);
  const data = cur.exists() ? (cur.data() || {}) : {};
  const merged = resolveSentinels(patch || {}, data);
  await setDoc(ref, merged);
}

export async function deleteDoc(ref) {
  await api(`/docs/${encodePath(ref.path)}`, { method: 'DELETE' });
}

export function increment(value) {
  return { __op: 'increment', value };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export function writeBatch() {
  const ops = [];
  return {
    set(ref, data, options) { ops.push(() => setDoc(ref, data, options)); },
    update(ref, data) { ops.push(() => updateDoc(ref, data)); },
    delete(ref) { ops.push(() => deleteDoc(ref)); },
    async commit() { for (const op of ops) await op(); },
  };
}

export function collectionGroup(_db, name) {
  return { __type: 'collectionGroup', path: name, filters: [], order: null, lim: null, group: true };
}

export function onSnapshot(refOrQuery, callback, onError) {
  let alive = true;
  let timer = null;

  const tick = async () => {
    if (!alive) return;
    try {
      if (refOrQuery?.__type === 'doc') {
        const snap = await getDoc(refOrQuery);
        callback(snap);
      } else {
        const snap = await getDocs(refOrQuery);
        callback(snap);
      }
    } catch (e) {
      if (onError) onError(e);
    } finally {
      if (alive) timer = setTimeout(tick, 2500);
    }
  };

  tick();

  return () => {
    alive = false;
    if (timer) clearTimeout(timer);
  };
}
