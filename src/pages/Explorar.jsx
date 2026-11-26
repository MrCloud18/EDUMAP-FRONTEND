import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth.jsx'
import MapView from '../components/Map.jsx'
import Card from '../components/Card.jsx'

const uniq = (arr, k) => [...new Set(arr.map((x) => x[k]).filter(Boolean))].sort()
const minPension = (i) => {
  if (Number(i.pensionMinima) > 0) return Number(i.pensionMinima)
  if (Number(i.pensionMaxima) > 0) return Number(i.pensionMaxima)
  return Infinity
}
const SORTS = {
  rating: ['Mejor calificadas', (a, b) => (b.calificacionPromedio ?? 0) - (a.calificacionPromedio ?? 0)],
  barata: ['Pensión más baja', (a, b) => {
    const x = minPension(a), y = minPension(b)
    return x === y ? 0 : x - y
  }],
  resenas: ['Más reseñadas', (a, b) => (b.totalResenas ?? 0) - (a.totalResenas ?? 0)],
}

export default function Explorar() {
  const { favs } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [gest, setGest] = useState('')
  const [dist, setDist] = useState('')
  const [maxP, setMaxP] = useState('')
  const [sort, setSort] = useState('rating')
  const [sel, setSel] = useState(null)

  useEffect(() => { api.instituciones().then(setData).catch((e) => setError(e.message)) }, [])

  const list = useMemo(() => {
    if (!data) return []
    const t = q.trim().toLowerCase()
    return data
      .filter((i) => (!t || `${i.nombre} ${i.direccion ?? ''}`.toLowerCase().includes(t))
        && (!cat || i.nombreCategoria === cat) && (!gest || i.nombreGestion === gest)
        && (!dist || i.nombreDistrito === dist) && (!maxP || minPension(i) <= Number(maxP)))
      .sort(SORTS[sort][1])
  }, [data, q, cat, gest, dist, maxP, sort])

  const pick = (id) => {
    setSel(id)
    document.getElementById(`card-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  const clear = () => { setQ(''); setCat(''); setGest(''); setDist(''); setMaxP('') }
  const dirty = q || cat || gest || dist || maxP

  return (
    <main className="explore">
      <section className="panel">
        <div className="intro">
          <h1>Encuentra dónde estudiar</h1>
          <p className="muted">Compara colegios, institutos y universidades por ubicación, pensión y opiniones reales.</p>
        </div>
        <div className="filters">
          <input className="field search" type="search" placeholder="Busca por nombre o dirección" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar institución" />
          {data && (
            <div className="chips" role="group" aria-label="Categoría">
              <button className={`chip${!cat ? ' on' : ''}`} onClick={() => setCat('')}>Todas</button>
              {uniq(data, 'nombreCategoria').map((c) => (
                <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(cat === c ? '' : c)}>{c}</button>
              ))}
            </div>
          )}
          {data && (
            <div className="selects">
              <select className="field" value={dist} onChange={(e) => setDist(e.target.value)} aria-label="Distrito">
                <option value="">Todos los distritos</option>
                {uniq(data, 'nombreDistrito').map((d) => <option key={d}>{d}</option>)}
              </select>
              <select className="field" value={gest} onChange={(e) => setGest(e.target.value)} aria-label="Tipo de gestión">
                <option value="">Pública y privada</option>
                {uniq(data, 'nombreGestion').map((d) => <option key={d}>{d}</option>)}
              </select>
              <input className="field" type="number" min="0" step="50" placeholder="Pensión máx. (S/)" value={maxP} onChange={(e) => setMaxP(e.target.value)} aria-label="Pensión máxima" />
              <select className="field" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
                {Object.entries(SORTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="count" aria-live="polite">
          {data && <span>{list.length} {list.length === 1 ? 'resultado' : 'resultados'}</span>}
          {dirty && <button className="link" onClick={clear}>Quitar filtros</button>}
        </div>
        <div className="list">
          {error && <div className="notice err"><b>No pudimos cargar las instituciones.</b><p>{error}</p></div>}
          {!data && !error && [1, 2, 3, 4].map((n) => <div key={n} className="card skeleton" />)}
          {data && !list.length && !error && (
            <div className="notice"><b>Ninguna institución coincide.</b><p>Prueba con otra categoría o sube la pensión máxima.</p></div>
          )}
          {list.map((i) => <Card key={i.idInstitucion} i={i} active={sel === i.idInstitucion} onPick={pick} fav={favs.includes(i.idInstitucion)} />)}
        </div>
      </section>
      <section className="mapwrap"><MapView items={list} selectedId={sel} onSelect={pick} /></section>
    </main>
  )
}
