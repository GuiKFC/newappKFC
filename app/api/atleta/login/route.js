import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { dataNascimento } = await request.json();

    if (!dataNascimento) {
      return NextResponse.json({ error: 'Data de nascimento é obrigatória.' }, { status: 400 });
    }

    // 1. Busca o atleta de forma segura
    const athleteResult = await sql`
      SELECT id, nome, numero, tipo_membro 
      FROM atletas 
      WHERE data_nascimento = ${dataNascimento}
      LIMIT 1;
    `;

    if (athleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Atleta não encontrado com essa data.' }, { status: 404 });
    }

    const atleta = athleteResult.rows[0];

    // 2. Busca o fardamento dele para 2026
    const fardamentoResult = await sql`
      SELECT * FROM pedidos_fardamento 
      WHERE atleta_id = ${atleta.id} AND ano_campanha = 2026;
    `;
    const fardamento = fardamentoResult.rows[0] || {};

    // 3. Busca as configurações de preços e rateios globais
    const configResult = await sql`SELECT * FROM configuracoes_globais;`;
    const configs = configResult.rows;

    // Organiza as configs em um objeto fácil de ler
    const preços = {};
    let taxaConvidado = 0;
    let percentualRateio = 0;

    configs.forEach(cfg => {
      if (cfg.item_chave === 'kit_convidado') {
        taxaConvidado = parseFloat(cfg.valor);
        percentualRateio = cfg.percentual_rateio;
      } else {
        preços[cfg.item_chave] = {
          nome: cfg.nome_exibicao,
          valor: parseFloat(cfg.valor),
          status: cfg.status_producao
        };
      }
    });

    // 4. Calcula o valor das peças do atleta (Apenas se o status for LIBERADO)
    let subtotalPecas = 0;
    const pecasDetalhadas = [];

    const mapeamentoPecas = {
      tamanho_camisa: 'camisa_jogo',
      tamanho_calcao: 'calcao_jogo',
      tamanho_meiao: 'meiao_kit_duo',
      tamanho_polo: 'polo_passeio',
      tamanho_bermuda: 'bermuda_passeio',
      tamanho_jaqueta: 'jaqueta_agasalho',
      tamanho_calca: 'calca_agasalho'
    };

    Object.keys(mapeamentoPecas).forEach(coluna => {
      const tamanho = fardamento[coluna];
      const chavePeca = mapeamentoPecas[coluna];

      if (tamanho && preços[chavePeca] && preços[chavePeca].status === 'LIBERADO') {
        subtotalPecas += preços[chavePeca].valor;
        pecasDetalhadas.push({
          nome: preços[chavePeca].nome,
          tamanho: tamanho,
          valor: preços[chavePeca].valor
        });
      }
    });

    // 5. Adiciona taxa de adicionais (Apenas se for do tipo 'atleta' e o racha estiver ativo)
    let adicionais = 0;
    if (atleta.tipo_membro === 'atleta' && percentualRateio > 0) {
      adicionais = taxaConvidado; 
    }

    const valorTotal = subtotalPecas + adicionais;

    // 6. Define regra de parcelas do JSON implicitamente
    let parcelasMaximas = 2;
    if (valorTotal > 250 && valorTotal <= 500) parcelasMaximas = 3;
    if (valorTotal > 500) parcelasMaximas = 4;

    // 7. Busca o histórico de pagamentos já feitos
    const pagamentosResult = await sql`
      SELECT COALESCE(SUM(valor_pago), 0) as total_pago 
      FROM historico_pagamentos 
      WHERE atleta_id = ${atleta.id};
    `;
    const totalPago = parseFloat(pagamentosResult.rows[0].total_pago);

    // 8. Gera o cronograma de parcelas (Todo dia 10)
    const parcelas = [];
    let saldoRestantePagar = valorTotal - totalPago;
    const valorParcelaBase = parseFloat((valorTotal / parcelasMaximas).toFixed(2));

    const mesesVencimento = ['10/07/2026', '10/08/2026', '10/09/2026', '10/10/2026'];

    for (let i = 1; i <= parcelasMaximas; i++) {
      // Ajusta centavos na última parcela
      const valorParcela = (i === parcelasMaximas) 
        ? parseFloat((valorTotal - (valorParcelaBase * (parcelasMaximas - 1))).toFixed(2))
        : valorParcelaBase;

      // Define se a parcela específica já foi coberta pelo histórico de pagamentos
      let statusParcela = 'A Pagar';
      const acumuladoAteAqui = valorParcelaBase * i;

      if (totalPago >= acumuladoAteAqui) {
        statusParcela = 'Quitada';
      } else if (totalPago > (acumuladoAteAqui - valorParcelaBase)) {
        statusParcela = 'Parcial';
      }

      parcelas.push({
        numero: i,
        vencimento: mesesVencimento[i - 1],
        valor: valorParcela,
        status: statusParcela
      });
    }

    // Retorno limpo e seguro para o cliente
    return NextResponse.json({
      atleta: { nome: atleta.nome, numero: atleta.numero },
      pedido: pecasDetalhadas,
      financeiro: {
        subtotalPecas,
        adicionais,
        valorTotal,
        totalPago,
        saldoDevedor: Math.max(0, saldoRestantePagar),
        parcelas
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
