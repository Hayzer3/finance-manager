'use client';
import { useEffect, useState } from 'react';
import { financeApi } from './services/api';
import TransactionModal from '@/app/components/TransactionModal';
import { Pencil, Trash2, Plus, ArrowUpCircle, ArrowDownCircle, Wallet, CalendarDays } from 'lucide-react';

type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  data: string;
};

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null);

  const loadData = async () => {
    try {
      const listaData = await financeApi.getTransactions();
      setTransacoes(listaData);
    } catch (error) {
      console.error("Erro ao carregar dados do backend:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await financeApi.deleteTransacao(id);
      loadData();
    }
  };

  const handleEdit = (transacao: Transacao) => {
    setTransacaoParaEditar(transacao);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  // =======================================================
  // LÓGICA DO MÊS ATUAL (À PROVA DE FUSO HORÁRIO UTC)
  // =======================================================
  const dataAtual = new Date();
  const nomeDoMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataAtual);
  const mesAnoAtual = dataAtual.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

  const transacoesDoMes = transacoes.filter((t: Transacao) => {
    if (!t.data) return false;
    // Força o fuso horário para UTC para evitar que o dia "vire" no Brasil
    const mesAnoTransacao = new Date(t.data).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    return mesAnoTransacao === mesAnoAtual;
  });

  const receitasMes = transacoesDoMes
    .filter(t => t.tipo === 'RECEITA')
    .reduce((acc, t) => acc + t.valor, 0);

  const despesasMes = transacoesDoMes
    .filter(t => t.tipo === 'DESPESA')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoMes = receitasMes - despesasMes;

  const gastosPorCategoria = transacoesDoMes
    .filter((t: Transacao) => t.tipo === 'DESPESA')
    .reduce((acc: any, t: Transacao) => {
      const cat = t.categoria ? t.categoria.toUpperCase() : 'GERAL'; 
      acc[cat] = (acc[cat] || 0) + t.valor;
      return acc;
    }, {});

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-8 mt-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">FinanceManager</h1>
            <div className="flex items-center gap-2 mt-1 text-blue-600 bg-blue-100 w-max px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <CalendarDays size={14} />
              Visão de {nomeDoMes}
            </div>
          </div>
          <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
            <Wallet size={24} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <section className="space-y-4 flex flex-col">
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <p className="text-sm opacity-60 mb-1 font-medium">Sobrou neste mês</p>
              <h2 className="text-4xl font-bold">
                R$ {saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-green-500 uppercase mb-1">Ganhos do Mês</p>
                <p className="text-xl font-bold text-gray-800">R$ {receitasMes.toFixed(2)}</p>
              </div>
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-red-500 uppercase mb-1">Gastos do Mês</p>
                <p className="text-xl font-bold text-gray-800">R$ {despesasMes.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-800">Aonde meu dinheiro foi?</h3>
                <p className="text-xs text-gray-400">Despesas de {nomeDoMes}</p>
              </div>
              
              <div className="space-y-5">
                {Object.keys(gastosPorCategoria).length === 0 ? (
                  <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-xs text-gray-400 font-medium">Nenhum gasto registrado neste mês.</p>
                  </div>
                ) : (
                  Object.entries(gastosPorCategoria)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .map(([cat, valor]: any) => {
                      const totalDespesasCard = despesasMes > 0 ? despesasMes : 1; 
                      const porcentagem = Math.round((valor / totalDespesasCard) * 100);
                      
                      const cores: any = {
                        'LAZER': 'bg-purple-500',
                        'MERCADO': 'bg-orange-500',
                        'CONTAS': 'bg-blue-500',
                        'GERAL': 'bg-slate-800'
                      };
                      const corDaBarra = cores[cat] || 'bg-blue-400';

                      return (
                        <div key={cat} className="group">
                          <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${corDaBarra}`}></div>
                              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{cat}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-gray-800">R$ {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <span className="text-[10px] text-gray-400 ml-2 font-medium">({porcentagem}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full ${corDaBarra} transition-all duration-1000 ease-out group-hover:opacity-80`}
                              style={{ width: `${porcentagem}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Movimentações de {nomeDoMes}</h3>
            </div>
            <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
              {transacoesDoMes.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
                  Nenhuma movimentação neste mês.
                </div>
              ) : (
                transacoesDoMes.map((t: Transacao) => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.tipo === 'RECEITA' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {t.tipo === 'RECEITA' ? <ArrowUpCircle size={22}/> : <ArrowDownCircle size={22}/>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t.descricao}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{t.categoria}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-bold text-sm ${t.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.tipo === 'RECEITA' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                      </div>

                      <div className="flex gap-2 ml-2 border-l pl-4 border-gray-100">
                        <button 
                          onClick={() => handleEdit(t)} 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <button 
          onClick={() => {
            setTransacaoParaEditar(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-10 right-10 bg-blue-600 text-white w-16 h-16 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center z-[40] hover:scale-110 active:scale-90 transition-all cursor-pointer"
        >
          <Plus size={32} />
        </button>

        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setTransacaoParaEditar(null);
          }} 
          onRefresh={loadData}
          initialData={transacaoParaEditar}
        />
        
      </div>
    </main>
  );
}