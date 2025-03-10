import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TasksOverview } from './TasksOverview';
import { motion } from 'framer-motion';

interface TasksOverviewButtonProps {
  overdueCount: number;
  completionRate: number;
}

export function TasksOverviewButton({ overdueCount, completionRate }: TasksOverviewButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Determine badge color based on completion rate
  const getBadgeColor = () => {
    if (completionRate < 30) return "bg-red-100 text-red-800";
    if (completionRate < 70) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <Button
          variant="outline"
          className="w-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 py-2 h-auto"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Resumo de produtividade</span>
            </div>
            
            <div className="flex items-center gap-2">
              {overdueCount > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
                    {overdueCount}
                  </Badge>
                </div>
              )}
              
              <Badge className={`text-xs ${getBadgeColor()}`}>
                {completionRate}%
              </Badge>
            </div>
          </div>
        </Button>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resumo de Produtividade</DialogTitle>
          </DialogHeader>
          
          <div className="mt-2">
            <TasksOverview onViewAllOverdue={() => {
              // Implementar visualização de todas as tarefas atrasadas
              // Por enquanto, apenas fecha o diálogo
              setIsDialogOpen(false);
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
