'use client'

import { useState, useEffect } from 'react'
import styles from './atleta.module.css'

export default function KfcPortal() {
  const VERSAO_PAGE = "v1.3.0" // 👈 Nova versão arquitetural
  
  const [dataNascimento, setDataNascimento] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [atleta, setAtleta] = useState(null)
  const [versaoApi, setVersaoApi] = useState('v1.2.0')
  
  // Controle para exibir ou não a modal/tela de login do Vestiário
  const [verVestiario, setVerVestiario] = useState(false)

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
        localStorage.removeItem('kfc_sessao_atleta')
      }
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

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
        throw new Error(dados.error || 'Erro ao acessar o Vestiário.')
      }

      localStorage.setItem('kfc_sessao_atleta', JSON.stringify(dados))
      setAtleta(dados)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('kfc_sessao_atleta')
    setAtleta(null)
    setVerVestiario(false)
  }

  return (
    <div className={styles.container}>
      
      {/* 📋 SEÇÃO 1: PORTAL INFORMATIVO PÚBLICO (Aparece se não estiver logado olhando o vestiário) */}
      {!verVestiario && !atleta ? (
        <div className={styles.publicPortal}>
          <header className={styles.publicHeader}>
            <div className={styles.logoBadge}>KFC</div>
            <h1 className={styles.mainTitle}>Kioske Futebol Clube</h1>
            <p className={styles.mainSubtitle}>Painel Oficial de Notícias e Informações</p>
          </header>

          <section className={styles.newsGrid}>
            <div className={styles.newsCard}>
              <span className={styles.newsTag}>Próximo Jogo</span>
              <h3>KFC vs Rival FC</h3>
              <p>Domingo às 10:00h - Arena Kioske. Compareça com o manto sagrado!</p>
            </div>

            <div className={styles.newsCard}>
              <span className={styles.newsTag}>Aviso</span>
              <h3>Manutenção de Uniformes</h3>
              <p>Retirada dos novos kits de treino agendada para a próxima terça-feira.</p>
            </div>
          </section>

          {/* Botão de chamada para a Área Restrita */}
          <button 
            className={styles.buttonVestiarioCall} 
            onClick={() => setVerVestiario(true)}
          >
            🔒 Acessar Vestiário do Atleta
          </button>
        </div>
      ) : (
        /* 🔒 SEÇÃO 2: ÁREA RESTRITA (FORMULÁRIO OU CONTEÚDO DO VESTIÁRIO) */
        <main className={styles.main}>
          <div className={styles.card}>
            
            <div className={styles.header}>
               <h1 className={styles.title}>🚪 Vestiário do Atleta</h1>
               <p className={styles.subtitle}>Área Restrita KFC</p>
            </div>
            
            {!atleta ? (
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Confirme sua Data de Nascimento</label>
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
                  {carregando ? 'Abrindo Armário...' : 'Liberar Entrada'}
                </button>

                <button 
                  type="button" 
                  className={styles.backButton} 
                  onClick={() => setVerVestiario(false)}
                >
                  Voltar ao Painel Público
                </button>

                {erro && (
                  <div className={styles.errorBox}>
                    <p className={styles.errorText}>{erro}</p>
                  </div>
                )}
              </form>
            ) : (
              /* CONTEÚDO PRIVADO DO ATLETA DENTRO DO VESTIÁRIO */
              <div className={styles.successBox}>
                <div className={styles.iconCheck}>✓</div>
                <h2>Seja bem-vindo ao seu armário!</h2>
                <p className={styles.welcomeText}>{atleta.nome}</p>
                
                <div className={styles.infoBox}>
                  <p><strong>Elenco:</strong> Atleta Titular</p>
                  <p><strong>Número da Camisa:</strong> {atleta.numero || 'Sem número'}</p>
                  <p><strong>ID do Registro:</strong> #00{atleta.id}</p>
                </div>

                <button onClick={handleLogout} className={styles.logoutButton}>
                  Sair do Vestiário (Trancar Armário)
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      <footer className={styles.footer}>
        <p>© KFC 2026 | Page: {VERSAO_PAGE} | Route API: {versaoApi}</p>
        <p style={{ fontSize: '11px', marginTop: '4px', color: '#444' }}>Todos os direitos reservados</p>
      </footer>
    </div>
  )
}