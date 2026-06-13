import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  const VERSION_API = "v1.1.5" // 👈 Sincronizado na v1.1.5

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

    // Formato exato do banco que você validou no print: YYYY-MM-DD
    const formatoBanco = `${ano}-${mes}-${dia}` 

    // Busca direta e ultra veloz usando correspondência exata
    const { data: atletas, error } = await supabase
      .from('atletas')
      .select('*')
      .eq('data_nascimento', formatoBanco)

    if (error) {
      return new Response(JSON.stringify({ error: `Erro no banco: ${error.message}`, versionApi: VERSION_API }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!atletas || atletas.length === 0) {
      return new Response(JSON.stringify({ 
        error: `Nenhum registro retornado para a data ${formatoBanco}. Verifique a policy RLS no Supabase.`, 
        versionApi: VERSION_API 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const atletaEncontrado = atletas[0]

    return new Response(JSON.stringify({ ...atletaEncontrado, versionApi: VERSION_API }), {
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