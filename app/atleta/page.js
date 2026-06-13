'use client'

import { useState, useEffect } from 'react'
import styles from './atleta.module.css'

export default function AtletaLogin() {
  const VERSAO_PAGE = "v1.2.1" // 👈 Nova versão com persistência
  
  const [dataNascimento, setDataNascimento] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [atleta, setAtleta] = useState(null)
  const [versaoApi, setVersaoApi] = useState('v1.2.0')

  // 🔐 PERSISTÊNCIA: Roda assim que a página carrega no navegador
  useEffect(() => {
    const sessaoSalva = localStorage.getItem('kfc_sessao_atleta')
    if (sessaoSalva) {
      try {
        const dadosAtleta = JSON.parse(sessaoSalva)
        setAtleta(dadosAtleta)
        if (dadosAtleta.versionApi) {
          setVersaoApi(dadosAtleta.versionApi)
        }
      } catch (e) {
        // Se o dado estiver corrompido, limpa por segurança
        localStorage.removeItem('kfc_sessao_atleta')
      }
    }
  }, [])

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

      if (dados.versionApi) {
        setVersaoApi(dados.versionApi)
      }

      if (!response.ok) {
        throw new Error(dados.error || 'Erro ao processar login.')
      }

      // 🔐 PERSISTÊNCIA: Salva os dados do login no cofre do navegador
      localStorage.setItem('kfc_sessao_atleta', JSON.stringify(dados))
      setAtleta(dados)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  // 🔐 LOGOUT: Limpa o cofre do navegador e desloga de verdade
  const handleLogout = () => {
    localStorage.removeItem('kfc_sessao_atleta')
    setAtleta(null)
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
                <p><strong>Número da Camisa:</strong> {atleta.numero || 'Não informada'}</p>
              </div>

              {/* Usando a nova função de Logout seguro */}
              <button onClick={handleLogout} className={styles.logoutButton}>
                Sair do Portal
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© KFC 2026 | Page: {VERSAO_PAGE} | Route API: {versaoApi}</p>
        <p style={{ fontSize: '11px', marginTop: '4px', color: '#444' }}>Todos os direitos reservados</p>
      </footer>
    </div>
  )
}