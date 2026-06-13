'use client';
import { useState } from 'react';

export default function PainelAtleta() {
  const [dataNasc, setDataNasc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dados, setDados] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/atleta/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataNascimento: dataNasc }) // Formato esperado: YYYY-MM-DD
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao conectar.');
      
      setDados(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText('pixdokfc@gmail.com');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (!dados) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <h1 className="text-2xl font-bold text-center text-red-500 mb-2">KFC 2026</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Insira sua data de nascimento para acessar seu fardamento</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Data de Nascimento</label>
              <input 
                type="date" 
                required
                value={dataNasc}
                onChange={(e) => setDataNasc(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 font-semibold text-white py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando fardamento...' : 'Acessar Meu Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Cabeçalho Atleta */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase text-red-500 tracking-wider">Atleta Confirmado</span>
            <h2 className="text-3xl font-black">{dados.atleta.nome}</h2>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center">
            <span className="block text-xs text-gray-400 uppercase font-semibold">Número</span>
            <span className="text-xl font-bold text-yellow-500">{dados.atleta.numero}</span>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold border-b border-gray-800 pb-3 mb-4 text-gray-300">📋 Composição do Seu Pedido</h3>
          <div className="divide-y divide-gray-800">
            {dados.pedido.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between text-sm">
                <div>
                  <span className="font-semibold text-white">{item.nome}</span>
                  <span className="ml-2 bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-xs">Tam: {item.tamanho}</span>
                </div>
                <span className="font-medium text-gray-300">R$ {item.valor.toFixed(2)}</span>
              </div>
            ))}
            
            {dados.financeiro.adicionais > 0 && (
              <div className="py-3 flex justify-between text-sm text-yellow-500 bg-yellow-950/20 px-2 rounded mt-2">
                <span className="font-semibold">➕ Adicionais (Rateio de Convidados - 50%)</span>
                <span className="font-bold">R$ {dados.financeiro.adicionais.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-end">
            <span className="text-sm uppercase tracking-wider font-bold text-gray-400">Valor Total do Fardamento</span>
            <span className="text-2xl font-black text-white">R$ {dados.financeiro.valorTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Parcelas e Agenda Financeira */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold border-b border-gray-800 pb-3 mb-4 text-gray-300">💳 Extrato de Parcelamento (Vencimento todo dia 10)</h3>
          
          <div className="space-y-3">
            {dados.financeiro.parcelas.map((parc) => (
              <div key={parc.numero} className="flex items-center justify-between p-3.5 bg-gray-950 rounded-lg border border-gray-800">
                <div>
                  <span className="font-bold text-white text-sm block">Parcela {parc.numero} de {dados.financeiro.parcelas.length}</span>
                  <span className="text-xs text-gray-400 font-medium">Vence em: {parc.vencimento}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-200">R$ {parc.valor.toFixed(2)}</span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                    parc.status === 'Quitada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    parc.status === 'Parcial' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {parc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo Geral de Saldos */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-800 text-center">
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="block text-xs font-semibold text-gray-400 uppercase">Total Pago</span>
              <span className="text-xl font-bold text-emerald-400">R$ {dados.financeiro.totalPago.toFixed(2)}</span>
            </div>
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="block text-xs font-semibold text-gray-400 uppercase">Saldo Devedor</span>
              <span className="text-xl font-bold text-red-400">R$ {dados.financeiro.saldoDevedor.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Chave Pix Copia e Cola */}
        {dados.financeiro.saldoDevedor > 0 && (
          <div className="bg-red-950/20 border border-red-900/40 p-6 rounded-xl text-center space-y-3">
            <p className="text-sm font-medium text-red-300">Deseja realizar um pagamento? Use a chave oficial PIX do KFC abaixo:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <div className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg font-mono text-sm text-yellow-400 w-full select-all">
                pixdokfc@gmail.com
              </div>
              <button 
                onClick={copiarPix}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto"
              >
                {copiado ? '✓ Copiado!' : 'Copiar PIX'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
