
import { useState } from "react";
import { useRefresh } from "@/providers/RefreshProvider";
import { TodoItem } from "@/types/today";
import { combineItems, filterItems } from "@/hooks/today/todayUtils";
import { useTodayData } from "@/hooks/today/useTodayData";
import { useTodayOperations } from "@/hooks/today/useTodayOperations";
import { useTodayEdit } from "@/hooks/today/useTodayEdit";
import { useTodayAdd } from "@/hooks/today/useTodayAdd";
import { useTodayNavigation } from "@/hooks/today/useTodayNavigation";

// Use 'export type' instead of 'export' for types when isolatedModules is enabled
export type { TodoItem };

export function useToday() {
  const { shouldRefresh } = useRefresh();
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  
  // Use the navigation hook
  const {
    selectedDate,
    setSelectedDate,
    goToNextDay,
    goToPreviousDay
  } = useTodayNavigation();
  
  // Use the data fetching hook
  const {
    tasks,
    habits,
    isLoading,
    completedTasks,
    completedHabits,
    setCompletedTasks,
    setCompletedHabits,
    setTasks,
    setHabits,
    fetchTasks,
    fetchHabits
  } = useTodayData(selectedDate, shouldRefresh);
  
  // Use the operations hook
  const {
    toggleTaskCompletion,
    toggleHabitCompletion,
    handleDeleteTask,
    handleDeleteHabit
  } = useTodayOperations(
    setCompletedTasks,
    setCompletedHabits,
    setTasks,
    setHabits,
    fetchTasks,
    fetchHabits
  );
  
  // Use the edit hook with updated parameters
  const {
    showEditDialog,
    setShowEditDialog,
    currentItem,
    handleEditItem,
    saveItemChanges
  } = useTodayEdit(tasks, setTasks, habits, setHabits);
  
  // Use the add hook
  const {
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
    handleAddTask,
    saveNewTask
  } = useTodayAdd(setTasks);
  
  // Combine and filter items
  const allItems = combineItems(tasks, habits, completedTasks, completedHabits);
  const filteredItems = filterItems(allItems, showCompletedTasks);

  return {
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
    fetchTasks,
    fetchHabits,
    toggleTaskCompletion,
    toggleHabitCompletion,
    handleAddTask,
    handleDeleteTask,
    handleDeleteHabit,
    saveNewTask,
    selectedDate,
    setSelectedDate,
    goToNextDay,
    goToPreviousDay
  };
}
