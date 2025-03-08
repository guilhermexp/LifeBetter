
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCount {
  today: number;        // Tasks due today (not completed)
  completed: number;    // Tasks completed today
  overdue: number;      // Tasks that are overdue (past due date and not completed)
}

interface DashboardStatsProps {
  taskCounts: TaskCount;
}

export function DashboardStats({ taskCounts }: DashboardStatsProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Resumo de produtividade de hoje</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <Link to="/today">
            <motion.div 
              className="flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
              whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-700">{taskCounts.today}</span>
              <span className="text-xs font-medium text-gray-600 mt-1">Pendentes</span>
            </motion.div>
          </Link>

          <Link to="/today">
            <motion.div 
              className="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
              whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{taskCounts.completed}</span>
              <span className="text-xs font-medium text-gray-600 mt-1">Concluídas</span>
            </motion.div>
          </Link>

          <Link to="/planner">
            <motion.div 
              className="flex flex-col items-center p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
              whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-600">{taskCounts.overdue}</span>
              <span className="text-xs font-medium text-gray-600 mt-1">Atrasadas</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
