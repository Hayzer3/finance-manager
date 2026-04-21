'use client';
import { useEffect, useState } from 'react';
import { financeApi } from './services/api';

export default function Home() {
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });

  useEffect(() => {
    financeApi.getDashboard().then(setResumo);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 font-sans">
      <header className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-800">Meu Financeiro</h1>
      </header>

      {/* Cards de Saldo */}
      <section className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-sm opacity-80">Saldo Total</p>
          <h2 className="text-3xl font-bold">R$ {resumo.saldo.toFixed(2)}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase">Receitas</p>
            <p className="text-lg font-semibold text-green-600">R$ {resumo.receitas.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase">Despesas</p>
            <p className="text-lg font-semibold text-red-600">R$ {resumo.despesas.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Botão de Ação Rápida (Mobile style) */}
      <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-md active:scale-95 transition-transform">
        + Novo Lançamento
      </button>
    </main>
  );
}