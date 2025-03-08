import { useState, useEffect } from "react";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { useUser } from "@/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { useRefresh } from "@/providers/RefreshProvider";
import { motion } from "framer-motion";

export function AgentHeader() {
  const { user } = useUser();
  const [greeting, setGreeting] = useState<string>("Olá");
  const { refresh } = useRefresh();
  
  const userName = user?.profile?.full_name || 
                  user?.profile?.username || 
                  user?.email?.split('@')[0] || 
                  "Usuário";
  
  useEffect(() => {
    // Get current hour to customize greeting
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Bom dia");
    } else if (currentHour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);
  
  return (
    <motion.div 
      className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-md mb-4 relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mt-20 -mr-20"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.08, 0.05]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <motion.div 
          className="p-2 bg-white/20 rounded-lg shadow-inner"
          whileHover={{ scale: 1.05 }}
        >
          <Brain className="h-5 w-5" />
        </motion.div>
        <h1 className="text-lg font-bold">
          Assistente IA
        </h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto bg-white/15 hover:bg-white/25 text-white rounded-lg shadow-sm p-1.5"
            onClick={refresh}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Atualizar</span>
          </Button>
        </motion.div>
      </div>
      
      <motion.p 
        className="text-white/95 pl-10 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {greeting}, <span className="font-bold">{userName}</span>! Estou monitorando sua rotina e hábitos.
      </motion.p>
      
      <motion.div 
        className="bg-white/15 p-2 mt-2 rounded-lg flex items-center gap-2 pl-10 backdrop-blur-sm shadow-inner"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Sparkles className="h-4 w-4 text-yellow-300 flex-shrink-0" />
        <p className="text-xs">
          Com base na sua rotina recente, tenho insights importantes para compartilhar.
        </p>
      </motion.div>
    </motion.div>
  );
}
