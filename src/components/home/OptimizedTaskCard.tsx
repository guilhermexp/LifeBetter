import React, { useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces - certifique-se de que correspondem ao seu modelo de dados
interface Task {
  id: string;
  title: string;
  details?: string;
  scheduled_date?: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  type?: string;
}

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string, currentStatus: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/**
 * Versão otimizada do TaskCard com memoização para melhorar a performance
 * Utiliza React.memo, useCallback e useMemo para reduzir renderizações desnecessárias
 */
const OptimizedTaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  className = ''
}) => {
  // Memoizar a formatação de data para evitar recálculos
  const formattedDate = useMemo(() => {
    if (!task.scheduled_date) return '';
    try {
      return format(new Date(task.scheduled_date), "d 'de' MMMM", { locale: ptBR });
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return task.scheduled_date;
    }
  }, [task.scheduled_date]);

  // Memoizar callbacks para eventos
  const handleToggleComplete = useCallback(() => {
    if (onComplete) {
      onComplete(task.id, task.completed);
    }
  }, [task.id, task.completed, onComplete]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(task);
    }
  }, [task, onEdit]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(task.id);
    }
  }, [task.id, onDelete]);

  // Determinar classes CSS com base na prioridade e status
  const priorityClass = useMemo(() => {
    switch (task.priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  }, [task.priority]);

  const cardClass = useMemo(() => {
    return `rounded-lg p-4 mb-3 border-l-4 shadow transition-all duration-200 
      ${priorityClass} 
      ${task.completed ? 'bg-gray-100 opacity-70' : 'bg-white'} 
      ${className}`;
  }, [priorityClass, task.completed, className]);

  const titleClass = useMemo(() => {
    return `text-lg font-semibold mb-1 
      ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`;
  }, [task.completed]);

  return (
    <div className={cardClass}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={titleClass}>{task.title}</h3>
          
          {task.details && (
            <p className="text-gray-600 text-sm mb-2">{task.details}</p>
          )}
          
          {task.scheduled_date && (
            <div className="text-xs text-gray-500 mb-2">
              {formattedDate}
            </div>
          )}
          
          {task.type && (
            <div className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {task.type}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <button 
            onClick={handleToggleComplete}
            className={`w-6 h-6 rounded-full border flex items-center justify-center
              ${task.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 text-transparent hover:bg-gray-100'
              }`}
            aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluído"}
          >
            {task.completed && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <button
            onClick={handleEdit}
            className="text-gray-500 hover:text-blue-500"
            aria-label="Editar tarefa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-500"
            aria-label="Excluir tarefa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Aplicar React.memo para evitar renderizações desnecessárias
export default React.memo(OptimizedTaskCard, (prevProps, nextProps) => {
  // Só re-renderiza se as props importantes mudaram
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.details === nextProps.task.details &&
    prevProps.task.scheduled_date === nextProps.task.scheduled_date &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.type === nextProps.task.type
    // Não verificamos igualdade nas funções de callback
  );
});
