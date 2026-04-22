'use client';
import { useEffect, useState } from 'react';
import { financeApi } from './services/api';
import TransactionModal from '@/app/components/TransactionModal';
import { INTELLIGENT_CATEGORIES } from '@/app/constants/categories';
import { Pencil, Trash2, Plus, Wallet, CalendarDays, Target } from 'lucide-react';

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
  const [editItem, setEditItem] = useState<Transacao | null>(null);

  const loadData = async () => {
    try {
      const listaData = await financeApi.getTransactions();
      setTransacoes(listaData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lógica de Data (Fuso Horário UTC para não "virar" o dia no Brasil)
  const dataAtual = new Date();
  const mesAnoAtual = dataAtual.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataAtual);

  // Filtro de Transações do Mês
  const tMes = transacoes.filter((t: Transacao) => {
    if (!t.data) return false;
    const mesAnoTransacao = new Date(t.data).toLocaleDateString('pt-BR', { 
      month: '2-digit', year: 'numeric', timeZone: 'UTC' 
    });
    return mesAnoTransacao === mesAnoAtual;
  });

  // Cálculos de Resumo
  const receitas = tMes.filter(t => t.tipo === 'RECEITA').reduce((acc, t) => acc + t.valor, 0);
  const despesas = tMes.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => acc + t.valor, 0);
  const saldoMes = receitas - despesas;

  // Agrupamento para o Gráfico de Barras (Somente Despesas)
  const gPorCat = tMes
    .filter(t => t.tipo === 'DESPESA')
    .reduce((acc: any, t: Transacao) => {
      const cat = t.categoria || 'OUTROS';
      acc[cat] = (acc[cat] || 0) + t.valor;
      return acc;
    }, {});

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* HEADER */}
        <div className="lg:col-span-12 flex justify-between items-center mb-4">
          <header>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">FinanceManager</h1>
            <p className="flex items-center gap-2 text-blue-600 font-bold uppercase text-[10px] bg-blue-50 px-3 py-1 rounded-full w-fit mt-2">
              <CalendarDays size={14}/> {nomeMes}
            </p>
          </header>
          <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600">
            <Wallet size={24} />
          </div>
        </div>

        {/* LADO ESQUERDO: DASHBOARD & GRÁFICOS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card de Saldo Principal */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <p className="text-xs opacity-50 uppercase font-black mb-2">Sobrou no mês</p>
            <h2 className="text-5xl font-bold tracking-tighter">
              R$ {saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex gap-6 mt-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] opacity-50 uppercase font-black">Ganhos</p>
                <p className="font-bold text-green-400">R$ {receitas.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-50 uppercase font-black">Gastos</p>
                <p className="font-bold text-red-400">R$ {despesas.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras de Categorias */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-800">
              <Target className="text-blue-500" size={20}/> Gastos por Categoria
            </h3>
            <div className="space-y-6">
              {Object.keys(gPorCat).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4 italic">Nenhuma despesa este mês.</p>
              ) : (
                Object.entries(gPorCat)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([key, valor]: any) => {
                    const catInfo = INTELLIGENT_CATEGORIES[key] || INTELLIGENT_CATEGORIES.OUTROS;
                    const Icon = catInfo.icon;
                    const porcentagem = despesas > 0 ? (valor / despesas) * 100 : 0;

                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${catInfo.color} text-white`}>
                              <Icon size={16}/>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase">{catInfo.label}</span>
                          </div>
                          <span className="text-sm font-black text-slate-800">R$ {Number(valor).toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${catInfo.color} rounded-full transition-all duration-1000`} 
                            style={{ width: `${porcentagem}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: LISTA DE HISTÓRICO */}
        <div className="lg:col-span-7">
          <h3 className="font-bold text-slate-800 mb-6 px-2">Histórico Recente</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {tMes.length === 0 ? (
              <div className="bg-white p-10 rounded-[2.5rem] border border-dashed text-center text-slate-400 italic">
                Nenhuma movimentação registrada em {nomeMes}.
              </div>
            ) : (
              tMes.sort((a, b) => b.id - a.id).map((t: Transacao) => {
                // PRIORIDADE: Se for Receita, força a cor verde e ícone de cifrão
                const categoriaChave = t.tipo === 'RECEITA' ? 'RECEITA' : t.categoria;
                const cat = INTELLIGENT_CATEGORIES[categoriaChave] || INTELLIGENT_CATEGORIES.OUTROS;
                const Icon = cat.icon;

                return (
                  <div key={t.id} className="bg-white p-4 rounded-3xl flex justify-between items-center border border-slate-50 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${cat.color} bg-opacity-10 ${cat.color.replace('bg-', 'text-')}`}>
                        <Icon size={24}/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{t.descricao}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {t.tipo === 'RECEITA' ? 'Entrada' : cat.label}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <p className={`font-black text-sm ${t.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.tipo === 'RECEITA' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                      </p>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setEditItem(t); setIsModalOpen(true); }} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Pencil size={16}/>
                        </button>
                        <button 
                          onClick={async () => { if(confirm('Excluir?')) { await financeApi.deleteTransacao(t.id); loadData(); } }} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Botão Flutuante (FAB) */}
      <button 
        onClick={() => { setEditItem(null); setIsModalOpen(true); }} 
        className="fixed bottom-8 right-8 bg-blue-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus size={32} />
      </button>

      {/* Modal de Transação */}
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditItem(null); }} 
        onRefresh={loadData} 
        initialData={editItem} 
      />
    </main>
  );
}