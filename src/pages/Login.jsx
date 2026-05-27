import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../firebase/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white p-4">
      <div className="bg-white rounded-[24px] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] w-full max-w-md p-8 border border-[#E5E7EB]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-[#15803d]">🏙️</span>
          </div>
          <h1 className="text-3xl font-bold text-[#111827]">Gestão Urbana</h1>
          <p className="text-[#6B7280] text-sm mt-1">Prefeitura de Osasco</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-2xl border border-[#FECACA]">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#16a34a]/40 focus:border-[#16a34a] outline-none transition"
              placeholder="seu@email.gov.br"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#16a34a]/40 focus:border-[#16a34a] outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-2xl transition disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-[#6B7280] text-center mt-6">
          Perfis: Gestor (total), Fiscal (cadastros), Operador (visualização)
        </p>
      </div>
    </div>
  )
}
