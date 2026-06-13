'use client'

import { useState } from 'react'

export default function AtletaLogin() {
  const [dataNascimento, setDataNascimento] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [atleta, setAtleta] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    setAtleta(null)

    try {
      const response = await fetch('/api/atleta/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataNascimento })
      })

      const dados = await response.json()

      if (!response.ok) {
        throw new Error(dados.error || 'Erro ao buscar atleta.')
      }

      setAtleta(dados)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'between', 
      minHeight: '100vh', 
      backgroundColor: '#111', 
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      
      {/* Conteúdo Principal */}
      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#222', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#ffcc00' }}>Portal do Atleta</h1>
          
          {!atleta ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="data">Digite sua Data de Nascimento:</label>
                <input
                  id="data"
                  type="text"
                  placeholder="Ex: 11/08/1983"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  style={{ padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: '#fff', fontSize: '16px' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={carregando}
                style={{ padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#ffcc00', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.2s' }}
              >
                {carregando ? 'Buscando...' : 'Entrar'}
              </button>

              {erro && <p style={{ color: '#ff4444', fontSize: '14px', textAlign: 'center', marginTop: '10px' }}>{erro}</p>}
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#44ff44' }}>Bem-vindo!</h2>
              <p style={{ fontSize: '20px', margin: '16px 0' }}>{atleta.nome}</p>
              <div style={{ borderTop: '1px solid #444', paddingTop: '16px', marginTop: '16px', textAlign: 'left' }}>
                <p><strong>ID do Atleta:</strong> {atleta.id}</p>
                <p><strong>Cadastro Confirmado!</strong> Data de acesso liberada.</p>
              </div>
              <button 
                onClick={() => setAtleta(null)} 
                style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#444', color: '#fff', cursor: 'pointer' }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Rodapé com a versão EXATAMENTE onde você pediu */}
      <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #222', fontSize: '14px', color: '#666' }}>
        <p>© KFC 2026 (v1.0.5) - Todos os direitos reservados</p>
      </footer>

    </div>
  )
}