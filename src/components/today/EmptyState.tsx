
import React from "react";
import { Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAddTask?: () => void; // Tornando opcional
}

export function EmptyState({ onAddTask }: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center py-12 min-h-[calc(100vh-240px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mb-6 shadow-lg">
          <Calendar className="h-10 w-10 text-white" />
        </div>
        <motion.div 
          className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-md"
          initial={{ rotate: -20 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Sparkles className="h-4 w-4 text-white" />
        </motion.div>
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-bold text-gray-800 mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Nenhuma tarefa para hoje
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 max-w-xs mb-8 text-base"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Use o botão + na barra de navegação inferior para adicionar uma nova tarefa.
      </motion.p>
    </motion.div>
  );
}
