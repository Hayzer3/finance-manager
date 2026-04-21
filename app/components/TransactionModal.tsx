'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { financeApi } from '@/app/services/api';

type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  data: string;
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  initialData?: Transacao | null;
}

export default function TransactionModal({ isOpen, onClose, onRefresh, initialData }: TransactionModalProps) {
  const [tipo, setTipo] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('GERAL');

  useEffect(() => {
    if (initialData) {
      setTipo(initialData.tipo);
      setDescricao(initialData.descricao);
      setValor(initialData.valor.toString());
      setCategoria(initialData.categoria || 'GERAL');
    } else {
      setTipo('DESPESA');
      setDescricao('');
      setValor('');
      setCategoria('GERAL');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    
    if (isNaN(valorNumerico)) {
      alert('Valor inválido');
      return;
    }

    const dados = {
      descricao,
      valor: valorNumerico,
      tipo, // TypeScript feliz: sem toUpperCase() aqui!
      data: initialData?.data || new Date().toISOString().split('T')[0],
      categoria: tipo === 'RECEITA' ? 'SALÁRIO/RENDA' : categoria.toUpperCase()
    };

    try {
      if (initialData?.id) {
        await financeApi.updateTransacao(initialData.id, dados);
      } else {
        await financeApi.saveTransacao(dados);
      }
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro de comunicação com o servidor.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              type="button"
              onClick={() => setTipo('RECEITA')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${tipo === 'RECEITA' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
              Ganhei
            </button>
            <button 
              type="button"
              onClick={() => setTipo('DESPESA')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${tipo === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
            >
              Gastei
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">O que foi?</label>
            <input 
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-4 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder={tipo === 'RECEITA' ? 'Ex: Salário, Freelance...' : 'Ex: Mercado, Uber...'}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {tipo === 'DESPESA' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoria</label>
              <select 
                className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-4 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer font-medium uppercase text-sm"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="GERAL">Geral</option>
                <option value="LAZER">Lazer</option>
                <option value="MERCADO">Mercado</option>
                <option value="CONTAS">Contas/Fixos</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Valor (R$)</label>
            <input 
                required
                type="number"
                step="0.01"
                className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-4 px-4 text-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <button className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${tipo === 'RECEITA' ? 'bg-green-600' : 'bg-red-600'}`}>
            Salvar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}