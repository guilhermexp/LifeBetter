import { Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskTypeSelector } from "@/components/common/TaskTypeSelector";
import { MeetingModal } from "@/components/modals/MeetingModal";
import { TaskModal } from "@/components/modals/TaskModal";
import { EventModal } from "@/components/modals/EventModal";
import { HabitModal } from "@/components/modals/HabitModal";
import { TodoItemComponent } from "@/components/today/TodoItem";
import { EditTaskDialog } from "@/components/today/EditTaskDialog";
import { AddTaskDialog } from "@/components/today/AddTaskDialog";
import { EmptyState } from "@/components/today/EmptyState";
import { FilterPopover } from "@/components/today/FilterPopover";
import { DayNavigator } from "@/components/today/DayNavigator";
import { TasksOverviewButton } from "@/components/today/TasksOverviewButton";
import { useToday } from "@/hooks/useToday";
import { useSwipeable } from "react-swipeable";
import { useEffect, useState } from "react";
import { SmartTaskModal } from "@/components/modals/smart-task";
import { DeleteAllTasksButton } from "@/components/common/DeleteAllTasksButton";
import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';

export default function Today() {
  const {
    isLoading,
    filteredItems,
    showCompletedTasks,
    setShowCompletedTasks,
    showEditDialog,
    setShowEditDialog,
    currentItem,
    handleEditItem,
    saveItemChanges,
    showAddDialog,
    setShowAddDialog,
    newTaskData,
    setNewTaskData,
    isTaskTypeSelectorOpen,
    setIsTaskTypeSelectorOpen,
    isMeetingModalOpen,
    setIsMeetingModalOpen,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isEventModalOpen,
    setIsEventModalOpen,
    isHabitModalOpen,
    setIsHabitModalOpen,
    toggleTaskCompletion,
    toggleHabitCompletion,
    handleDeleteTask,
    handleDeleteHabit,
    saveNewTask,
    selectedDate,
    goToNextDay,
    goToPreviousDay
  } = useToday();

  const { allTasks } = useTasks();
  const [isSmartTaskModalOpen, setIsSmartTaskModalOpen] = useState(false);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [weekStats, setWeekStats] = useState({
    completed: 0,
    total: 0,
    overdue: 0
  });

  // Calculate overdue tasks and week stats
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

  // Clean up modals when component unmounts
  useEffect(() => {
    return () => {
      setShowEditDialog(false);
      setShowAddDialog(false);
      setIsTaskTypeSelectorOpen(false);
      setIsMeetingModalOpen(false);
      setIsTaskModalOpen(false);
      setIsEventModalOpen(false);
      setIsHabitModalOpen(false);
    };
  }, []);
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextDay(),
    onSwipedRight: () => goToPreviousDay(),
    preventScrollOnSwipe: true,
    trackMouse: false,
    swipeDuration: 500,
    delta: 50
  });
  
  const handleToggleCompletion = (id: string, isCompleted: boolean, itemType: 'task' | 'habit') => {
    if (itemType === 'task') {
      toggleTaskCompletion(id, isCompleted);
    } else {
      toggleHabitCompletion(id, isCompleted);
    }
  };
  
  const handleDeleteItem = (id: string, itemType: 'task' | 'habit') => {
    if (itemType === 'task') {
      handleDeleteTask(id);
    } else {
      handleDeleteHabit(id);
    }
  };
  
  const handleAddTask = () => {
    setIsSmartTaskModalOpen(true);
  };

  const handleViewAllOverdue = () => {
    // Implementar visualização de todas as tarefas atrasadas
    // Por enquanto, apenas mostra um alerta
    setShowAllOverdue(true);
    // TODO: Implementar modal ou página para mostrar todas as tarefas atrasadas
  };
  
  return (
    <motion.div 
      className="p-4 pb-safe bg-gradient-to-b from-gray-50 to-white min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-md mx-auto">
        <motion.div 
          className="flex flex-col items-start gap-2 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-b-3xl shadow-sm pb-1 w-full relative z-10 mb-2">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 pt-3 pb-3 px-4 rounded-b-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Inbox className="h-6 w-6 text-purple-600" strokeWidth={2} />
                </div>
                <h1 className="font-bold text-slate-800 text-xl">
                  Atividade de Hoje
                </h1>
              </div>
            </div>
          </div>

          <motion.div 
            className="w-full px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DayNavigator selectedDate={selectedDate} onPreviousDay={goToPreviousDay} onNextDay={goToNextDay} />
          </motion.div>
        </motion.div>
        
        {/* Botão de resumo de produtividade */}
        <TasksOverviewButton 
          overdueCount={overdueTasks.length || 0} 
          completionRate={weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0} 
        />
        
        <div {...swipeHandlers} className="transition-all duration-300 ease-in-out">
          <motion.div 
            className="flex justify-start items-center mb-4 px-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex gap-2">
              <FilterPopover showCompleted={showCompletedTasks} onShowCompletedChange={setShowCompletedTasks} />
              {filteredItems.length > 0 && <DeleteAllTasksButton />}
            </div>
          </motion.div>
          
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  className="h-20 bg-gray-100 rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <motion.div 
              className="space-y-3 min-h-[calc(100vh-240px)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.itemType}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <TodoItemComponent 
                    item={item} 
                    onToggleCompletion={handleToggleCompletion} 
                    onEdit={handleEditItem} 
                    onDelete={handleDeleteItem} 
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <EmptyState onAddTask={handleAddTask} />
            </motion.div>
          )}
        </div>
      </div>
      
      <EditTaskDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
        item={currentItem} 
        onSave={saveItemChanges} 
      />

      <AddTaskDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        taskData={newTaskData} 
        onTaskDataChange={setNewTaskData} 
        onSave={saveNewTask} 
      />
      
      <SmartTaskModal 
        isOpen={isSmartTaskModalOpen}
        onOpenChange={setIsSmartTaskModalOpen}
        onSuccess={() => {
          // Refresh happens via context
        }}
      />
    </motion.div>
  );
}
