import { useEffect, useState } from 'react'
import { api, soles } from '../api'

const empty = <p className="profile-empty">Todavía no hay información registrada.</p>

function safeUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value.startsWith('www.') ? `https://${value}` : value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

function contactLink(c) {
  const type = c.tipoCanal?.toLowerCase() || ''
  const value = c.valorContacto?.trim() || ''
  if (type.includes('correo') || type.includes('email')) {
    return /^\S+@\S+\.\S+$/.test(value) ? `mailto:${value}` : null
  }
  if (type.includes('whatsapp')) {
    const digits = value.replace(/\D/g, '')
    return digits.length >= 9 ? `https://wa.me/${digits.length === 9 ? `51${digits}` : digits}` : null
  }
  if (type.includes('teléfono') || type.includes('telefono') || type.includes('celular')) {
    const number = value.replace(/[^\d+]/g, '')
    return number ? `tel:${number}` : null
  }
  if (type.includes('web')) return safeUrl(value)
  return null
}

const price = (value) => Number(value) > 0 ? soles(value) : 'No registrado'

function Section({ title, count, children, expanded = false }) {
  return (
    <details className="profile-section" defaultOpen={expanded}>
      <summary>{title}{count !== undefined ? ` (${count})` : ''}</summary>
      <div className="profile-content">{children}</div>
    </details>
  )
}

export default function InstitutionSections({ id, showReviews = true }) {
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let current = true
    setProfile(null)
    setReviews([])
    setError('')
    setLoading(true)
    api.perfil(id)
      .then((result) => { if (current) setProfile(result) })
      .catch((err) => { if (current) setError(err.message) })
      .finally(() => { if (current) setLoading(false) })
    if (showReviews) {
      api.resenas(id)
        .then((result) => { if (current) setReviews(Array.isArray(result) ? result : []) })
        .catch(() => {})
    }
    return () => { current = false }
  }, [id, showReviews])

  if (loading) return <div className="notice" role="status">Cargando programas, precios y contactos…</div>
  if (error) return (
    <div className="notice err" role="alert">
      <b>No se pudo cargar la ficha detallada.</b>
      <p>{error}</p>
      <small>Comprueba que el backend actualizado esté desplegado en Render.</small>
    </div>
  )
  if (!profile) return empty

  const offers = profile.ofertas ?? []
  const campuses = profile.sedes ?? []
  const contacts = profile.contactos ?? []
  const attrs = profile.atributos ?? []
  const pictures = (profile.multimedia ?? []).filter((item) => {
    const kind = item.tipo?.toLowerCase() || ''
    return (kind.includes('imagen') || kind.includes('foto') || kind.includes('image')) && safeUrl(item.url)
  })
  const website = safeUrl(profile.sitioWeb)

  return (
    <div className="profile-sections">
      <Section title="Información general" expanded>
        {profile.descripcion ? <p>{profile.descripcion}</p> : empty}
        {website && <p><a href={website} target="_blank" rel="noopener noreferrer">Visitar sitio web oficial</a></p>}
        {campuses.length > 0 && <>
          <strong>Sedes</strong>
          <ul>{campuses.map((s) => (
            <li key={s.idSede}>
              <strong>{s.nombre}</strong>{s.esPrincipal ? ' (principal)' : ''}
              <span className="muted"> — {[s.direccion, s.distrito].filter(Boolean).join(', ')}</span>
            </li>
          ))}</ul>
        </>}
      </Section>

      <Section title="Carreras, programas y niveles" count={offers.length} expanded>
        {offers.length === 0 ? empty : <ul>
          {offers.map((o) => (
            <li key={o.idOferta}>
              <strong>{o.programa}</strong>
              {[o.areaAcademica, o.modalidad, o.turno].filter(Boolean).join(' · ') &&
                <small className="muted">{[o.areaAcademica, o.modalidad, o.turno].filter(Boolean).join(' · ')}</small>}
              {campuses.length > 1 && <small className="muted">Sede: {o.nombreSede}</small>}
            </li>
          ))}
        </ul>}
      </Section>

      <Section title="Costos y pensiones" count={offers.length}>
        {offers.length === 0 ? empty : <>
          <p className="profile-empty">Los importes son orientativos: confirma siempre el precio con la institución.</p>
          {offers.map((o) => (
            <div className="profile-entry" key={o.idOferta}>
              <h4>{o.programa} {o.anioAcademico > 0 && <small>Año {o.anioAcademico}</small>}</h4>
              {o.esEstimado && <span className="profile-badge">Precio estimado / simulado</span>}
              <p>Inscripción: <b>{price(o.costoInscripcion)}</b></p>
              <p>Matrícula: <b>{price(o.costoMatricula)}</b></p>
              <p>Pensión mensual: <b>{price(o.pensionMensual)}</b></p>
            </div>
          ))}
        </>}
      </Section>

      <Section title="Contacto y atención" count={contacts.length}>
        {contacts.length === 0 ? empty : <>
          <p className="profile-empty">Verifica estos canales antes de usarlos; algunos datos de prueba podrían no estar confirmados.</p>
          {contacts.map((c) => {
            const href = contactLink(c)
            return (
              <div className="profile-entry" key={c.idContacto}>
                <strong>{c.tipoCanal}</strong>{c.areaAtencion && <span> · {c.areaAtencion}</span>}
                <p>{href ? <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.valorContacto}</a> : c.valorContacto}</p>
                {c.horarioAtencion && <small>Horario: {c.horarioAtencion}</small>}
                {campuses.length > 1 && <small>Sede: {campuses.find((s) => s.idSede === c.idSede)?.nombre ?? 'Sin especificar'}</small>}
              </div>
            )
          })}
        </>}
      </Section>

      <Section title="Servicios e instalaciones" count={attrs.length}>
        {attrs.length === 0 ? empty : <ul>{attrs.map((a, index) => (
          <li key={`${a.nombre}-${index}`}>
            <strong>{a.nombre}</strong>{a.valor ? `: ${a.valor}` : ''}
            {a.categoria && <small className="muted">{a.categoria}</small>}
          </li>
        ))}</ul>}
      </Section>

      <Section title="Fotografías" count={pictures.length}>
        {pictures.length === 0 ? empty : <div className="profile-photos">
          {pictures.map((item, index) => (
            <a key={`${item.url}-${index}`} href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer">
              <img src={safeUrl(item.url)} alt={item.titulo || `Foto de ${profile.nombre}`} loading="lazy" />
            </a>
          ))}
        </div>}
      </Section>

      {showReviews && <Section title="Opiniones" count={reviews.length}>
        {reviews.length === 0 ? empty : reviews.slice(0, 5).map((review) => (
          <div className="profile-entry" key={review.idResena}>
            <strong>{review.autor || 'Usuario'}</strong> · {review.puntuacion}/5
            <p>{review.comentario}</p>
          </div>
        ))}
      </Section>}
    </div>
  )
}
