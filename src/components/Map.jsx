import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pin = (on) => L.divIcon({ className: '', html: `<span class="pin${on ? ' on' : ''}"></span>`, iconSize: [26, 34], iconAnchor: [13, 32] })

export default function MapView({ items, selectedId, onSelect, single }) {
  const el = useRef(), map = useRef(), layer = useRef(), marks = useRef({}), pick = useRef(onSelect)
  pick.current = onSelect

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: false, scrollWheelZoom: !single }).setView([-16.4, -71.53], 12)
    L.control.zoom({ position: 'bottomright' }).addTo(map.current)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
  }, [single])

  useEffect(() => {
    layer.current.clearLayers(); marks.current = {}
    const pts = []
    items.forEach((i) => {
      if (i.latitud == null || i.longitud == null) return
      const m = L.marker([i.latitud, i.longitud], { icon: pin(false), title: i.nombre }).addTo(layer.current)
      m.on('click', () => pick.current?.(i.idInstitucion))
      marks.current[i.idInstitucion] = m
      pts.push([i.latitud, i.longitud])
    })
    if (pts.length === 1) map.current.setView(pts[0], 16)
    else if (pts.length) map.current.fitBounds(pts, { padding: [48, 48], maxZoom: 15 })
  }, [items])

  useEffect(() => {
    Object.entries(marks.current).forEach(([id, m]) => {
      const on = Number(id) === selectedId
      m.setIcon(pin(on)); m.setZIndexOffset(on ? 1000 : 0)
    })
    const m = marks.current[selectedId]
    if (m && !single) map.current.panTo(m.getLatLng())
  }, [selectedId, items, single])

  return <div ref={el} className="map" role="region" aria-label="Mapa de instituciones" />
}
