import { useEffect, useState } from 'react'
import { subscribe } from '../firebase/db'

export function useCollection(collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(!!collectionName)

  useEffect(() => {
    if (!collectionName) return
    const unsub = subscribe(collectionName, (items) => {
      setData(items)
      setLoading(false)
    })
    return unsub
  }, [collectionName])

  return { data, loading }
}
