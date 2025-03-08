
/**
 * Detect category based on keywords
 */
export const detectCategory = (text: string): string | null => {
  // Define categories with corresponding keywords
  const categories = {
    trabalho: ['trabalho', 'reunião', 'escritório', 'cliente', 'projeto', 'negócio', 'profissional'],
    pessoal: ['pessoal', 'casa', 'família', 'amigo', 'lazer'],
    saúde: ['médico', 'dentista', 'consulta', 'exame', 'academia', 'treino', 'exercício', 'yoga', 'fisioterapia'],
    estudo: ['estudo', 'curso', 'aula', 'faculdade', 'escola', 'livro', 'leitura'],
    financeiro: ['banco', 'financeiro', 'pagamento', 'compra', 'conta', 'dinheiro'],
    social: ['almoço com', 'jantar com', 'café com', 'encontro', 'confraternização', 'festa', 'social']
  };
  
  // Special case for social meals
  if ((text.includes('almoço') || text.includes('jantar') || text.includes('café')) && 
      text.includes('com')) {
    return 'social';
  }
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return null;
};

/**
 * Get suggested color based on category
 */
export const getSuggestedColor = (category: string | null): string | null => {
  switch (category) {
    case 'trabalho':
      return '#9b87f5'; // Purple
    case 'pessoal':
      return '#FF9500'; // Orange
    case 'saúde':
      return '#4CD964'; // Green
    case 'estudo':
      return '#5AC8FA'; // Blue
    case 'financeiro':
      return '#FFCC33'; // Yellow
    case 'social':
      return '#FF3B30'; // Red
    default:
      return null;
  }
};
