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

    // 1. Se a data já vier no formato correto do banco (AAAA-MM-DD), usa ela direto
    let dataFormatadaBanco = dataNascimento;

    // 2. Se não estiver no formato do banco, vamos tratar o texto
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
      const dataLimpa = dataNascimento.replace(/\D/g, '')

      if (dataLimpa.length !== 8) {
        return new Response(JSON.stringify({ error: 'Formato de data inválido. Use DD/MM/AAAA ou AAAA-MM-DD.' }), { status: 400 })
      }

      // Se os 4 primeiros dígitos forem maiores que 1300, a pessoa digitou o ANO primeiro (AAAAMMDD)
      if (parseInt(dataLimpa.substring(0, 4)) > 1300) {
        const ano = dataLimpa.substring(0, 4)
        const mes = dataLimpa.substring(4, 6)
        const dia = dataLimpa.substring(6, 8)
        dataFormatadaBanco = `${ano}-${mes}-${dia}`
      } else {
        // Se não, digitou o DIA primeiro (DDMMAAAA)
        const dia = dataLimpa.substring(0, 2)
        const mes = dataLimpa.substring(2, 4)
        const ano = dataLimpa.substring(4, 8)
        dataFormatadaBanco = `${ano}-${mes}-${dia}`
      }
    }

    // Busca direta no Supabase
    const { data: atleta, error } = await supabase
      .from('atletas')
      .select('*')
      .eq('data_nascimento', dataFormatadaBanco)
      .single()

    if (error || !atleta) {
      return new Response(JSON.stringify({ error: `Atleta não encontrado no Supabase para a data: ${dataFormatadaBanco}` }), { status: 404 })
    }

    return new Response(JSON.stringify(atleta), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message }), { status: 500 })
  }
}