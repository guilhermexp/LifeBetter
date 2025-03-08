
import React from "react";
import { Calendar } from "lucide-react";

export function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mx-4 my-6">
      <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Calendar className="h-7 w-7 text-gray-400" />
      </div>
      
      <p className="text-gray-800 font-medium text-lg mb-1">
        Nenhuma tarefa agendada
      </p>
      
      <p className="text-gray-500 text-sm mb-4 text-center">
        Adicione tarefas para organizar seu dia
      </p>
    </div>
  );
}
