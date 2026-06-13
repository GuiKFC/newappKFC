'use client'

import { useState } from 'react'
import styles from './atleta.module.css'

export default function AtletaLogin() {
  const VERSAO_PAGE = "v1.1.3" // Versão fixa do Front-end
  
  const [dataNascimento, setDataNascimento] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [atleta, setAtleta] = useState(null)
  const [versaoApi, setVersaoApi] = useState('v1.1.3') // Deixamos o padrão esperado, mas ela atualiza dinamicamente

  const handleLogin = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    setAtleta(null)

    try {
      const response = await fetch('https://newapp-kfc.vercel.app/api/atleta/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataNascimento })
      })

      const dados = await response.json()

      // Sempre que a API responder (com erro ou sucesso), capturamos a versão real dela
      if (dados.versionApi) {
        setVersaoApi(dados.versionApi)
      }

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
    <div className={styles.container}>
      
      <main className={styles.main}>
        <div className={styles.card}>
          
          <div className={styles.header}>
             <h1 className={styles.title}>Portal do Atleta</h1>
             <p className={styles.subtitle}>Acesse seu extrato e informações</p>
          </div>
          
          {!atleta ? (
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Data de Nascimento</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <button type="submit" disabled={carregando} className={styles.button}>
                {carregando ? 'Verificando...' : 'Entrar no Sistema'}
              </button>

              {erro && (
                <div className={styles.errorBox}>
                  <p className={styles.errorText}>{erro}</p>
                </div>
              )}
            </form>
          ) : (
            <div className={styles.successBox}>
              <div className={styles.iconCheck}>
                <span>✓</span>
              </div>
              <h2>Bem-vindo!</h2>
              <p className={styles.welcomeText}>{atleta.nome}</p>
              
              <div className={styles.infoBox}>
                <p><strong>Status:</strong> Atleta Ativo</p>
                <p><strong>ID:</strong> {atleta.id}</p>
              </div>

              <button onClick={() => setAtleta(null)} className={styles.logoutButton}>
                Sair do Portal
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Rodapé exibindo as duas versões SEMPRE juntas */}
      <footer className={styles.footer}>
        <p>© KFC 2026 | Page: {VERSAO_PAGE} | Route API: {versaoApi}</p>
        <p style={{ fontSize: '11px', marginTop: '4px', color: '#444' }}>Todos os direitos reservados</p>
      </footer>

    </div>
  )
}