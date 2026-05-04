import { 
  ShoppingBag, 
  Utensils, 
  Car, 
  House, 
  Tv, 
  HeartPulse, 
  GraduationCap, 
  Briefcase, 
  HelpCircle, 
  DollarSign,
  Receipt,      // Ícone para Contas/Boletos
  CreditCard,    // Ícone para Cartão/Geral
  Target
} from 'lucide-react';

export const INTELLIGENT_CATEGORIES: any = {
  CONTAS: { 
    label: 'Contas Fixas', 
    color: 'bg-blue-700', 
    icon: Receipt, 
    keywords: ['internet', 'vivo', 'claro', 'tim', 'net virtua', 'luz', 'agua', 'energia', 'enel', 'sabesp', 'gas', 'iptu', 'ipva', 'seguro', 'mensalidade', 'plano'] 
  },
  ALIMENTACAO: { 
    label: 'Alimentação', 
    color: 'bg-orange-500', 
    icon: Utensils, 
    keywords: ['ifood', 'hamburguer', 'mcdonalds', 'pizza', 'restaurante', 'bk', 'outback', 'suco', 'lanche', 'padaria', 'almoco', 'jantar', 'burguer'] 
  },
  MERCADO: { 
    label: 'Mercado', 
    color: 'bg-emerald-500', 
    icon: ShoppingBag, 
    keywords: ['mercado', 'carrefour', 'extra', 'pao de acucar', 'atacadao', 'shopee', 'mercado livre', 'despensa', 'compras'] 
  },
  TRANSPORTE: { 
    label: 'Transporte', 
    color: 'bg-sky-500', 
    icon: Car, 
    keywords: ['uber', '99', 'combustivel', 'gasolina', 'estacionamento', 'metro', 'onibus', 'pedagio', 'shell', 'ipiranga'] 
  },
  MORADIA: { 
    label: 'Moradia', 
    color: 'bg-indigo-600', 
    icon: House, 
    keywords: ['aluguel', 'condominio', 'reforma', 'moveis', 'casa'] 
  },
  LAZER: { 
    label: 'Lazer', 
    color: 'bg-purple-500', 
    icon: Tv, 
    keywords: ['netflix', 'spotify', 'cinema', 'show', 'steam', 'psn', 'xbox', 'viagem', 'hamburguer mc', 'cerveja', 'festa'] 
  },
  SAUDE: { 
    label: 'Saúde', 
    color: 'bg-rose-500', 
    icon: HeartPulse, 
    keywords: ['farmacia', 'droga', 'medico', 'hospital', 'dentista', 'academia', 'smartfit', 'remedio'] 
  },
  EDUCACAO: { 
    label: 'Educação', 
    color: 'bg-cyan-600', 
    icon: GraduationCap, 
    keywords: ['fiap', 'faculdade', 'curso', 'livro', 'udemy', 'alura', 'escola'] 
  },
  TRABALHO: { 
    label: 'Trabalho', 
    color: 'bg-amber-600', 
    icon: Briefcase, 
    keywords: ['material', 'escritorio', 'coworking', 'hardware', 'teclado', 'mouse', 'monitor'] 
  },
  CARTAO: { 
    label: 'Cartão de Crédito', 
    color: 'bg-slate-700', 
    icon: CreditCard, 
    keywords: ['bradesco', 'nubank', 'itau', 'fatura', 'cartao'] 
  },
  OUTROS: { 
    label: 'Outros', 
    color: 'bg-slate-400', 
    icon: HelpCircle, 
    keywords: [] 
  },
  SIMULACAO: { 
    label: 'Simulação / Desejo', 
    color: 'bg-yellow-400', 
    icon: Target, // Use o ícone Target ou Star do lucide-react
    keywords: ['comprar', 'quero', 'futuro', 'planejado', 'sonho'] 
  },
  RECEITA: { 
    label: 'Receita', 
    color: 'bg-green-600', 
    icon: DollarSign, 
    keywords: ['salario', 'pix', 'recebido', 'venda', 'freelance', 'estagio', 'restituicao'] 
  }
};

/**
 * Função que analisa a descrição e sugere a categoria.
 * Ex: "Conta de internet" -> Sugere CONTAS.
 */
export const predictCategory = (description: string) => {
  if (!description) return 'OUTROS';
  
  const desc = description.toLowerCase();
  
  for (const [key, cat] of Object.entries(INTELLIGENT_CATEGORIES)) {
    const category = cat as any;
    if (category.keywords && category.keywords.some((kw: string) => desc.includes(kw))) {
      return key;
    }
  }
  
  return 'OUTROS';
};