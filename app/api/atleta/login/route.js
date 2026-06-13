import { createClient } from '@supabase/supabase-js'

// Conecta com as variáveis que você já tem na Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request) {
  try {
    const { dataNascimento } = await request.json()

    if (!dataNascimento) {
      return new Response(JSON.stringify({ error: 'Data de nascimento é obrigatória.' }), { status: 400 })
    }

    // Busca o atleta no Supabase pela data de nascimento
    const { data: atleta, error } = await supabase
      .from('atletas')
      .select('*')
      .eq('data_nascimento', dataNascimento)
      .single()

    if (error || !atleta) {
      return new Response(JSON.stringify({ error: 'Atleta não encontrado.' }), { status: 404 })
    }

    // Retorna os dados do atleta encontrados no seu Supabase
    return new Response(JSON.stringify(atleta), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.', detalhes: err.message }), { status: 500 })
  }
}