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
      // Faz a chamada para a nossa API blindada (v1.0.6)
      const response = await fetch('/api/atleta/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataNascimento })
      })

      const dados = await response.json()

      if (!response.ok) {
        // Se a API retornar erro (tipo Atleta não encontrado), exibe a mensagem detalhada
        throw new Error(dados.error || 'Erro ao buscar atleta.')
      }

      // Se deu certo, salva os dados do atleta no estado para exibir na tela
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
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Área Central do Login */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px' 
      }}>
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '40px', 
          borderRadius: '16px', 
          width: '100%', 
          maxWidth: '400px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          border: '1px solid #333'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
             <h1 style={{ color: '#ffcc00', fontSize: '28px', margin: '0 0 10px 0' }}>Portal do Atleta</h1>
             <p style={{ color: '#888', fontSize: '14px' }}>Acesse seu extrato e informações</p>
          </div>
          
          {!atleta ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#ccc' }}>
                  Data de Nascimento
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  style={{ 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: '1px solid #444', 
                    backgroundColor: '#000', 
                    color: '#fff', 
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={carregando}
                style={{ 
                  padding: '14px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  backgroundColor: carregando ? '#555' : '#ffcc00', 
                  color: '#000', 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  cursor: carregando ? 'not-allowed' : 'pointer',
                  transition: '0.3s'
                }}
              >
                {carregando ? 'Verificando...' : 'Entrar no Sistema'}
              </button>

              {erro && (
                <div style={{ 
                  backgroundColor: 'rgba(255, 68, 68, 0.1)', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: '1px solid #ff4444' 
                }}>
                  <p style={{ color: '#ff4444', fontSize: '13px', textAlign: 'center', margin: 0 }}>
                    {erro}
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* Layout exibido após o Login com sucesso */
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#44ff44', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px auto' 
              }}>
                <span style={{ color: '#000', fontSize: '30px' }}>✓</span>
              </div>
              <h2 style={{ color: '#fff', marginBottom: '8px' }}>Bem-vindo!</h2>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffcc00', margin: '0 0 24px 0' }}>
                {atleta.nome}
              </p>
              
              <div style={{ 
                backgroundColor: '#000', 
                padding: '15px', 
                borderRadius: '10px', 
                textAlign: 'left',
                fontSize: '14px',
                color: '#aaa',
                border: '1px solid #333'
              }}>
                <p style={{ margin: '5px 0' }}><strong>Status:</strong> Atleta Ativo</p>
                <p style={{ margin: '5px 0' }}><strong>ID:</strong> {atleta.id}</p>
              </div>

              <button 
                onClick={() => setAtleta(null)} 
                style={{ 
                  marginTop: '24px', 
                  padding: '10px 20px', 
                  borderRadius: '6px', 
                  border: '1px solid #444', 
                  backgroundColor: 'transparent', 
                  color: '#888', 
                  cursor: 'pointer' 
                }}
              >
                Sair do Portal
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Rodapé com a versão EXATAMENTE onde você pediu */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '30px', 
        fontSize: '13px', 
        color: '#555',
        letterSpacing: '0.5px'
      }}>
        <p>© KFC 2026 (v1.0.6) - Todos os direitos reservados</p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}