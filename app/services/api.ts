const BASE_URL = 'https://finance-manager-api-iuqh.onrender.com/api';

type TransacaoData = {
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  data: string;
  categoria: string;
};

export const financeApi = {
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/transacoes/dashboard`, { cache: 'no-store' });
    return res.json();
  },

  getTransactions: async () => {
    const res = await fetch(`${BASE_URL}/transacoes`, { cache: 'no-store' });
    return res.json();
  },
  
  deleteTransacao: async (id: number) => {
    await fetch(`${BASE_URL}/transacoes/${id}`, { method: 'DELETE' });
  },

  updateTransacao: async (id: number, transacao: TransacaoData) => {
    const res = await fetch(`${BASE_URL}/transacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transacao),
    });
    return res.json();
  },

  saveTransacao: async (transacao: TransacaoData) => {
    const res = await fetch(`${BASE_URL}/transacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transacao),
    });
    return res.json();
  }
};