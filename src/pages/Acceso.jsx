import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth.jsx'

export default function Acceso() {
  const [modo, setModo] = useState('login')
  const [f, setF] = useState({ nombres: '', apellidos: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { enter } = useAuth()
  const nav = useNavigate()
  const { state } = useLocation()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const r = modo === 'login' ? await api.login({ email: f.email, password: f.password }) : await api.registro(f)
      enter(r); nav(state?.from || '/')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <main className="page auth">
      <div className="authbox">
        <h1>{modo === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h1>
        <p className="muted">{modo === 'login' ? 'Ingresa para guardar favoritos y dejar reseñas.' : 'Es gratis y toma un minuto.'}</p>
        <form className="form" onSubmit={submit}>
          {modo === 'registro' && (
            <div className="two">
              <label>Nombres<input className="field" required value={f.nombres} onChange={set('nombres')} autoComplete="given-name" /></label>
              <label>Apellidos<input className="field" required value={f.apellidos} onChange={set('apellidos')} autoComplete="family-name" /></label>
            </div>
          )}
          <label>Correo electrónico<input className="field" type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Contraseña<input className="field" type="password" required minLength="6" value={f.password} onChange={set('password')} autoComplete={modo === 'login' ? 'current-password' : 'new-password'} /></label>
          {error && <p className="msg err" role="alert">{error}</p>}
          <button className="btn solid" disabled={busy}>{busy ? 'Un momento…' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
        </form>
        <p className="switch">
          {modo === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button className="link" onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError('') }}>
            {modo === 'login' ? 'Crear una cuenta' : 'Ingresar'}
          </button>
        </p>
      </div>
    </main>
  )
}
