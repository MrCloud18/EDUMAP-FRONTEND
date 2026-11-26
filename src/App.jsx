import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Explorar from './pages/Explorar.jsx'
import Detalle from './pages/Detalle.jsx'
import Acceso from './pages/Acceso.jsx'
import Favoritos from './pages/Favoritos.jsx'

function Header() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return (
    <header className="top">
      <Link to="/" className="brand" aria-label="EduMap, inicio">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="16" fill="var(--valle)" />
          <circle cx="16" cy="14" r="5" fill="var(--sillar)" />
          <path d="M16 28 9 17h14z" fill="var(--sillar)" />
        </svg>
        EduMap
      </Link>
      <nav>
        <NavLink to="/" end>Explorar</NavLink>
        <NavLink to="/favoritos">Mis favoritos</NavLink>
      </nav>
      <div className="who">
        {user ? (
          <>
            <span>Hola, {user.nombres.split(' ')[0]}</span>
            <button className="btn ghost" onClick={() => { logout(); nav('/') }}>Salir</button>
          </>
        ) : (
          <Link className="btn solid" to="/acceso">Ingresar</Link>
        )}
      </div>
    </header>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Explorar />} />
        <Route path="/institucion/:id" element={<Detalle />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/acceso" element={<Acceso />} />
        <Route path="*" element={<main className="page"><h1>No encontramos esta página</h1><Link to="/">Volver a explorar</Link></main>} />
      </Routes>
    </>
  )
}
