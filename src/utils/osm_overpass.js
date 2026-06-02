// Utilitário para obter geometria de ruas via Nominatim + Overpass
// Retorna GeoJSON (LineString) ou null
export async function fetchStreetGeometry(rua, bairro = '', cidade = 'Osasco') {
  if (!rua) return null

  const userAgent = process?.env?.NOMINATIM_USER_AGENT || process?.env?.NOMINATIM_EMAIL || 'gestao-urbana-osasco'
  const query = `${rua}, ${bairro ? bairro + ', ' : ''}${cidade}, SP, Brasil`
  const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&polygon_geojson=1`

  try {
    const res = await fetch(nomUrl, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': userAgent } })
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const r = data[0]
      // Se já veio geojson (linha ou polígono), retorna como LineString quando possível
      if (r.geojson) {
        const gj = r.geojson
        // Normalizar Polygons -> LineString usando o primeiro anel exterior
        if (gj.type === 'LineString' || gj.type === 'MultiLineString') return gj
        if (gj.type === 'Polygon' || gj.type === 'MultiPolygon') {
          // converter polígono para LineString usando o primeiro anel exterior
          const coords = Array.isArray(gj["coordinates"]) && gj.coordinates.length > 0 ? gj.coordinates[0] : null
          if (coords) return { type: 'LineString', coordinates: coords }
        }
      }

      // Se Nominatim retornou osm_type/ osm_id, tentar Overpass para obter geometria da way
      if (r.osm_type && r.osm_id) {
        // osm_type 'way' é esperado
        const osmType = r.osm_type
        const osmId = r.osm_id
        if (osmType === 'way') {
          const overpass = 'https://overpass-api.de/api/interpreter'
          const q = `out:json;way(${osmId});out geom;`
          const ovRes = await fetch(overpass, { method: 'POST', body: q })
          if (!ovRes.ok) return null
          const ovData = await ovRes.json()
          if (ovData.elements && ovData.elements.length > 0) {
            const way = ovData.elements[0]
            if (way.geometry && Array.isArray(way.geometry) && way.geometry.length > 0) {
              const coords = way.geometry.map((p) => [p.lon, p.lat])
              return { type: 'LineString', coordinates: coords }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[OSM] falha ao obter geometria:', e.message)
  }

  return null
}

export default fetchStreetGeometry
