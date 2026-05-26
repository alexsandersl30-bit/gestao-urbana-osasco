import { useEffect, useState } from 'react'
import { subscribeHistoricoVarricao } from '../firebase/db'

export function useHistoricoVarricao(varricaoId) {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!varricaoId) {
      setHistorico([])
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const unsub = subscribeHistoricoVarricao(varricaoId, (items) => {
      setHistorico(items)
      setLoading(false)
    })
    return unsub
  }, [varricaoId])

  return { historico, loading }
}
