import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  AlertTriangle, 
  ChevronRight,
  BarChart3
} from "lucide-react";
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTasks, Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TasksOverviewProps {
  onViewAllOverdue?: () => void;
}

export function TasksOverview({ onViewAllOverdue }: TasksOverviewProps) {
  const { allTasks, isLoading } = useTasks();
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [weekStats, setWeekStats] = useState({
    completed: 0,
    total: 0,
    overdue: 0
  });

  useEffect(() => {
    if (!allTasks || isLoading) return;

    // Get today's date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get date from 7 days ago
    const weekAgo = subDays(today, 7);

    // Filter overdue tasks (scheduled before today and not completed)
    const overdue = allTasks.filter(task => {
      if (!task.scheduled_date || task.completed) return false;
      const taskDate = parseISO(task.scheduled_date);
      return isBefore(taskDate, today);
    });

    // Sort overdue tasks by date (oldest first)
    overdue.sort((a, b) => {
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return parseISO(a.scheduled_date).getTime() - parseISO(b.scheduled_date).getTime();
    });

    setOverdueTasks(overdue);

    // Calculate week stats
    const weekTasks = allTasks.filter(task => {
      if (!task.scheduled_date) return false;
      const taskDate = parseISO(task.scheduled_date);
      return isAfter(taskDate, weekAgo) && isBefore(taskDate, today);
    });

    const completedWeekTasks = weekTasks.filter(task => task.completed);
    
    setWeekStats({
      completed: completedWeekTasks.length,
      total: weekTasks.length,
      overdue: overdue.length
    });

  }, [allTasks, isLoading]);

  // Format date to display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Calculate how many days a task is overdue
  const getDaysOverdue = (dateString: string) => {
    try {
      const taskDate = parseISO(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - taskDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  // Get color based on how overdue a task is
  const getOverdueColor = (days: number) => {
    if (days <= 1) return "text-yellow-600 bg-yellow-50";
    if (days <= 3) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-24 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  // If no overdue tasks and no tasks in the last week, don't show the component
  if (overdueTasks.length === 0 && weekStats.total === 0) {
    return null;
  }

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-sm font-medium text-gray-500 mb-2 px-1">RESUMO DE PRODUTIVIDADE</h2>
      
      <Card className="overflow-hidden">
        {/* Weekly stats */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Última semana</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {weekStats.completed} de {weekStats.total} tarefas
              </Badge>
              
              {weekStats.total > 0 && (
                <Badge 
                  className={cn(
                    "bg-blue-100 text-blue-800",
                    weekStats.completed / weekStats.total < 0.3 && "bg-red-100 text-red-800",
                    weekStats.completed / weekStats.total >= 0.3 && weekStats.completed / weekStats.total < 0.7 && "bg-yellow-100 text-yellow-800",
                    weekStats.completed / weekStats.total >= 0.7 && "bg-green-100 text-green-800"
                  )}
                >
                  {Math.round((weekStats.completed / weekStats.total) * 100)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Overdue tasks */}
        {overdueTasks.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h3 className="font-medium text-gray-800">Tarefas atrasadas</h3>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                  {overdueTasks.length} {overdueTasks.length === 1 ? 'tarefa' : 'tarefas'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map(task => {
                  const daysOverdue = getDaysOverdue(task.scheduled_date || '');
                  return (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(task.scheduled_date || '')}
                          </div>
                          
                          <Badge className={cn("text-xs", getOverdueColor(daysOverdue))}>
                            {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrás
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {overdueTasks.length > 3 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-gray-600 mt-1 h-8"
                    onClick={onViewAllOverdue}
                  >
                    Ver todas ({overdueTasks.length})
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
