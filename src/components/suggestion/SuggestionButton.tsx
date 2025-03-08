
import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestionButtonProps {
  setIsOpen?: (open: boolean) => void;
  shuffleTips?: () => Promise<void>;
}

export function SuggestionButton({ setIsOpen, shuffleTips }: SuggestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = async () => {
    // Mostrar indicador de carregamento
    setIsLoading(true);
    
    // Abre o diálogo imediatamente para melhor experiência do usuário
    if (setIsOpen) {
      setIsOpen(true);
    }
    
    // Carrega novas sugestões quando o botão é clicado
    if (shuffleTips) {
      try {
        await shuffleTips();
        console.log("Sugestões carregadas com sucesso");
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleOpenDialog}
      disabled={isLoading}
      className="w-full bg-white rounded-xl h-14 text-purple-700 flex items-center justify-between px-6 shadow-md hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center gap-2">
        <div className="bg-purple-100 rounded-full p-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5 text-purple-600" />
          )}
        </div>
        <span className="font-medium text-base">Insights e Sugestões</span>
      </div>
      <ArrowRight className="h-5 w-5 text-purple-400" />
    </motion.button>
  );
}
