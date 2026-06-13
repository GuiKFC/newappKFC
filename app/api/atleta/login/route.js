import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  try {
    const { dataNascimento } = await request.json() // Recebe "11/08/1983" ou "11081983"

    if (!dataNascimento) {
      return new Response(JSON.stringify({ error: 'Data de nascimento é obrigatória.' }), { status: 400 })
    }

    // 🕵️‍♂️ TRADUTOR DE DATA: Remove barras e limpa o texto
    const dataLimpa = dataNascimento.replace(/\D/g, '') // Garante que só fiquem números: "11081983"

    if (dataLimpa.length !== 8) {
      return new Response(JSON.stringify({ error: 'Formato de data inválido. Use DD/MM/AAAA.' }), { status: 400 })
    }

    // Recorta a data brasileira (DD/MM/AAAA) e monta no padrão do banco (AAAA-MM-DD)
    const dia = dataLimpa.substring(0, 2)
    const mes = dataLimpa.substring(2, 4)
    const ano = dataLimpa.substring(4, 8)
    const dataFormatadaBanco = `${ano}-${mes}-${dia}` // Vira "1983-11-08" 🎉

    // Busca no Supabase com a data certinha
    const { data: atleta, error } = await supabase
      .from('atletas')
      .select('*')
      .eq('data_nascimento', dataFormatadaBanco)
      .single()

    if (error || !atleta) {
      return new Response(JSON.stringify({ error: 'Atleta não encontrado.' }), { status: 404 })
    }

    return new Response(JSON.stringify(atleta), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message }), { status: 500 })
  }
}