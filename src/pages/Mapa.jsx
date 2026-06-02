import { useEffect, useRef, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS, update } from '../firebase/db'
import Loading from '../components/Loading'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige ícones padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MAP_CENTER = [-23.5329, -46.7916]
const MAP_ZOOM = 13

// Geocodifica endereço usando Nominatim (gratuito)
async function geocodificar(endereco, bairro = '') {
  const query = `${endereco}, ${bairro}, Osasco, SP, Brasil`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  try {
    console.log('[GEOCODE] query:', query)
    try {
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR' }
      })
      const data = await res.json()
      console.log('[GEOCODE] direct result:', data)
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (errDirect) {
      console.warn('[GEOCODE] direct fetch failed, attempting CORS proxy fallback:', errDirect)
      // fallback: try a public CORS proxy (use only for development)
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        const res2 = await fetch(proxyUrl)
        const data2 = await res2.json()
        console.log('[GEOCODE] proxy result:', data2)
        if (data2 && data2.length > 0) {
          return { lat: parseFloat(data2[0].lat), lon: parseFloat(data2[0].lon) }
        }
      } catch (errProxy) {
        console.warn('[GEOCODE] proxy fetch failed:', errProxy)
      }
    }
  } catch (e) {
    console.warn('Erro geocodificação:', e)
  }
  return null
}

export default function Mapa() {
  const { data: pontos, loading: l1 } = useCollection(COLLECTIONS.PONTOS)
  const { data: cacambas, loading: l2 } = useCollection(COLLECTIONS.CACAMBAS)
  const { data: ecopontos, loading: l3 } = useCollection(COLLECTIONS.ECOPONTOS)
  const { data: varricao, loading: l4 } = useCollection(COLLECTIONS.VARRICAO)

  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const layersRef = useRef({})

  const [filtros, setFiltros] = useState({
    pontos: true,
    cacambas: true,
    ecopontos: true,
    varricao: true,
  })
  const [geocodingStatus, setGeocodingStatus] = useState('')
  const [contadores, setContadores] = useState({ pontos: 0, cacambas: 0, ecopontos: 0, varricao: 0 })

  const loading = l1 || l2 || l3 || l4

  // DEBUG: mostrar conteúdo das coleções
  console.log('[DEBUG] PONTOS:', pontos)
  console.log('[DEBUG] CACAMBAS:', cacambas)
  console.log('[DEBUG] ECOPONTOS:', ecopontos)
  console.log('[DEBUG] VARRICAO:', varricao)

  // Inicializar mapa
  useEffect(() => {
    // Não executar enquanto dados estão carregando
    if (loading) return
    
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // marcador fixo de teste (ajuda a diagnosticar se layers estão visíveis)
    try {
      L.marker(MAP_CENTER).addTo(map).bindPopup('Ponto teste (centro)').openPopup()
      console.log('[DEBUG] Marcador fixo adicionado no centro')
    } catch (e) {
      console.warn('[DEBUG] Falha adicionando marcador fixo:', e)
    }

    layersRef.current = {
      pontos: L.layerGroup().addTo(map),
      cacambas: L.layerGroup().addTo(map),
      ecopontos: L.layerGroup().addTo(map),
      varricao: L.layerGroup().addTo(map),
    }

    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 400)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [loading])

  // Adicionar pontos viciados
  useEffect(() => {
    const layer = layersRef.current.pontos
    if (!layer) return
    layer.clearLayers()
    if (!filtros.pontos) return

    let count = 0
    const delay = 1100 // Nominatim: max 1 req/seg

    const addPontos = async () => {
      for (let i = 0; i < pontos.length; i++) {
        const p = pontos[i]
        let lat = p.lat || p.latitude
        let lon = p.lon || p.longitude || p.lng

        if (!lat || !lon) {
          setGeocodingStatus(`Geocodificando pontos viciados... (${i + 1}/${pontos.length})`)
          await new Promise(r => setTimeout(r, delay))
          console.log('[GEOCODE] ENDEREÇO ENVIADO (ponto):', p.endereco, p.bairro)
          const coords = await geocodificar(p.endereco, p.bairro)
          if (coords) {
            lat = coords.lat; lon = coords.lon
            // salvar coordenadas no Firestore para evitar nova geocodificação
            try {
              if (p.id) await update(COLLECTIONS.PONTOS, p.id, { lat, lon })
            } catch (e) {
              console.warn('[DB] falha ao salvar coords ponto:', e)
            }
          } else continue
        }

        console.log('[DEBUG] Marcador Ponto - coords:', { lat, lon, id: p.id || p._id })

        const cor = p.criticidade === 'Crítico' ? '#DC2626' :
                    p.criticidade === 'Atenção' ? '#F97316' : '#EF4444'

        const marker = L.circleMarker([lat, lon], {
          radius: 8, color: cor, fillColor: cor,
          fillOpacity: 0.85, weight: 2,
        })
        marker.bindPopup(`
          <div style="font-size:13px;min-width:180px">
            <strong style="color:#DC2626">📍 Ponto Viciado</strong><br/>
            <b>${p.endereco || '—'}</b><br/>
            Bairro: ${p.bairro || '—'}<br/>
            Criticidade: ${p.criticidade || '—'}<br/>
            Denúncias: ${p.denuncias || 0}<br/>
            Status: ${p.status || 'Ativo'}
          </div>
        `)
        layer.addLayer(marker)
        console.log('[DEBUG] layer.addLayer chamado para Ponto', { id: p.id || p._id })
        count++
      }
      setContadores(prev => ({ ...prev, pontos: count }))
      setGeocodingStatus('')
    }

    addPontos()
  }, [pontos, filtros.pontos])

  // Adicionar caçambas
  useEffect(() => {
    const layer = layersRef.current.cacambas
    if (!layer) return
    layer.clearLayers()
    if (!filtros.cacambas) return

    let count = 0
    const delay = 1100

    const addCacambas = async () => {
      for (let i = 0; i < cacambas.length; i++) {
        const c = cacambas[i]
        let lat = c.lat || c.latitude
        let lon = c.lon || c.longitude || c.lng

        if (!lat || !lon) {
          setGeocodingStatus(`Geocodificando caçambas... (${i + 1}/${cacambas.length})`)
          await new Promise(r => setTimeout(r, delay))
          console.log('[GEOCODE] ENDEREÇO ENVIADO (cacamba):', c.endereco, c.bairro)
          const coords = await geocodificar(c.endereco, c.bairro)
          if (coords) {
            lat = coords.lat; lon = coords.lon
            try {
              if (c.id) await update(COLLECTIONS.CACAMBAS, c.id, { lat, lon })
            } catch (e) {
              console.warn('[DB] falha ao salvar coords cacamba:', e)
            }
          } else continue
        }

        const marker = L.circleMarker([lat, lon], {
          radius: 8, color: '#D97706', fillColor: '#FCD34D',
          fillOpacity: 0.85, weight: 2,
        })
        marker.bindPopup(`
          <div style="font-size:13px;min-width:180px">
            <strong style="color:#D97706">🚧 Caçamba</strong><br/>
            <b>${c.endereco || '—'}</b><br/>
            Bairro: ${c.bairro || '—'}<br/>
            Empresa: ${c.empresa || '—'}<br/>
            Frequência: ${c.frequencia || '—'}<br/>
            Status: ${c.status || '—'}
          </div>
        `)
        layer.addLayer(marker)
        console.log('[DEBUG] layer.addLayer chamado para Cacamba', { id: c.id || c._id, lat, lon })
        count++
      }
      setContadores(prev => ({ ...prev, cacambas: count }))
      setGeocodingStatus('')
    }

    addCacambas()
  }, [cacambas, filtros.cacambas])

  // Adicionar ecopontos
  useEffect(() => {
    const layer = layersRef.current.ecopontos
    if (!layer) return
    layer.clearLayers()
    if (!filtros.ecopontos) return

    let count = 0
    const delay = 1100

    const addEcopontos = async () => {
      for (let i = 0; i < ecopontos.length; i++) {
        const e = ecopontos[i]
        let lat = e.lat || e.latitude
        let lon = e.lon || e.longitude || e.lng

        if (!lat || !lon) {
          setGeocodingStatus(`Geocodificando ecopontos... (${i + 1}/${ecopontos.length})`)
          await new Promise(r => setTimeout(r, delay))
          console.log('[GEOCODE] ENDEREÇO ENVIADO (ecoponto):', e.endereco, e.bairro)
          const coords = await geocodificar(e.endereco, e.bairro)
          if (coords) {
            lat = coords.lat; lon = coords.lon
            try {
              if (e.id) await update(COLLECTIONS.ECOPONTOS, e.id, { lat, lon })
            } catch (eErr) {
              console.warn('[DB] falha ao salvar coords ecoponto:', eErr)
            }
          } else continue
        }

        const cor = e.tipo === 'Ecoponto' ? '#15803D' :
                    e.tipo === 'PEV' ? '#16A34A' : '#4ADE80'

        const marker = L.circleMarker([lat, lon], {
          radius: 8, color: cor, fillColor: cor,
          fillOpacity: 0.85, weight: 2,
        })
        marker.bindPopup(`
          <div style="font-size:13px;min-width:180px">
            <strong style="color:#15803D">♻️ ${e.tipo || 'Ecoponto'}</strong><br/>
            <b>${e.nome || '—'}</b><br/>
            Endereço: ${e.endereco || '—'}<br/>
            Bairro: ${e.bairro || '—'}<br/>
            Horário: ${e.horario || '—'}
          </div>
        `)
        layer.addLayer(marker)
        console.log('[DEBUG] layer.addLayer chamado para Ecoponto', { id: e.id || e._id, lat, lon })
        count++
      }
      setContadores(prev => ({ ...prev, ecopontos: count }))
      setGeocodingStatus('')
    }

    addEcopontos()
  }, [ecopontos, filtros.ecopontos])

  // Adicionar varrição
  useEffect(() => {
    const layer = layersRef.current.varricao
    if (!layer) return
    layer.clearLayers()
    if (!filtros.varricao) return

    let count = 0
    const delay = 1100

    const addVarricao = async () => {
      for (let i = 0; i < varricao.length; i++) {
        const v = varricao[i]
        let lat = v.lat || v.latitude
        let lon = v.lon || v.longitude || v.lng

        if (!lat || !lon) {
          setGeocodingStatus(`Geocodificando varrição... (${i + 1}/${varricao.length})`)
          await new Promise(r => setTimeout(r, delay))
          console.log('[GEOCODE] ENDEREÇO ENVIADO (varricao):', v.rua, v.bairro)
          const coords = await geocodificar(v.rua, v.bairro)
          if (coords) {
            lat = coords.lat; lon = coords.lon
            try {
              if (v.id) await update(COLLECTIONS.VARRICAO, v.id, { lat, lon })
            } catch (eErr) {
              console.warn('[DB] falha ao salvar coords varricao:', eErr)
            }
          } else continue
        }

        const cor = v.frequencia === 'Diária' ? '#16A34A' :
                    v.frequencia === '3x/semana' ? '#2563EB' : '#EA580C'

        if (v.geometry && v.geometry.type) {
          // Geometria em GeoJSON (armazenada como LineString com coords [lon,lat])
          try {
            const style = { color: cor, weight: 4, opacity: 0.8 }
            const geo = L.geoJSON(v.geometry, {
              style: () => style,
              pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 4, color: cor, fillColor: cor, fillOpacity: 0.8 })
            })
            geo.bindPopup(`
              <div style="font-size:13px;min-width:180px">
                <strong style="color:${cor}">🧹 Varrição</strong><br/>
                <b>${v.rua || '—'}</b><br/>
                Bairro: ${v.bairro || '—'}<br/>
                Frequência: ${v.frequencia || '—'}<br/>
                Km: ${v.quilometragem || '—'}<br/>
                Equipe: ${v.equipe || '—'}
              </div>
            `)
            layer.addLayer(geo)
            console.log('[DEBUG] layer.addLayer chamado para Varricao (geo)', { id: v.id || v._id })
          } catch (e) {
            console.warn('[DEBUG] falha ao adicionar geoJSON varricao:', e)
          }
        } else {
          const marker = L.circleMarker([lat, lon], {
            radius: 6, color: cor, fillColor: cor,
            fillOpacity: 0.7, weight: 2,
          })
          marker.bindPopup(`
            <div style="font-size:13px;min-width:180px">
              <strong style="color:${cor}">🧹 Varrição</strong><br/>
              <b>${v.rua || '—'}</b><br/>
              Bairro: ${v.bairro || '—'}<br/>
              Frequência: ${v.frequencia || '—'}<br/>
              Km: ${v.quilometragem || '—'}<br/>
              Equipe: ${v.equipe || '—'}
            </div>
          `)
          layer.addLayer(marker)
          console.log('[DEBUG] layer.addLayer chamado para Varricao', { id: v.id || v._id, lat, lon })
        }
        count++
      }
      setContadores(prev => ({ ...prev, varricao: count }))
      setGeocodingStatus('')
    }

    addVarricao()
  }, [varricao, filtros.varricao])

  // Controle de visibilidade das camadas
  useEffect(() => {
    const map = mapRef.current
    const layers = layersRef.current
    if (!map || !layers.pontos) return

    if (filtros.pontos) map.addLayer(layers.pontos)
    else map.removeLayer(layers.pontos)

    if (filtros.cacambas) map.addLayer(layers.cacambas)
    else map.removeLayer(layers.cacambas)

    if (filtros.ecopontos) map.addLayer(layers.ecopontos)
    else map.removeLayer(layers.ecopontos)

    if (filtros.varricao) map.addLayer(layers.varricao)
    else map.removeLayer(layers.varricao)
  }, [filtros])

  if (loading) return <Loading />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Mapa Geral</h1>
        <p className="text-[#6B7280] text-sm">Visualização geoespacial — Osasco, SP</p>
      </div>

      {/* Contador */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#6B7280] flex flex-wrap gap-4">
        <span>📍 <b>{contadores.pontos}</b> pontos viciados</span>
        <span>🚧 <b>{contadores.cacambas}</b> caçambas</span>
        <span>♻️ <b>{contadores.ecopontos}</b> ecopontos</span>
        <span>🧹 <b>{contadores.varricao}</b> rotas de varrição</span>
      </div>

      {/* Status geocodificação */}
      {geocodingStatus && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3 text-sm text-[#1D4ED8] flex items-center gap-2">
          <span className="animate-spin">⏳</span> {geocodingStatus}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Painel de filtros */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm lg:w-52 flex-shrink-0">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Camadas</p>
          <div className="space-y-3">
            {[
              { key: 'pontos', label: 'Pontos Viciados', cor: '#DC2626', icon: '📍' },
              { key: 'cacambas', label: 'Caçambas', cor: '#D97706', icon: '🚧' },
              { key: 'ecopontos', label: 'Ecopontos / PEVs', cor: '#15803D', icon: '♻️' },
              { key: 'varricao', label: 'Varrição', cor: '#6B7280', icon: '🧹' },
              { key: 'mapa', label: 'Mapa Geral', cor: '#3B82F6', icon: '🗺️' },
            ].map(({ key, label, icon }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros[key]}
                  onChange={e => setFiltros(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm text-[#374151]">{icon} {label}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Legenda</p>
            <div className="space-y-1.5 text-xs text-[#6B7280]">
              <div className="flex items-center gap-2">
                <span style={{ background: '#DC2626', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Ponto crítico
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: '#F97316', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Ponto atenção
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: '#FCD34D', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Caçamba
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: '#15803D', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Ecoponto
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: '#16A34A', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Varrição diária
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: '#2563EB', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Varrição seg/qua/sex
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: '#EA580C', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
                Varrição ter/qui/sáb
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm flex-1">
          <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
        </div>
      </div>
    </div>
  )
}