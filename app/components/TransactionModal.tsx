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
  const [tipo, setTipo] = useState<'RECEITA' | 'DESPESA'>('DESPESA');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('OUTROS');

  // AUTO-PREDICT: Tenta adivinhar a categoria enquanto o usuário digita
  useEffect(() => {
    if (tipo === 'DESPESA' && descricao.length > 2 && !initialData) {
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
    } else {
      setTipo('DESPESA'); setDescricao(''); setValor(''); setCategoria('OUTROS');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const dados = {
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo,
      data: initialData?.data || new Date().toISOString().split('T')[0],
      categoria: tipo === 'RECEITA' ? 'RECEITA' : categoria
    };
    await (initialData ? financeApi.updateTransacao(initialData.id, dados) : financeApi.saveTransacao(dados));
    onRefresh(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Editar' : 'Novo'} Lançamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setTipo('RECEITA')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'RECEITA' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Ganhei</button>
            <button type="button" onClick={() => setTipo('DESPESA')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Gastei</button>
          </div>

          <input required className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="O que foi?" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

          {tipo === 'DESPESA' && (
            <select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {Object.entries(INTELLIGENT_CATEGORIES).filter(([k]) => k !== 'RECEITA').map(([key, cat]: any) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          )}

          <input required type="number" step="0.01" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="R$ 0,00" value={valor} onChange={(e) => setValor(e.target.value)} />

          <button className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${tipo === 'RECEITA' ? 'bg-green-600' : 'bg-red-600'}`}>Salvar</button>
        </form>
      </div>
    </div>
  );
}