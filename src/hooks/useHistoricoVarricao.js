import { useEffect, useState } from 'react'
import { subscribeHistoricoVarricao } from '../firebase/db'

export function useHistoricoVarricao(varricaoId) {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(!!varricaoId)

  useEffect(() => {
    if (!varricaoId) return undefined
    const unsub = subscribeHistoricoVarricao(varricaoId, (items) => {
      setHistorico(items)
      setLoading(false)
    })
    return unsub
  }, [varricaoId])

  return { historico, loading }
}
