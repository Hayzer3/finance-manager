'use client';
import { useEffect, useState, useMemo } from 'react';
import { financeApi } from './services/api';
import TransactionModal from '@/app/components/TransactionModal';
import { INTELLIGENT_CATEGORIES } from '@/app/constants/categories';
import { Pencil, Trash2, Plus, Wallet, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, CalendarDays, Target, Sparkles } from 'lucide-react';

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
  
  // Estado para controlar qual mês estamos vendo
  const [dataFoco, setDataFoco] = useState(new Date());

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

  // Funções de Navegação
  const proximoMes = () => setDataFoco(new Date(dataFoco.setMonth(dataFoco.getMonth() + 1)));
  const mesAnterior = () => setDataFoco(new Date(dataFoco.setMonth(dataFoco.getMonth() - 1)));

  // Lógica de Filtro e Cálculos (Memorizada para performance)
  const dashboard = useMemo(() => {
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataFoco);
    const mesAnoAtual = dataFoco.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

    // Filtra transações do mês focado
    const tMes = transacoes.filter((t: Transacao) => {
      if (!t.data) return false;
      const mesAnoTransacao = new Date(t.data).toLocaleDateString('pt-BR', { 
        month: '2-digit', year: 'numeric', timeZone: 'UTC' 
      });
      return mesAnoTransacao === mesAnoAtual;
    });

    // Cálculos Financeiros
    const receitas = tMes.filter(t => t.tipo === 'RECEITA').reduce((acc, t) => acc + t.valor, 0);
    
    // Despesas Reais (exclui o que for PLANEJADO na categoria)
    const despesas = tMes
      .filter(t => t.tipo === 'DESPESA' && t.categoria !== 'PLANEJADO')
      .reduce((acc, t) => acc + t.valor, 0);
      
    // Apenas itens de SIMULAÇÃO/PLANEJADO
    const planejado = tMes
      .filter(t => t.categoria === 'PLANEJADO')
      .reduce((acc, t) => acc + t.valor, 0);
    
    const saldoAtual = receitas - despesas;
    const saldoAposCompras = saldoAtual - planejado;
    
    // Comparação com o mês anterior
    const dataPassada = new Date(dataFoco);
    dataPassada.setMonth(dataPassada.getMonth() - 1);
    const mesAnoPassado = dataPassada.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

    const despesasPassadas = transacoes
      .filter((t: Transacao) => t.tipo === 'DESPESA' && t.categoria !== 'PLANEJADO' && 
        new Date(t.data).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' }) === mesAnoPassado)
      .reduce((acc, t) => acc + t.valor, 0);

    const diferenca = despesasPassadas > 0 ? ((despesas - despesasPassadas) / despesasPassadas) * 100 : 0;

    // Agrupamento por Categoria (para os gráficos)
    const gPorCat = tMes
      .filter(t => t.tipo === 'DESPESA' && t.categoria !== 'PLANEJADO')
      .reduce((acc: any, t: Transacao) => {
        const cat = t.categoria || 'OUTROS';
        acc[cat] = (acc[cat] || 0) + t.valor;
        return acc;
      }, {});

    return { tMes, receitas, despesas, planejado, saldoAtual, saldoAposCompras, nomeMes, diferenca, gPorCat };
  }, [transacoes, dataFoco]);

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await financeApi.deleteTransacao(id);
      loadData();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* NAVEGAÇÃO DE MÊS SUPERIOR */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <button onClick={mesAnterior} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
          <div className="text-center">
            <h2 className="text-xl font-black capitalize text-slate-800">{dashboard.nomeMes}</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Navegação Mensal</p>
          </div>
          <button onClick={proximoMes} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LADO ESQUERDO: DASHBOARD */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD PRETO DE SALDO */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <p className="text-xs opacity-50 uppercase font-black mb-2">Saldo Real do Mês</p>
              <h2 className="text-5xl font-bold tracking-tighter">
                R$ {dashboard.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              
              {/* TAG DE COMPARAÇÃO COM MÊS PASSADO */}
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold">
                {dashboard.diferenca > 0 ? (
                  <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                    <TrendingUp size={14}/> {dashboard.diferenca.toFixed(1)}% a mais que mês passado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                    <TrendingDown size={14}/> {Math.abs(dashboard.diferenca).toFixed(1)}% menos gastos
                  </span>
                )}
              </div>

              {/* CARD AMARELO DE SIMULAÇÃO (SÓ APARECE SE HOUVER DESEJOS) */}
              {dashboard.planejado > 0 && (
                <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl">
                  <p className="text-[10px] text-yellow-400 font-black uppercase flex items-center gap-2 mb-1">
                    <Sparkles size={12}/> Se comprar os desejos:
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">
                    R$ {dashboard.saldoAposCompras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {/* MINI CARDS DE ENTRADAS, SAÍDAS E DESEJOS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 lg:p-5 rounded-[2rem] shadow-sm border border-slate-100">
                <p className="text-[10px] text-green-600 font-black uppercase mb-1">Entradas</p>
                <p className="text-lg font-bold text-slate-800">R$ {dashboard.receitas.toFixed(0)}</p>
              </div>
              <div className="bg-white p-4 lg:p-5 rounded-[2rem] shadow-sm border border-slate-100">
                <p className="text-[10px] text-red-600 font-black uppercase mb-1">Saídas</p>
                <p className="text-lg font-bold text-slate-800">R$ {dashboard.despesas.toFixed(0)}</p>
              </div>
              <div className="bg-white p-4 lg:p-5 rounded-[2rem] shadow-sm border border-yellow-100 bg-yellow-50/30">
                <p className="text-[10px] text-yellow-600 font-black uppercase mb-1">Desejos</p>
                <p className="text-lg font-bold text-slate-800">R$ {dashboard.planejado.toFixed(0)}</p>
              </div>
            </div>

            {/* GRÁFICO DE CATEGORIAS */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-800">
                <Target className="text-blue-500" size={20}/> Gastos por Categoria
              </h3>
              <div className="space-y-6">
                {Object.keys(dashboard.gPorCat).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4 italic">Sem gastos reais registrados.</p>
                ) : (
                  Object.entries(dashboard.gPorCat)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .map(([key, valor]: any) => {
                      const catInfo = INTELLIGENT_CATEGORIES[key] || INTELLIGENT_CATEGORIES.OUTROS;
                      const Icon = catInfo.icon;
                      const porcentagem = dashboard.despesas > 0 ? (valor / dashboard.despesas) * 100 : 0;
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
                            <div className={`h-full ${catInfo.color} rounded-full`} style={{ width: `${porcentagem}%` }}></div>
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
            <h3 className="font-bold text-slate-800 mb-6 px-2 capitalize">Movimentações de {dashboard.nomeMes}</h3>
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
              {dashboard.tMes.length === 0 ? (
                <div className="bg-white p-10 rounded-[2.5rem] border border-dashed text-center text-slate-400 italic">
                  Nenhuma movimentação em {dashboard.nomeMes}.
                </div>
              ) : (
                // ORDENAÇÃO: Por data mais recente primeiro
                dashboard.tMes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime() || b.id - a.id).map((t: Transacao) => {
                  
                  // Lógica para definir se é Planejado, Receita ou Categoria Normal
                  const isPlanejado = t.categoria === 'PLANEJADO';
                  const categoriaChave = t.tipo === 'RECEITA' ? 'RECEITA' : t.categoria;
                  const cat = INTELLIGENT_CATEGORIES[categoriaChave] || INTELLIGENT_CATEGORIES.OUTROS;
                  
                  // Se for planejado, coloca o ícone de estrelinha
                  const Icon = isPlanejado ? Sparkles : cat.icon;

                  return (
                    <div key={t.id} className={`bg-white p-4 rounded-3xl flex justify-between items-center border transition-all group hover:shadow-md ${isPlanejado ? 'border-yellow-200 bg-yellow-50/40' : 'border-slate-50'}`}>
                      
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isPlanejado ? 'bg-yellow-400 text-white shadow-sm' : cat.color + ' bg-opacity-10 ' + cat.color.replace('bg-', 'text-')}`}>
                          <Icon size={24}/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{t.descricao}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' })} • {t.tipo === 'RECEITA' ? 'Entrada' : isPlanejado ? 'Desejo' : cat.label}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <p className={`font-black text-sm ${isPlanejado ? 'text-yellow-500' : (t.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600')}`}>
                          {t.tipo === 'RECEITA' ? '+' : (isPlanejado ? '' : '-')} R$ {t.valor.toFixed(2)}
                        </p>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => { setEditItem(t); setIsModalOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            <Pencil size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)} 
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