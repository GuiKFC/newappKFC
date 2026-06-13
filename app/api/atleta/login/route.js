import { createClient } from '@supabase/supabase-js'

// 🔐 SEGURANÇA: Usando variáveis privadas do servidor. O navegador nunca terá acesso a elas.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  const VERSION_API = "v1.2.0"

  try {
    const { dataNascimento } = await request.json()

    if (!dataNascimento) {
      return new Response(JSON.stringify({ error: 'Data de nascimento é obrigatória.', versionApi: VERSION_API }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const digitos = dataNascimento.replace(/\D/g, '')

    if (digitos.length !== 8) {
      return new Response(JSON.stringify({ error: 'Digite a data completa com 8 números.', versionApi: VERSION_API }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const dia = digitos.substring(0, 2)
    const mes = digitos.substring(2, 4)
    const ano = digitos.substring(4, 8)
    const formatoBanco = `${ano}-${mes}-${dia}` 

    // 🔐 SEGURANÇA: Buscando APENAS as colunas públicas necessárias. Nunca use '*' em rotas de login.
    const { data: atletas, error } = await supabase
      .from('atletas')
      .select('id, nome, numero') 
      .eq('data_nascimento', formatoBanco)

    if (error) {
      return new Response(JSON.stringify({ error: 'Erro de comunicação interna.', versionApi: VERSION_API }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!atletas || atletas.length === 0) {
      // 🔐 SEGURANÇA: Mensagem genérica para evitar que invasores fiquem testando datas para adivinhar quais existem
      return new Response(JSON.stringify({ 
        error: 'Dados de acesso incorretos.', 
        versionApi: VERSION_API 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const atletaEncontrado = atletas[0]

    // Aqui fingimos um token básico de sessão para o front-end começar a se estruturar legitimamente
    const respostaSegura = {
      authenticated: true,
      id: atletaEncontrado.id,
      nome: atletaEncontrado.nome,
      numero: atletaEncontrado.numero,
      versionApi: VERSION_API
    }

    return new Response(JSON.stringify(respostaSegura), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', versionApi: VERSION_API }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}