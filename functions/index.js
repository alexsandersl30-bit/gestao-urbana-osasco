const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

// Utilitário local (reduz dependências entre src/ e functions)
async function fetchStreetGeometry(rua, bairro = '', cidade = 'Osasco') {
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
      if (r.geojson) {
        const gj = r.geojson
        if (gj.type === 'LineString' || gj.type === 'MultiLineString') return gj
        if (gj.type === 'Polygon' || gj.type === 'MultiPolygon') {
          const coords = Array.isArray(gj.coordinates) && gj.coordinates.length > 0 ? gj.coordinates[0] : null
          if (coords) return { type: 'LineString', coordinates: coords }
        }
      }

        if (r.osm_type && r.osm_id && r.osm_type === 'way') {
        const osmId = r.osm_id
        const overpass = 'https://overpass-api.de/api/interpreter'
        const q = `out:json;way(${osmId});out geom;`
        const ovRes = await fetch(overpass, { method: 'POST', body: q, headers: { 'User-Agent': userAgent, 'Accept-Language': 'pt-BR' } })
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
  } catch (e) {
    console.warn('[functions] fetchStreetGeometry error:', e && e.message)
  }
  return null
}

// Trigger on create/update of varricao docs
exports.onVarricaoWrite = functions.firestore.document('varricao/{id}').onWrite(async (change, context) => {
  const after = change.after.exists ? change.after.data() : null
  if (!after) return null
  if (after.geometry) return null // já tem geometria

  const rua = after.rua || ''
  const bairro = after.bairro || ''
  if (!rua) return null

  try {
    const geo = await fetchStreetGeometry(rua, bairro)
    if (geo) {
      await change.after.ref.update({ geometry: geo })
      console.log(`[functions] geometry saved for ${context.params.id}`)
    } else {
      console.log(`[functions] no geometry found for ${context.params.id}`)
    }
  } catch (e) {
    console.error('[functions] failed to save geometry', e)
  }

  return null
})
