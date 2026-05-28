import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, resetPassword } from '../firebase/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

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

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)
    try {
      await resetPassword(resetEmail)
      setResetSuccess(true)
      setTimeout(() => {
        setResetModalOpen(false)
        setResetSuccess(false)
        setResetEmail('')
      }, 4000)
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setResetError('E-mail não encontrado no sistema.')
      } else if (err.code === 'auth/invalid-email') {
        setResetError('E-mail inválido.')
      } else {
        setResetError('Erro ao enviar e-mail. Tente novamente.')
      }
      console.error(err)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white p-4">
      <div className="bg-white rounded-[24px] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] w-full max-w-md p-8 border border-[#E5E7EB]">
        <div className="text-center mb-8">
  <img
    src="/logo.png"
    alt="Osasco Urbana"
    className="h-24 w-auto object-contain mx-auto mb-2"
  />
  <p className="text-[#6B7280] text-xs mt-1">Diretoria de Limpeza Urbana</p>
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
          <div className="text-right">
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="text-sm text-[#16a34a] hover:underline"
            >
              Esqueci minha senha
            </button>
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

      {resetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#111827] text-center mb-2">Redefinir senha</h2>
            <p className="text-[#6B7280] text-sm text-center mb-6">
              Digite seu e-mail cadastrado. Você receberá um link para criar uma nova senha.
            </p>

            {resetSuccess ? (
              <div className="bg-[#DCFCE7] text-[#15803d] text-sm p-4 rounded-2xl border border-[#BBF7D0] mb-4">
                E-mail enviado! Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#16a34a]/40 focus:border-[#16a34a] outline-none transition"
                    placeholder="seu@email.gov.br"
                  />
                </div>

                {resetError && (
                  <div className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-2xl border border-[#FECACA]">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(false)
                      setResetEmail('')
                      setResetError('')
                      setResetSuccess(false)
                    }}
                    className="flex-1 py-3 bg-white border border-[#E5E7EB] text-[#111827] font-semibold rounded-2xl transition hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-2xl transition disabled:opacity-60"
                  >
                    {resetLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                  </button>
                </div>
              </form>
            )}

            {resetSuccess && (
              <button
                onClick={() => {
                  setResetModalOpen(false)
                  setResetSuccess(false)
                  setResetEmail('')
                }}
                className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-2xl transition mt-4"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
