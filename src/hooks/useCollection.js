import { useEffect, useState } from 'react'
import { subscribe } from '../firebase/db'
import { filtrarDocumentosValidos } from '../utils/firestoreValidate'

export function useCollection(collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!collectionName) return
    setLoading(true)
    const unsub = subscribe(collectionName, (items) => {
      setData(items)
      setLoading(false)
    })
    return unsub
  }, [collectionName])

  return { data, loading }
}
