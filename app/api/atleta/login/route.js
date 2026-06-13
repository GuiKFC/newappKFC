import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  // Guardamos a versão da API em uma constante para fácil manutenção
  const VERSION_API = "v1.1.3"

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

    const padraoExatoBanco = `${ano}-${mes}-${dia}`       // "1983-08-11"
    const padraoInvertidoBanco = `${ano}-${dia}-${mes}`   // "1983-11-08"

    const { data: atletas, error } = await supabase
      .from('atletas')
      .select('*')

    if (error || !atletas) {
      return new Response(JSON.stringify({ error: 'Erro ao conectar no banco de dados.', versionApi: VERSION_API }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const atletaEncontrado = atletas.find(atleta => {
      if (!atleta.data_nascimento) return false
      const dataAtletaTexto = atleta.data_nascimento.toString()
      return dataAtletaTexto.includes(padraoExatoBanco) || dataAtletaTexto.includes(padraoInvertidoBanco)
    })

    if (!atletaEncontrado) {
      return new Response(JSON.stringify({ 
        error: `Atleta não encontrado para a data: ${padraoExatoBanco}`, 
        versionApi: VERSION_API 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Injeta a versão da API junto com os dados do atleta encontrado
    const respostaSucesso = { ...atletaEncontrado, versionApi: VERSION_API }

    return new Response(JSON.stringify(respostaSucesso), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message, versionApi: VERSION_API }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}