import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import fetchStreetGeometry from '../src/utils/osm_overpass.js'

// Usage:
// set GOOGLE_APPLICATION_CREDENTIALS or SERVICE_ACCOUNT to service account JSON path
// run: node scripts/fetch_varricao_geometry.js

const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || SERVICE_ACCOUNT
const DELAY_MS = parseInt(process.env.OVERPASS_DELAY_MS, 10) || 1200

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

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('Iniciando fetch de geometria para Varricao')
  const snap = await db.collection('varricao').get()
  const docs = snap.docs
  console.log('Total varricao:', docs.length)

  let updated = 0
  for (let i = 0; i < docs.length; i += 1) {
    const d = docs[i]
    const data = d.data()
    if (data.geometry) continue
    const rua = data.rua || data.rua || ''
    const bairro = data.bairro || ''
    if (!rua) {
      console.log(`[SKIP] ${d.id} sem rua`) 
      continue
    }
    try {
      console.log(`[FETCH] (${i + 1}/${docs.length}) ${d.id} -> ${rua} | ${bairro}`)
      const geo = await fetchStreetGeometry(rua, bairro)
      await sleep(DELAY_MS)
      if (geo) {
        // salvar como GeoJSON
        await d.ref.update({ geometry: geo })
        console.log(`[UPDATED] ${d.id} geometry saved`)
        updated += 1
      } else {
        console.log(`[NO RESULT] ${d.id} -> ${rua}`)
      }
    } catch (e) {
      console.warn('[ERR] ao buscar geometry:', d.id, e.message)
    }
  }

  console.log(`Concluído. Geometrias atualizadas: ${updated}`)
  process.exit(0)
}

main().catch(e => { console.error('Erro geral:', e); process.exit(1) })
