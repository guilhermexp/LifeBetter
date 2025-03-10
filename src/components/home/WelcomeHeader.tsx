import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeHeaderProps {
  userName: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const firstName = userName.split(' ')[0];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center"
    >
      <div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="font-bold text-xl text-gray-800">Olá, {firstName}!</h1>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </motion.div>
        <motion.p 
          className="text-xs text-gray-600 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Aqui está o resumo das suas atividades.
        </motion.p>
      </div>
      
      {/* Espaço vazio para manter o layout */}
      <div></div>
    </motion.div>
  );
}
