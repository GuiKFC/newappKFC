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

    // Limpa tudo! Deixa SÓ os números.
    const apenasNumeros = dataNascimento.replace(/\D/g, '')

    if (apenasNumeros.length !== 8) {
      return new Response(JSON.stringify({ error: 'Digite a data completa com 8 números.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Busca todos os atletas para fazer filtro inteligente em memória (mata fuso horário)
    const { data: atletas, error } = await supabase
      .from('atletas')
      .select('*')

    if (error || !atletas) {
      return new Response(JSON.stringify({ error: 'Erro ao conectar no banco de dados.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Varre a lista limpando traços e comparando puro número, não importa a ordem de digitação
    const atletaEncontrado = atletas.find(atleta => {
      if (!atleta.data_nascimento) return false
      
      const dataBancoLimpa = atleta.data_nascimento.replace(/\D/g, '') // "19831108"
      
      return dataBancoLimpa.includes(apenasNumeros) || 
             apenasNumeros.includes(dataBancoLimpa) ||
             (apenasNumeros.substring(0,4) === dataBancoLimpa.substring(4,8) && 
              apenasNumeros.substring(4,6) === dataBancoLimpa.substring(2,4) && 
              apenasNumeros.substring(6,8) === dataBancoLimpa.substring(0,2)) ||
             (apenasNumeros.substring(4,8) === dataBancoLimpa.substring(0,4) && 
              apenasNumeros.substring(2,4) === dataBancoLimpa.substring(4,6) && 
              apenasNumeros.substring(0,2) === dataBancoLimpa.substring(6,8))
    })

    if (!atletaEncontrado) {
      return new Response(JSON.stringify({ error: 'Atleta não encontrado com essa data.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Sucesso absoluto!
    return new Response(JSON.stringify(atletaEncontrado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    // Garante que qualquer quebra séria responda um JSON válido e impeça o Unexpected end input
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}