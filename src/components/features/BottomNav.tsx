
import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarClock, Brain, Bot, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SmartTaskModal } from "@/components/modals/smart-task";
import { useRefresh } from "@/providers/RefreshProvider";

export default function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isSmartTaskModalOpen, setIsSmartTaskModalOpen] = useState(false);
  const { refreshTasksFunction } = useRefresh();

  const handleModalSuccess = () => {
    refreshTasksFunction();
  };

  // Não mostrar a barra de navegação na página de autenticação
  if (location.pathname === "/auth") return null;

  // Definir ícones e cores para cada rota
  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/planner", icon: CalendarClock, label: "Agenda" },
    { path: "/assistant", icon: Bot, label: "IA" },
    { path: "/mindfulness", icon: Brain, label: "Mente" }
  ];

  return (
    <>
      {/* Barra de navegação fixa com design moderno */}
      <motion.div 
        className="fixed inset-x-0 bottom-0 z-50 pb-safe"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mx-auto max-w-md">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border-0 flex items-center justify-between px-5 py-3 mx-4 mb-4"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center px-3 py-1.5 relative"
              >
                {isActive(item.path) && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl -z-10"
                    layoutId="navHighlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-purple-600" : "text-gray-400"}`} />
                </motion.div>
                <motion.span 
                  className={`text-xs mt-1 ${isActive(item.path) ? "text-purple-600 font-medium" : "text-gray-500"}`}
                  animate={{ 
                    scale: isActive(item.path) ? 1.05 : 1
                  }}
                >
                  {item.label}
                </motion.span>
              </NavLink>
            ))}
            
            {/* Botão de adicionar tarefa com efeitos avançados */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.button
                className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                onClick={() => setIsSmartTaskModalOpen(true)}
              >
                <motion.div 
                  className="absolute inset-0 bg-white opacity-20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
                  }}
                />
                <Plus className="h-7 w-7 text-white" />
                <motion.div
                  className="absolute top-0 right-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de tarefa inteligente */}
      <SmartTaskModal isOpen={isSmartTaskModalOpen} onOpenChange={setIsSmartTaskModalOpen} onSuccess={handleModalSuccess} />
    </>
  );
}
