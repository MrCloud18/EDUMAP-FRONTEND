import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth.jsx'
import Card from '../components/Card.jsx'

export default function Favoritos() {
  const { user, favs } = useAuth()
  const [data, setData] = useState(null)
  useEffect(() => { if (user) api.instituciones().then(setData).catch(() => setData([])) }, [user])

  if (!user) return (
    <main className="page"><div className="notice"><b>Tus favoritos viven en tu cuenta.</b>
      <p><Link to="/acceso" state={{ from: '/favoritos' }}>Ingresa</Link> para ver las instituciones que guardaste.</p></div></main>
  )
  const mine = (data || []).filter((i) => favs.includes(i.idInstitucion))
  return (
    <main className="page">
      <h1>Mis favoritos</h1>
      {!data && <div className="card skeleton" />}
      {data && !mine.length && <div className="notice"><b>Aún no guardas ninguna institución.</b><p><Link to="/">Explora el mapa</Link> y guarda las que te interesen para compararlas.</p></div>}
      <div className="grid">{mine.map((i) => <Card key={i.idInstitucion} i={i} />)}</div>
    </main>
  )
}
