
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
import { useToday } from "@/hooks/useToday";
import { useSwipeable } from "react-swipeable";
import { useEffect, useState } from "react";
import { SmartTaskModal } from "@/components/modals/smart-task";
import { DeleteAllTasksButton } from "@/components/common/DeleteAllTasksButton";
import { motion } from "framer-motion";

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

  const [isSmartTaskModalOpen, setIsSmartTaskModalOpen] = useState(false);

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
  
  return (
    <motion.div 
      className="p-6 pb-safe bg-gradient-to-b from-purple-50 to-white min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-md mx-auto">
        <motion.div 
          className="flex flex-col items-start gap-2 mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
              <Inbox className="h-7 w-7 text-purple-600" strokeWidth={2} />
            </div>
            <h1 className="font-bold text-slate-800 bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent text-2xl">
              Atividade de Hoje
            </h1>
          </div>

          <motion.div 
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DayNavigator selectedDate={selectedDate} onPreviousDay={goToPreviousDay} onNextDay={goToNextDay} />
          </motion.div>
        </motion.div>
        
        <div {...swipeHandlers} className="transition-all duration-300 ease-in-out">
          <motion.div 
            className="flex justify-start items-center mb-5"
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
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  className="h-24 bg-gray-100 rounded-xl shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <motion.div 
              className="space-y-4 min-h-[calc(100vh-240px)]"
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
