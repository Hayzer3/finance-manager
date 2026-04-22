'use client';
import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

interface MetasModalProps {
  isOpen: boolean;
  onClose: () => void;
  metasAtuais: Record<string, number>;
  onSave: (novasMetas: Record<string, number>) => void;
}

export default function MetasModal({ isOpen, onClose, metasAtuais, onSave }: MetasModalProps) {
  const [localMetas, setLocalMetas] = useState<Record<string, number>>({});
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoValor, setNovoValor] = useState('');

  useEffect(() => {
    setLocalMetas(metasAtuais);
  }, [metasAtuais, isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!novaCategoria.trim() || !novoValor) return;
    setLocalMetas({
      ...localMetas,
      [novaCategoria.trim().toUpperCase()]: parseFloat(novoValor)
    });
    setNovaCategoria('');
    setNovoValor('');
  };

  const handleRemove = (cat: string) => {
    const atualizadas = { ...localMetas };
    delete atualizadas[cat];
    setLocalMetas(atualizadas);
  };

  const handleSave = () => {
    onSave(localMetas);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Metas e Categorias</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Adicionar Nova Categoria */}
        <div className="flex gap-2 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <input 
            type="text"
            placeholder="Nova Categoria..."
            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
          />
          <input 
            type="number"
            placeholder="Limite (R$)"
            className="w-24 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
          />
          <button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} />
          </button>
        </div>

        {/* Lista de Categorias Atuais */}
        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2">
          {Object.entries(localMetas).map(([cat, valor]) => (
            <div key={cat} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-gray-600 uppercase">{cat}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-800">R$ {valor.toFixed(2)}</span>
                <button onClick={() => handleRemove(cat)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {Object.keys(localMetas).length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">Nenhuma categoria cadastrada.</p>
          )}
        </div>

        <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}