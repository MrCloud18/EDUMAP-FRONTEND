import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, session } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.user())
  const [favs, setFavs] = useState([])

  const loadFavs = useCallback(async () => {
    if (!session.token()) return setFavs([])
    try { setFavs((await api.misFavoritos()).map((f) => f.idInstitucion)) }
    catch (e) { if (e.status === 401) { session.clear(); setUser(null) } }
  }, [])
  useEffect(() => { loadFavs() }, [user, loadFavs])

  const enter = (r) => { session.save(r); setUser(r.usuario) }
  const logout = () => { session.clear(); setUser(null); setFavs([]) }
  const toggleFav = async (id) => {
    if (favs.includes(id)) { await api.quitarFavorito(id); setFavs(favs.filter((x) => x !== id)) }
    else { await api.agregarFavorito(id); setFavs([...favs, id]) }
  }
  return <Ctx.Provider value={{ user, favs, enter, logout, toggleFav }}>{children}</Ctx.Provider>
}
