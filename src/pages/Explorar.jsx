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
  const [shown, setShown] = useState(40)
  const [more, setMore] = useState(true)

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

  useEffect(() => setShown(40), [q, cat, gest, dist, maxP, sort])

  const pick = (id) => {
    setSel((actual) => actual === id ? null : id)
  }
  
  useEffect(() => {
    if (sel !== null) {
      document.getElementById(`card-${sel}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [sel])
  const clear = () => { setQ(''); setCat(''); setGest(''); setDist(''); setMaxP(''); setSort('rating') }
  const active = [gest, dist, maxP].filter(Boolean).length + (sort !== 'rating' ? 1 : 0)
  const dirty = q || cat || active
  const visibleCards = sel === null
  ? list.slice(0, shown)
  : list.filter((i) => i.idInstitucion === sel)
  return (
    <main className="explore">
      <section className="panel">
        <div className="intro">
          <h1>Encuentra dónde estudiar</h1>
          <p className="muted">Compara colegios, institutos y universidades por ubicación, pensión y opiniones.</p>
        </div>
        <div className="bar">
          <input className="field search" type="search" placeholder="Busca por nombre o dirección" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar institución" />
          {data && (
            <div className="chips" role="group" aria-label="Categoría">
              <button className={`chip${!cat ? ' on' : ''}`} onClick={() => setCat('')}>Todas</button>
              {uniq(data, 'nombreCategoria').map((c) => (
                <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(cat === c ? '' : c)}>{c}</button>
              ))}
            </div>
          )}
          <div className="count" aria-live="polite">
            <span>{data ? `${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}` : 'Cargando…'}</span>
            <span className="acts">
              {dirty && <button className="link" onClick={clear}>Quitar filtros</button>}
              {data && <button className="link" onClick={() => setMore(!more)} aria-expanded={more}>{more ? 'Ocultar filtros' : `Más filtros${active ? ` (${active})` : ''}`}</button>}
            </span>
          </div>
        </div>
        {data && more && (
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
        <div className="list">
          {error && <div className="notice err"><b>No pudimos cargar las instituciones.</b><p>{error}</p></div>}
          {!data && !error && [1, 2, 3, 4].map((n) => <div key={n} className="card skeleton" />)}
          {data && !list.length && !error && (
            <div className="notice"><b>Ninguna institución coincide.</b><p>Prueba con otra categoría o quita algún filtro.</p></div>
          )}
          {sel !== null && (
            <button
              className="btn ghost"
              onClick={() => setSel(null)}
            >
              ← Ver todas las instituciones
            </button>
          )}
          
          {visibleCards.map((i) => (
            <Card
              key={i.idInstitucion}
              i={i}
              active={sel === i.idInstitucion}
              onPick={pick}
              fav={favs.includes(i.idInstitucion)}
            />
          ))}
          {sel === null && list.length > shown && (
            <button
              className="btn ghost"
              onClick={() => setShown(shown + 40)}
            >
              Mostrar más ({list.length - shown} restantes)
            </button>
          )}
        </div>
      </section>
      <section className="mapwrap"><MapView items={list} selectedId={sel} onSelect={pick} /></section>
    </main>
  )
}
