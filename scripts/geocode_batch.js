import admin from 'firebase-admin'
import { readFileSync, existsSync, writeFileSync } from 'fs'

// Usage:
// set GOOGLE_APPLICATION_CREDENTIALS or SERVICE_ACCOUNT to service account JSON path
// set NOMINATIM_EMAIL to a contact email (recommended by Nominatim)
// run: node scripts/geocode_batch.js

const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || SERVICE_ACCOUNT
const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL || 'seu-email@dominio.com'
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || NOMINATIM_EMAIL || 'gestao-urbana-osasco'
const NOMINATIM_DELAY_MS = parseInt(process.env.NOMINATIM_DELAY_MS, 10) || 2000
const NOMINATIM_MAX_RETRIES = parseInt(process.env.NOMINATIM_MAX_RETRIES, 10) || 6
const NOMINATIM_COUNTRY_CODES = 'br'

if (CREDENTIALS_PATH) {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.error(`O arquivo de credenciais não foi encontrado em: ${CREDENTIALS_PATH}`)
    process.exit(1)
  }
  const sa = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'))
  admin.initializeApp({ credential: admin.credential.cert(sa) })
} else {
  admin.initializeApp()
}

const db = admin.firestore()

const COLLECTIONS = [
  'pontos_viciados',
  'cacambas',
  'ecopontos',
  'varricao',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeAddress(input) {
  if (!input) return ''

  return input
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\bN[º°]\b/gi, 'N')
    .replace(/\bN[º°]?\b/gi, '')
    .replace(/\bS\/?N\b/gi, '')
    .replace(/["'‘’“”]/g, '')
    .replace(/\bE\b/gi, 'e')
    .replace(/,\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
}

function buildQueryVariants(data) {
  const address = data.endereco || data.rua || data.logradouro || data.nome || ''
  const neighborhood = data.bairro || ''
  const normalizedAddress = normalizeAddress(address)
  const normalizedNeighborhood = normalizeAddress(neighborhood)

  if (!normalizedAddress) return []

  const queries = []
  const baseQuery = [normalizedAddress, normalizedNeighborhood, 'Osasco', 'SP', 'Brasil']
    .filter(Boolean)
    .join(', ')

  queries.push(baseQuery)

  const withoutNeighborhood = [normalizedAddress, 'Osasco', 'SP', 'Brasil']
    .filter(Boolean)
    .join(', ')
  if (withoutNeighborhood !== baseQuery) queries.push(withoutNeighborhood)

  const noNumberAddress = normalizeAddress(
    normalizedAddress
      .replace(/\b\d+[º°]?\b/gi, '')
      .replace(/\bS\/?N\b/gi, '')
      .replace(/\bN\b/gi, '')
  )
  if (noNumberAddress && noNumberAddress !== normalizedAddress) {
    const noNumberQuery = [noNumberAddress, normalizedNeighborhood, 'Osasco', 'SP', 'Brasil']
      .filter(Boolean)
      .join(', ')
    if (!queries.includes(noNumberQuery)) queries.push(noNumberQuery)

    const noNumberQueryNoNeighborhood = [noNumberAddress, 'Osasco', 'SP', 'Brasil']
      .filter(Boolean)
      .join(', ')
    if (!queries.includes(noNumberQueryNoNeighborhood)) queries.push(noNumberQueryNoNeighborhood)
  }

  const firstSegment = normalizeAddress(normalizedAddress.split(/[-–—]/)[0])
  if (firstSegment && firstSegment !== normalizedAddress) {
    const firstSegmentQuery = [firstSegment, normalizedNeighborhood, 'Osasco', 'SP', 'Brasil']
      .filter(Boolean)
      .join(', ')
    if (!queries.includes(firstSegmentQuery)) queries.push(firstSegmentQuery)
  }

  return queries.filter(Boolean)
}

async function geocodeNominatim(query) {
  const baseUrl = 'https://nominatim.openstreetmap.org/search'
  const url = `${baseUrl}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=${NOMINATIM_COUNTRY_CODES}`

  for (let attempt = 1; attempt <= NOMINATIM_MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': NOMINATIM_USER_AGENT,
          'Accept-Language': 'pt-BR',
        },
      })

      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
        }
        return null
      }

      const retryAfter = res.headers.get('retry-after')
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.min(15 * attempt, 60)
      console.warn(`[GEOCODE] HTTP ${res.status} for ${query}. Retry ${attempt}/${NOMINATIM_MAX_RETRIES} after ${waitSeconds}s`)
      await sleep(waitSeconds * 1000)
    } catch (error) {
      console.warn(`[GEOCODE] request failed for ${query} attempt ${attempt}:`, error.message)
      await sleep(Math.min(15 * attempt, 60) * 1000)
    }
  }

  return null
}

const failedGeocodes = []

async function processCollection(col) {
  console.log(`\n=== Processando coleção: ${col}`)
  const snap = await db.collection(col).get()
  const docs = snap.docs
  console.log(`Total documentos em ${col}:`, docs.length)

  const toUpdate = docs.filter((d) => {
    const data = d.data()
    return !(data && data.lat && data.lon)
  })

  console.log(`Registros sem coords em ${col}:`, toUpdate.length)

  let updated = 0
  for (let i = 0; i < toUpdate.length; i += 1) {
    const d = toUpdate[i]
    const data = d.data()
    const id = d.id
    const queries = buildQueryVariants(data)

    if (queries.length === 0) {
      console.log(`[SKIP] doc ${col}/${id} sem campo de endereço detectável`)
      failedGeocodes.push({ collection: col, id, reason: 'sem campo de endereço detectável', data })
      continue
    }

    let coords = null
    for (let qIndex = 0; qIndex < queries.length; qIndex += 1) {
      const query = queries[qIndex]
      if (qIndex === 0) {
        console.log(`[GEOCODE] (${i + 1}/${toUpdate.length}) ${col}/${id} -> ${query}`)
      } else {
        console.log(`[GEOCODE] fallback ${qIndex} para ${query}`)
      }

      await sleep(NOMINATIM_DELAY_MS)
      coords = await geocodeNominatim(query)
      if (coords) break
    }

    if (coords) {
      try {
        await d.ref.update({ lat: coords.lat, lon: coords.lon })
        console.log(`[UPDATED] ${col}/${id} -> lat:${coords.lat} lon:${coords.lon}`)
        updated += 1
      } catch (error) {
        console.warn('[DB] falha ao atualizar documento:', col, id, error.message)
      }
    } else {
      console.log('[GEOCODE] sem resultado para', col, id)
      failedGeocodes.push({ collection: col, id, query: queries[0], queries, data })
    }
  }

  console.log(`Concluído ${col}: updated ${updated} / ${toUpdate.length}`)
}

async function main() {
  console.log('Iniciando geocodificação em lote (server-side)')
  for (const col of COLLECTIONS) {
    try {
      await processCollection(col)
    } catch (error) {
      console.error('Erro processando coleção', col, error)
    }
  }

  if (failedGeocodes.length > 0) {
    const outputPath = 'scripts/geocode_failed_records.json'
    writeFileSync(outputPath, JSON.stringify(failedGeocodes, null, 2), 'utf8')
    console.log(`\nFalha em ${failedGeocodes.length} docs. Lista salva em ${outputPath}`)
  }

  console.log('Processo finalizado')
  process.exit(0)
}

main().catch((error) => {
  console.error('Erro geral:', error)
  process.exit(1)
})
