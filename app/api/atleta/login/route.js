import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  try {
    const { dataNascimento } = await request.json()

    if (!dataNascimento) {
      return new Response(JSON.stringify({ error: 'Data de nascimento é obrigatória.' }), { status: 400 })
    }

    // 🕵️‍♂️ Remove barras e limpa o texto para pegar só números
    const dataLimpa = dataNascimento.replace(/\D/g, '')

    if (dataLimpa.length !== 8) {
      return new Response(JSON.stringify({ error: 'Formato de data inválido. Use DD/MM/AAAA.' }), { status: 400 })
    }

    const dia = dataLimpa.substring(0, 2)
    const mes = dataLimpa.substring(2, 4)
    const ano = dataLimpa.substring(4, 8)
    const dataFormatadaBanco = `${ano}-${mes}-${dia}` // "1983-11-08"

    // 🚨 BUSCA BLINDADA: Filtra contendo a data, evitando bugs de fuso horário (00:00:00)
    const { data: atletas, error } = await supabase
      .from('atletas')
      .select('*')
      .gte('data_nascimento', `${dataFormatadaBanco}T00:00:00`)
      .lte('data_nascimento', `${dataFormatadaBanco}T23:59:59`)

    // Se não achar por fuso horário, tenta a busca direta simples como plano B
    let atletaFinal = atletas && atletas.length > 0 ? atletas[0] : null;

    if (!atletaFinal) {
      const { data: planoB } = await supabase
        .from('atletas')
        .select('*')
        .eq('data_nascimento', dataFormatadaBanco)
      
      if (planoB && planoB.length > 0) {
        atletaFinal = planoB[0];
      }
    }

    if (!atletaFinal) {
      return new Response(JSON.stringify({ error: `Atleta não encontrado para a data ${dataNascimento} (${dataFormatadaBanco}).` }), { status: 404 })
    }

    return new Response(JSON.stringify(atletaFinal), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message }), { status: 500 })
  }
}