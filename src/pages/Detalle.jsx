import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { api, pension } from '../api'
import { useAuth } from '../auth.jsx'
import MapView from '../components/Map.jsx'
import { Rating } from '../components/Card.jsx'

export default function Detalle() {
  const { id } = useParams()
  const loc = useLocation()
  const { user, favs, toggleFav } = useAuth()
  const [inst, setInst] = useState(null)
  const [resenas, setResenas] = useState([])
  const [error, setError] = useState('')
  const [nota, setNota] = useState(5)
  const [texto, setTexto] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const n = Number(id)

  const cargar = () => {
    api.institucion(n).then(setInst).catch((e) => setError(e.status === 404 ? 'Esta institución no existe o fue retirada.' : e.message))
    api.resenas(n).then(setResenas).catch(() => setResenas([]))
  }
  useEffect(cargar, [id])

  const enviar = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      await api.crearResena(n, { puntuacion: nota, comentario: texto })
      setTexto(''); setMsg('Reseña publicada.'); cargar()
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }

  if (error) return <main className="page"><div className="notice err"><b>{error}</b></div><Link to="/">Volver a explorar</Link></main>
  if (!inst) return <main className="page"><div className="card skeleton tall" /></main>
  const saved = favs.includes(n)

  return (
    <main className="page detail">
      <Link className="back" to="/">Volver a explorar</Link>
      <header className="dhead">
        <div>
          <div className="tags">
            {inst.nombreCategoria && <span className="tag">{inst.nombreCategoria}</span>}
            {inst.nombreGestion && <span className="tag soft">{inst.nombreGestion}</span>}
            {inst.enteRegulador && <span className="tag soft">Regula: {inst.enteRegulador}</span>}
          </div>
          <h1>{inst.nombre}</h1>
          <p className="muted">{[inst.nombreDistrito, inst.direccion].filter(Boolean).join(', ')}</p>
        </div>
        {user
          ? <button className={`btn ${saved ? 'solid' : 'ghost'}`} onClick={() => toggleFav(n).catch((e) => setMsg(e.message))}>{saved ? 'Guardado en favoritos' : 'Guardar en favoritos'}</button>
          : <Link className="btn ghost" to="/acceso" state={{ from: loc.pathname }}>Ingresa para guardar</Link>}
      </header>

      <div className="facts">
        <div><span className="muted">Pensión</span><strong>{pension(inst)}</strong></div>
        <div><span className="muted">Calificación</span><Rating v={inst.calificacionPromedio} n={inst.totalResenas} /></div>
        <div><span className="muted">Guardada por</span><strong>{inst.totalGuardadosComparador ?? 0} {Number(inst.totalGuardadosComparador) === 1 ? 'persona' : 'personas'}</strong></div>
      </div>

      <div className="dgrid">
        <section>
          <h2>Opiniones</h2>
          {!resenas.length && <div className="notice"><b>Todavía no hay reseñas.</b><p>Sé la primera persona en contar su experiencia.</p></div>}
          {resenas.map((r) => (
            <article key={r.idResena} className="review">
              <div className="row"><strong>{r.autor}</strong><span className="score">{r.puntuacion}/5</span></div>
              <p>{r.comentario}</p>
              <small className="muted">{r.fechaPublicacion && new Date(r.fechaPublicacion).toLocaleDateString('es-PE', { dateStyle: 'long' })}{r.editada ? ' (editada)' : ''}</small>
            </article>
          ))}
          <h3>Escribe tu reseña</h3>
          {user ? (
            <form className="form" onSubmit={enviar}>
              <label>Puntuación
                <select className="field" value={nota} onChange={(e) => setNota(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v} de 5</option>)}
                </select>
              </label>
              <label>Tu experiencia
                <textarea className="field" rows="4" required minLength="10" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Cuenta qué te gustó y qué mejorarías" />
              </label>
              <button className="btn solid" disabled={busy}>{busy ? 'Publicando…' : 'Publicar reseña'}</button>
              {msg && <p className="msg" role="status">{msg}</p>}
            </form>
          ) : <p>Para opinar necesitas una cuenta. <Link to="/acceso" state={{ from: loc.pathname }}>Ingresar o crear cuenta</Link></p>}
        </section>
        <aside>
          <h2>Ubicación</h2>
          <div className="minimap"><MapView items={[inst]} selectedId={n} single /></div>
        </aside>
      </div>
    </main>
  )
}
