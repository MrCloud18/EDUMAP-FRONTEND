import { Link } from 'react-router-dom'
import { pension } from '../api'

export const Rating = ({ v, n }) =>
  v == null || !n ? <span className="muted">Aún sin reseñas</span> : (
    <span className="rating">
      <b>{Number(v).toFixed(1)}</b>
      <span className="bar"><i style={{ width: `${(v / 5) * 100}%` }} /></span>
      <small>{n} {n === 1 ? 'reseña' : 'reseñas'}</small>
    </span>
  )

export default function Card({ i, active, onPick, fav }) {
  return (
    <article id={`card-${i.idInstitucion}`} className={`card${active ? ' active' : ''}`} onClick={() => onPick?.(i.idInstitucion)}>
      <div className="tags">
        {i.nombreCategoria && <span className="tag">{i.nombreCategoria}</span>}
        {i.nombreGestion && <span className="tag soft">{i.nombreGestion}</span>}
        {fav && <span className="tag heart">Guardado</span>}
      </div>
      <h3>{i.nombre}</h3>
      <p className="muted">{[i.nombreDistrito, i.direccion].filter(Boolean).join(', ') || 'Ubicación no registrada'}</p>
      <div className="row">
        <strong>{pension(i)}</strong>
        <Rating v={i.calificacionPromedio} n={i.totalResenas} />
      </div>
      <Link className="more" to={`/institucion/${i.idInstitucion}`} onClick={(e) => e.stopPropagation()}>Ver ficha completa</Link>
    </article>
  )
}
