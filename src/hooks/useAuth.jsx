import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { logout as firebaseLogout } from '../firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setPerfil(null)
        setLoading(false)
        return
      }
      setUser(firebaseUser)
      try {
        const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        if (snap.exists()) {
          setPerfil(snap.data().perfil)
        } else {
          setPerfil('Operador')
        }
      } catch {
        setPerfil('Operador')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = async () => {
    await firebaseLogout()
    setUser(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
