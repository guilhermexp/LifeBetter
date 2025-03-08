
import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, ArrowDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartInputProps {
  inputText: string;
  setInputText: (text: string) => void;
}

export const SmartInput = ({ inputText, setInputText }: SmartInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const suggestions = [
    "Responder e-mails",
    "Reunião com equipe",
    "Fazer exercícios",
    "Tomar medicação",
    "Jantar com família",
    "Ler livro",
    "Estudar para exame",
    "Comprar mantimentos",
    "Ligar para cliente"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <Label htmlFor="task-input" className="text-gray-800 text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          O que você quer fazer?
        </Label>
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            ref={inputRef}
            id="task-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Descreva sua atividade..."
            className="text-lg pr-10 border-2 border-purple-200 focus:border-purple-500 shadow-md rounded-xl py-6 pl-4"
            autoComplete="off"
          />
          <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
        </motion.div>
        <p className="text-sm text-gray-500 pl-1">
          Exemplo: "Reunião com cliente amanhã às 14h" ou "Tomar remédio às 8h"
        </p>
      </div>

      <AnimatePresence>
        {!inputText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 my-4">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                <ArrowDown className="h-3 w-3" />
                Ou selecione uma sugestão
              </span>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  className="text-left px-4 py-3 text-sm bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all shadow-sm border border-gray-100"
                  onClick={() => handleSuggestionClick(suggestion)}
                  type="button"
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
