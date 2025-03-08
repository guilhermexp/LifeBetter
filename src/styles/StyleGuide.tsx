/**
 * SUA VIDA MELHOR - STYLE GUIDE
 * 
 * Este documento define os padrões de estilo para o aplicativo Sua Vida Melhor.
 * Utilize essas constantes e padrões ao criar novos componentes para garantir
 * uma experiência de usuário consistente em todo o aplicativo.
 */

import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// TIPOGRAFIA
// -----------------------------------------------------------------------------

export const Typography = {
  // Títulos 
  h1: "text-2xl font-bold tracking-tight", // Títulos principais
  h2: "text-xl font-bold", // Títulos de seções
  h3: "text-lg font-semibold", // Títulos de cartões
  h4: "text-base font-medium", // Subtítulos
  
  // Corpo de texto
  body: "text-sm", // Texto padrão
  bodyLarge: "text-base", // Texto destacado  
  bodySmall: "text-xs", // Texto secundário
  
  // Estilos específicos
  label: "text-sm font-medium text-gray-700", // Labels de formulário
  hint: "text-xs text-gray-500", // Texto de dica
  cardTitle: "text-lg font-bold", // Título de cartão
  cardDescription: "text-sm text-gray-600", // Descrição de cartão
  modalTitle: "text-xl font-bold", // Título de modal
};

// -----------------------------------------------------------------------------
// ESPAÇAMENTO
// -----------------------------------------------------------------------------

export const Spacing = {
  // Padding
  cardPadding: "p-4", // Padding padrão para cartões
  cardHeaderPadding: "p-4", // Padding para cabeçalhos de cartões
  cardContentPadding: "p-4 pt-0", // Padding para conteúdo de cartões
  cardFooterPadding: "p-4", // Padding para rodapés de cartões
  
  // Modal padding
  modalHeaderPadding: "px-6 py-4", // Padding para cabeçalhos de modais
  modalContentPadding: "p-6", // Padding para conteúdo de modais
  modalFooterPadding: "p-6", // Padding para rodapés de modais
  
  // Spacing entre elementos
  sectionSpacing: "space-y-6", // Espaço entre seções principais
  itemSpacing: "space-y-4", // Espaço entre itens relacionados
  inputSpacing: "space-y-2", // Espaço entre label e input
};

// -----------------------------------------------------------------------------
// CORES E GRADIENTES
// -----------------------------------------------------------------------------

export const Colors = {
  // Cores de ação
  primary: {
    default: "bg-purple-600",
    hover: "hover:bg-purple-700",
    light: "bg-purple-50",
    border: "border-purple-600",
    text: "text-purple-600",
    gradient: "bg-gradient-to-r from-purple-600 to-indigo-600",
  },
  success: {
    default: "bg-green-500",
    hover: "hover:bg-green-600",
    light: "bg-green-50",
    border: "border-green-500", 
    text: "text-green-600",
    gradient: "bg-gradient-to-r from-green-500 to-emerald-500",
  },
  warning: {
    default: "bg-amber-500",
    hover: "hover:bg-amber-600",
    light: "bg-amber-50",
    border: "border-amber-500",
    text: "text-amber-600",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  danger: {
    default: "bg-red-500",
    hover: "hover:bg-red-600",
    light: "bg-red-50",
    border: "border-red-500",
    text: "text-red-600",
    gradient: "bg-gradient-to-r from-red-500 to-rose-500",
  },
  
  // Cores neutras
  neutral: {
    border: "border-gray-200",
    divider: "border-gray-100",
    background: "bg-white",
    card: "bg-white",
    hover: "hover:bg-gray-50",
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      tertiary: "text-gray-500",
    },
  },
};

// -----------------------------------------------------------------------------
// FORMULÁRIOS
// -----------------------------------------------------------------------------

export const Forms = {
  // Estilos de Input
  input: "w-full border-gray-300 focus:border-purple-500 rounded-md focus:ring-1 focus:ring-purple-500",
  
  // Estilos de Select
  select: "w-full border-gray-300 focus:border-purple-500 rounded-md focus:ring-1 focus:ring-purple-500",
  
  // Estilos de Textarea
  textarea: "w-full min-h-[100px] resize-none border-gray-300 focus:border-purple-500 rounded-md focus:ring-1 focus:ring-purple-500",
  
  // Estilos de Label
  label: "text-sm font-medium text-gray-700",
  
  // Estilos de Hint
  hint: "text-xs text-gray-500 mt-1",
  
  // Estrutura de form group
  formGroup: "space-y-2",
};

// -----------------------------------------------------------------------------
// CARTÕES
// -----------------------------------------------------------------------------

export const CardStyles = {
  // Card base
  card: "w-full rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow",
  
  // Card com foco ou selecionado
  activeCard: "ring-2 ring-purple-500 ring-opacity-50",
  
  // Cabeçalho de cartão
  cardHeader: "flex flex-col space-y-1 p-4",
  
  // Cartão com cabeçalho colorido
  cardHeaderColored: "text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-lg px-6 py-4 flex justify-between items-center",
  
  // Conteúdo de cartão
  cardContent: "p-4 pt-0",
  
  // Rodapé de cartão
  cardFooter: "flex items-center p-4 border-t border-gray-100",
};

// -----------------------------------------------------------------------------
// MODAIS / DIÁLOGOS
// -----------------------------------------------------------------------------

export const ModalStyles = {
  // Tamanhos de Modal
  size: {
    sm: "sm:max-w-sm", // 384px
    md: "sm:max-w-md", // 448px
    lg: "sm:max-w-lg", // 512px
    xl: "sm:max-w-xl", // 576px
  },
  
  // Container de modal
  modalContent: "p-0 overflow-hidden bg-white rounded-xl mx-auto shadow-md",
  
  // Cabeçalho de Modal
  modalHeader: "px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100",
  
  // Cabeçalho colorido
  modalHeaderColored: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 relative",
  
  // Conteúdo de Modal
  modalBody: "p-6 space-y-4",
  
  // Rodapé de Modal
  modalFooter: "p-6 border-t border-gray-100 flex gap-3",
};

// -----------------------------------------------------------------------------
// BOTÕES
// -----------------------------------------------------------------------------

export const ButtonStyles = {
  // Variantes de botão
  primary: cn(
    "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    "hover:from-purple-700 hover:to-indigo-700",
    "focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
  ),
  
  secondary: cn(
    "bg-white border border-gray-300 text-gray-700",
    "hover:bg-gray-50",
    "focus:ring-2 focus:ring-gray-200"
  ),
  
  success: cn(
    "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    "hover:from-green-600 hover:to-emerald-600",
    "focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
  ),
  
  warning: cn(
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    "hover:from-amber-600 hover:to-orange-600",
    "focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
  ),
  
  danger: cn(
    "bg-gradient-to-r from-red-500 to-rose-500 text-white",
    "hover:from-red-600 hover:to-rose-600",
    "focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
  ),
  
  ghost: cn(
    "bg-transparent hover:bg-gray-100 text-gray-700"
  ),
  
  // Tamanhos de botão
  sizes: {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-sm",
    lg: "py-2.5 px-5 text-base",
  },
  
  // Botão ícone
  iconButton: "rounded-full p-2",
};

// -----------------------------------------------------------------------------
// BORDAS E SOMBRAS
// -----------------------------------------------------------------------------

export const Borders = {
  rounded: {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },
  
  divider: "border-t border-gray-100",
  
  shadows: {
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-md",
    xl: "shadow-lg",
  },
};

// -----------------------------------------------------------------------------
// FUNÇÕES UTILITÁRIAS
// -----------------------------------------------------------------------------

/**
 * Gera um conjunto padrão de classes para formulários
 */
export function getFormClasses() {
  return {
    formGroup: Forms.formGroup,
    label: Forms.label,
    input: Forms.input,
    textarea: Forms.textarea,
    select: Forms.select,
    hint: Forms.hint,
  };
}

/**
 * Gera um conjunto padrão de classes para cartões
 */
export function getCardClasses(isActive: boolean = false) {
  return {
    card: cn(CardStyles.card, isActive && CardStyles.activeCard),
    header: CardStyles.cardHeader,
    coloredHeader: CardStyles.cardHeaderColored,
    content: CardStyles.cardContent,
    footer: CardStyles.cardFooter,
  };
}

/**
 * Gera um conjunto padrão de classes para modais
 */
export function getModalClasses(size: 'sm' | 'md' | 'lg' | 'xl' = 'md') {
  return {
    container: cn(ModalStyles.modalContent, ModalStyles.size[size]),
    header: ModalStyles.modalHeader,
    coloredHeader: ModalStyles.modalHeaderColored,
    body: ModalStyles.modalBody,
    footer: ModalStyles.modalFooter,
  };
}
