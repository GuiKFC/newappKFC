import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  try {
    const { dataNascimento } = await request.json()

    if (!dataNascimento) {
      return new Response(JSON.stringify({ error: 'Data de nascimento é obrigatória.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 1. Limpa o que o usuário digitou (deixa só números)
    const digitosUsuario = dataNascimento.replace(/\D/g, '')

    if (digitosUsuario.length !== 8) {
      return new Response(JSON.stringify({ error: 'Digite a data completa com 8 números.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. Busca todos os atletas
    const { data: atletas, error } = await supabase
      .from('atletas')
      .select('*')

    if (error || !atletas) {
      return new Response(JSON.stringify({ error: 'Erro ao conectar no banco de dados.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 3. Cria combinações automáticas do que foi digitado para não errar nunca
    const dia = digitosUsuario.substring(0, 2)
    const mes = digitosUsuario.substring(2, 4)
    const ano = digitosUsuario.substring(4, 8)

    const formatoBR = `${dia}${mes}${ano}` // 11081983
    const formatoISO = `${ano}${mes}${dia}` // 19830811
    const formatoInvertidoBR = `${mes}${dia}${ano}` // 08111983
    const formatoInvertidoISO = `${ano}${dia}${mes}` // 19831108 (O formato que você viu no banco!)

    // 4. Varre os atletas procurando qualquer uma das combinações
    const atletaEncontrado = atletas.find(atleta => {
      if (!atleta.data_nascimento) return false
      
      const digitosBanco = atleta.data_nascimento.replace(/\D/g, '')
      
      // Corta caso o banco traga horas junto (pega só os primeiros 8 números do banco)
      const apenasDataBanco = digitosBanco.substring(0, 8)

      return apenasDataBanco === formatoBR || 
             apenasDataBanco === formatoISO || 
             apenasDataBanco === formatoInvertidoBR || 
             apenasDataBanco === formatoInvertidoISO
    })

    if (!atletaEncontrado) {
      return new Response(JSON.stringify({ error: `Atleta não encontrado para os dígitos: ${digitosUsuario}` }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Sucesso!
    return new Response(JSON.stringify(atletaEncontrado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}