// Capa de acceso al backend EDUMAP-HEXAGONAL. Si el backend cambia, solo se toca este archivo.
const BASE = import.meta.env.VITE_API_URL || ''

export const session = {
  token: () => localStorage.getItem('edumap_token'),
  user: () => { try { return JSON.parse(localStorage.getItem('edumap_user')) } catch { return null } },
  save: (r) => { localStorage.setItem('edumap_token', r.token); localStorage.setItem('edumap_user', JSON.stringify(r.usuario)) },
  clear: () => { localStorage.removeItem('edumap_token'); localStorage.removeItem('edumap_user') },
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = session.token()
  if (t) headers.Authorization = `Bearer ${t}`
  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que el backend esté encendido.')
  }
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || data?.title || data?.detail
    const err = new Error(msg || `Error ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  instituciones: () => request('/api/institution-search-views'),
  institucion: (id) => request(`/api/institution-search-views/${id}`),
  resenas: (id) => request(`/api/institutions/${id}/reviews`),
  crearResena: (id, b) => request(`/api/institutions/${id}/reviews`, { method: 'POST', body: b }),
  login: (b) => request('/api/auth/login', { method: 'POST', body: b }),
  registro: (b) => request('/api/auth/register', { method: 'POST', body: b }),
  misFavoritos: () => request('/api/favorites/mis-favoritos'),
  agregarFavorito: (idInstitucion) => request('/api/favorites', { method: 'POST', body: { idInstitucion } }),
  quitarFavorito: (idInstitucion) => request(`/api/favorites/${idInstitucion}`, { method: 'DELETE' }),
}

export const soles = (n) => (n == null ? null : `S/ ${Number(n).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`)
export const pension = (i) => {
  const a = soles(i.pensionMinima), b = soles(i.pensionMaxima)
  if (!a && !b) return 'Pensión no registrada'
  return a && b && a !== b ? `${a} a ${b} al mes` : `${a || b} al mes`
}
