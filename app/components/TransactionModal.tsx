'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { financeApi } from '@/app/services/api';
import { predictCategory, INTELLIGENT_CATEGORIES } from '@/app/constants/categories';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

export default function TransactionModal({ isOpen, onClose, onRefresh, initialData }: TransactionModalProps) {
  // 1. Adicionado o tipo PLANEJADO
  const [tipo, setTipo] = useState<'RECEITA' | 'DESPESA' | 'PLANEJADO'>('DESPESA');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('OUTROS');
  // 2. Estado para a Data (inicia vazio, mas o useEffect preenche logo em seguida)
  const [dataLcto, setDataLcto] = useState('');

  // AUTO-PREDICT: Tenta adivinhar a categoria enquanto o usuário digita (Agora funciona para PLANEJADO também)
  useEffect(() => {
    if ((tipo === 'DESPESA' || tipo === 'PLANEJADO') && descricao.length > 2 && !initialData) {
      const suggested = predictCategory(descricao);
      setCategoria(suggested);
    }
  }, [descricao, tipo, initialData]);

  useEffect(() => {
    if (initialData) {
      setTipo(initialData.tipo);
      setDescricao(initialData.descricao);
      setValor(initialData.valor.toString());
      setCategoria(initialData.categoria || 'OUTROS');
      // Puxa a data do banco no formato correto (YYYY-MM-DD)
      const formattedDate = initialData.data 
        ? new Date(initialData.data).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
      setDataLcto(formattedDate);
    } else {
      setTipo('DESPESA'); 
      setDescricao(''); 
      setValor(''); 
      setCategoria('OUTROS');
      // Por padrão, a data vem preenchida com o dia de hoje
      setDataLcto(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const dados = {
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo,
      data: dataLcto, // 3. Usa a data que você escolheu no formulário
      categoria: tipo === 'RECEITA' ? 'RECEITA' : categoria
    };
    
    await (initialData ? financeApi.updateTransacao(initialData.id, dados) : financeApi.saveTransacao(dados));
    onRefresh(); 
    onClose();
  };

  // Define a cor do botão de Salvar baseado no tipo selecionado
  const buttonColor = tipo === 'RECEITA' ? 'bg-green-600' : tipo === 'PLANEJADO' ? 'bg-yellow-500' : 'bg-red-600';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Editar' : 'Novo'} Lançamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* BOTÕES DE TIPO */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setTipo('RECEITA')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'RECEITA' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Ganhei</button>
            <button type="button" onClick={() => setTipo('DESPESA')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Gastei</button>
            <button type="button" onClick={() => setTipo('PLANEJADO')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'PLANEJADO' ? 'bg-white text-yellow-500 shadow-sm' : 'text-gray-500'}`}>Desejo</button>
          </div>

          <input required className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="O que foi?" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

          {/* O campo de categoria agora aparece tanto para Despesa quanto para Planejado/Desejo */}
          {(tipo === 'DESPESA' || tipo === 'PLANEJADO') && (
            <select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {Object.entries(INTELLIGENT_CATEGORIES).filter(([k]) => k !== 'RECEITA' && k !== 'SIMULACAO').map(([key, cat]: any) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          )}

          {/* NOVO CAMPO: DATA */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2">Data</label>
              <input 
                required 
                type="date" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={dataLcto} 
                onChange={(e) => setDataLcto(e.target.value)} 
              />
            </div>
            
            <div className="flex-[1.5]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-2">Valor (R$)</label>
              <input required type="number" step="0.01" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
          </div>

          <button className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${buttonColor}`}>
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}