import { useState, useEffect, useMemo } from 'react';
import { financeApi } from '../services/api';

export function useFinance() {
  const [transacoes, setTransacoes] = useState([]);
  const [dataFoco, setDataFoco] = useState(new Date()); // O mês que o usuário está vendo

  const loadData = async () => {
    const data = await financeApi.getTransactions();
    setTransacoes(data);
  };

  useEffect(() => { loadData(); }, []);

  // Navegação
  const proximoMes = () => setDataFoco(new Date(dataFoco.setMonth(dataFoco.getMonth() + 1)));
  const mesAnterior = () => setDataFoco(new Date(dataFoco.setMonth(dataFoco.getMonth() - 1)));

  // Cálculos do Mês Focado
  const dadosMesFocado = useMemo(() => {
    const mesAno = dataFoco.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
    
    const filtradas = transacoes.filter((t: any) => 
      new Date(t.data).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' }) === mesAno
    );

    const receitas = filtradas.filter((t: any) => t.tipo === 'RECEITA').reduce((acc, t: any) => acc + t.valor, 0);
    const despesas = filtradas.filter((t: any) => t.tipo === 'DESPESA').reduce((acc, t: any) => acc + t.valor, 0);

    return { filtradas, receitas, despesas, saldo: receitas - despesas, mesAno };
  }, [transacoes, dataFoco]);

  // Comparação com o Mês Anterior (Para saber se gastou mais ou menos)
  const comparativo = useMemo(() => {
    const dataPassada = new Date(dataFoco);
    dataPassada.setMonth(dataPassada.getMonth() - 1);
    const mesAnoPassado = dataPassada.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

    const despesasPassadas = transacoes
      .filter((t: any) => t.tipo === 'DESPESA' && 
        new Date(t.data).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' }) === mesAnoPassado)
      .reduce((acc, t: any) => acc + t.valor, 0);

    const diferenca = despesasPassadas > 0 ? ((dadosMesFocado.despesas - despesasPassadas) / despesasPassadas) * 100 : 0;
    
    return { despesasPassadas, diferenca };
  }, [transacoes, dataFoco, dadosMesFocado.despesas]);

  return { 
    ...dadosMesFocado, 
    comparativo, 
    proximoMes, 
    mesAnterior, 
    loadData, 
    nomeMes: dataFoco.toLocaleString('pt-BR', { month: 'long' }) 
  };
}