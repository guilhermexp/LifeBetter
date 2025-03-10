import React from "react";
import { Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { NotificationBell } from "@/components/common/NotificationBell";
import { Button } from "@/components/ui/button";

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
      
      {/* Botões de configuração e notificações */}
      <motion.div 
        className="flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <NotificationBell />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5 text-gray-500" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
