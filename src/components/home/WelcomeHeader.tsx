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
      className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h1 className="font-bold text-2xl">Olá, {firstName}!</h1>
        <Sparkles className="h-5 w-5 text-white/90" />
      </motion.div>
      <motion.p 
        className="text-sm text-white/90 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Aqui está o resumo das suas atividades.
      </motion.p>
    </motion.div>
  );
}
