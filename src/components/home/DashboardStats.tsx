import { Link } from "react-router-dom";
import { Calendar, CheckCircle, AlertCircle, BarChart } from "lucide-react";
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
      className="overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="px-0 py-2">
        <div className="flex items-center gap-2 mb-3">
          <BarChart className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-700">Resumo de atividades</h2>
        </div>
        
        <div className="flex justify-between">
          <Link to="/today" className="flex-1">
            <motion.div 
              className="flex items-center justify-center gap-2 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <Calendar className="h-4 w-4 text-purple-500" />
              <div className="flex flex-col items-center">
                <span className="text-base font-semibold text-gray-800">{taskCounts.today}</span>
                <span className="text-xs text-gray-500">Hoje</span>
              </div>
            </motion.div>
          </Link>

          <div className="w-px h-10 bg-gray-100 my-auto"></div>

          <Link to="/today" className="flex-1">
            <motion.div 
              className="flex items-center justify-center gap-2 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex flex-col items-center">
                <span className="text-base font-semibold text-gray-800">{taskCounts.completed}</span>
                <span className="text-xs text-gray-500">Feitas</span>
              </div>
            </motion.div>
          </Link>

          <div className="w-px h-10 bg-gray-100 my-auto"></div>

          <Link to="/planner" className="flex-1">
            <motion.div 
              className="flex items-center justify-center gap-2 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <div className="flex flex-col items-center">
                <span className="text-base font-semibold text-gray-800">{taskCounts.overdue}</span>
                <span className="text-xs text-gray-500">Atraso</span>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
