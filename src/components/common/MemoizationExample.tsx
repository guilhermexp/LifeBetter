import React, { useState, useCallback, useMemo } from 'react';

/**
 * Este arquivo serve como guia e exemplo para implementar memoização 
 * em componentes React para otimização de performance
 * 
 * Técnicas demonstradas:
 * 1. React.memo para memoização de componentes
 * 2. useCallback para memoização de funções
 * 3. useMemo para memoização de valores calculados
 */

// ======= COMPONENTES MEMOIZADOS COM REACT.MEMO =======

// Componente filho comum que renderiza uma tarefa
type TaskItemProps = {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
};

// Versão não otimizada - será re-renderizada sempre que o pai renderizar
export const TaskItem = ({ id, title, completed, onToggle }: TaskItemProps) => {
  console.log(`Renderizando TaskItem: ${title}`);
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
      <input 
        type="checkbox" 
        checked={completed} 
        onChange={() => onToggle(id)} 
        id={id}
      />
      <label 
        htmlFor={id}
        style={{ 
          marginLeft: '8px', 
          textDecoration: completed ? 'line-through' : 'none' 
        }}
      >
        {title}
      </label>
    </div>
  );
};

// Versão otimizada com React.memo - só re-renderiza se as props mudarem
export const MemoizedTaskItem = React.memo(TaskItem);

// Versão ainda mais otimizada com verificação de igualdade personalizada
export const DeepMemoizedTaskItem = React.memo(
  TaskItem,
  (prevProps, nextProps) => {
    // Retorna true se quisermos evitar re-renderização
    return prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.completed === nextProps.completed;
    // Não comparamos onToggle propositalmente para este exemplo
  }
);

// ======= EXEMPLO DE USO DE USECALLBACK =======

// Componente pai que gerencia uma lista de tarefas
export const TaskList = () => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Aprender React', completed: false },
    { id: '2', title: 'Estudar memoização', completed: true },
    { id: '3', title: 'Aplicar otimizações', completed: false },
  ]);
  
  // Sem useCallback - esta função será recriada em cada renderização
  const toggleTask = (id: string) => {
    setTasks(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  // Com useCallback - a função só é recriada se 'tasks' mudar
  const toggleTaskMemoized = useCallback((id: string) => {
    setTasks(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []); // Dependência vazia pois usamos o padrão funcional do setTasks
  
  // Valor calculado sem useMemo - recalculado em cada renderização
  const completedCount = tasks.filter(task => task.completed).length;
  
  // Valor calculado com useMemo - só recalculado se 'tasks' mudar
  const memoizedCompletedCount = useMemo(() => {
    console.log('Calculando contagem de tarefas concluídas...');
    return tasks.filter(task => task.completed).length;
  }, [tasks]);
  
  return (
    <div>
      <h3>Lista de Tarefas</h3>
      <div>Concluídas: {memoizedCompletedCount} de {tasks.length}</div>
      
      <div>
        <h4>Componentes Não Memoizados (Ineficientes)</h4>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            id={task.id}
            title={task.title}
            completed={task.completed}
            onToggle={toggleTask} // Função não memoizada
          />
        ))}
      </div>
      
      <div>
        <h4>Componentes Memoizados (Eficientes)</h4>
        {tasks.map(task => (
          <MemoizedTaskItem
            key={task.id}
            id={task.id}
            title={task.title}
            completed={task.completed}
            onToggle={toggleTaskMemoized} // Função memoizada
          />
        ))}
      </div>
    </div>
  );
};

// ======= GUIA DE IMPLEMENTAÇÃO =======

/**
 * QUANDO USAR MEMOIZAÇÃO:
 * 
 * React.memo é útil quando:
 * - Componente renderiza frequentemente com as mesmas props
 * - Componente tem lógica complexa/pesada de renderização
 * - Componente tem muitos filhos que seriam re-renderizados
 * 
 * useCallback é útil quando:
 * - A função é passada como prop para componentes memoizados
 * - A função é dependência de outros hooks (useEffect, useMemo)
 * 
 * useMemo é útil quando:
 * - O cálculo do valor é computacionalmente caro
 * - O valor calculado é usado em múltiplos lugares no componente
 * - O valor é dependência de outros hooks (useEffect, useCallback)
 * 
 * QUANDO NÃO USAR MEMOIZAÇÃO:
 * 
 * - Para componentes simples que renderizam rapidamente
 * - Quando as props mudam na maioria das renderizações
 * - Para funções que não são passadas como props
 * - Para cálculos simples que não são caros
 */

export default TaskList;
