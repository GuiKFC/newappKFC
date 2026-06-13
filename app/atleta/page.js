'use client'

import { useState } from 'react'
import styles from './atleta.module.css' // 👈 Importando o CSS separado!

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

      <footer className={styles.footer}>
        <p>© KFC 2026 (v1.0.8) - Todos os direitos reservados</p>
      </footer>

    </div>
  )
}