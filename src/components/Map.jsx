import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'

const pin = (on) => L.divIcon({ className: '', html: `<span class="pin${on ? ' on' : ''}"></span>`, iconSize: [26, 34], iconAnchor: [13, 32] })
const clusterIcon = (c) => {
  const n = c.getChildCount()
  const k = n < 10 ? '' : n < 100 ? ' m' : ' l'
  return L.divIcon({ html: `<span class="cl${k}">${n}</span>`, className: '', iconSize: [40, 40] })
}

export default function MapView({ items, selectedId, onSelect, single }) {
  const el = useRef(), map = useRef(), group = useRef(), marks = useRef({})
  const prev = useRef(null), lastSel = useRef(null), pick = useRef(onSelect)
  pick.current = onSelect

  useEffect(() => {
    const m = L.map(el.current, { zoomControl: false, scrollWheelZoom: !single }).setView([-16.4, -71.53], 12)
    map.current = m
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19, subdomains: 'abc',
    }).addTo(m)
    group.current = L.markerClusterGroup({
      chunkedLoading: true, showCoverageOnHover: false, maxClusterRadius: 50,
      disableClusteringAtZoom: 17, iconCreateFunction: clusterIcon,
    })
    m.addLayer(group.current)
    return () => m.remove()
  }, [single])

  useEffect(() => {
    const g = group.current
    g.clearLayers(); marks.current = {}; prev.current = null
    const arr = [], pts = []
    items.forEach((i) => {
      if (i.latitud == null || i.longitud == null) return
      const m = L.marker([i.latitud, i.longitud], { icon: pin(false), title: i.nombre })
      m.on('click', () => pick.current?.(i.idInstitucion))
      marks.current[i.idInstitucion] = m
      arr.push(m); pts.push([i.latitud, i.longitud])
    })
    g.addLayers(arr)
    if (pts.length === 1) map.current.setView(pts[0], 16)
    else if (pts.length) map.current.fitBounds(pts, { padding: [48, 48], maxZoom: 15 })
  }, [items])

  useEffect(() => {
    const paint = (id, on) => {
      const m = marks.current[id]
      if (m) { m.setIcon(pin(on)); m.setZIndexOffset(on ? 1000 : 0) }
    }
    paint(prev.current, false); prev.current = null
    const m = marks.current[selectedId]
    if (!m) return
    paint(selectedId, true); prev.current = selectedId
    const changed = lastSel.current !== selectedId
    lastSel.current = selectedId
    if (changed && !single) group.current.zoomToShowLayer(m, () => map.current.panTo(m.getLatLng()))
  }, [selectedId, items, single])

  return <div ref={el} className="map" role="region" aria-label="Mapa de instituciones" />
}
