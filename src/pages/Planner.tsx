
import React, { useState, useEffect, useCallback } from "react";
import { format, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskCreator } from "@/hooks/useTaskCreator";
import { usePlannerEvents } from "@/hooks/usePlannerEvents";
import { QuickActionModal } from "@/components/planner/QuickActionModal";
import { TimelineView } from "@/components/planner/TimelineView";
import { HabitModal } from "@/components/modals/HabitModal";
import { useUser } from "@/providers/UserProvider";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { DaySelector } from "@/components/planner/DaySelector";
import { PlannerFilterBar } from "@/components/planner/PlannerFilterBar";
import { usePlannerSwipe } from "@/hooks/usePlannerSwipe";
import { calculateVisibleDays, getPreviousWeekDate, getNextWeekDate, filterTasks } from "@/components/planner/planner-utils";
import { AreaType } from "@/types/habits";
import { CalendarClock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Planner() {
  // State variables
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaType | 'all'>('all');
  const navigate = useNavigate();

  // Custom hooks
  const { handleOpenTaskSelector } = useTaskCreator();
  const { user } = useUser();

  const {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    taskEvents,
    showOnlyCompleted,
    setShowOnlyCompleted,
    holidays,
    isLoading,
    quickActionEvent,
    handleEventComplete,
    handleDeleteEvent,
    handleDuplicateEvent,
    handleEditEvent,
    handleQuickAction,
    closeQuickAction,
    handleAddEvent,
    getTaskCountForDay,
    updateTaskCounts,
    fetchEvents,
    isGoogleCalendarEnabled,
    googleCalendarEvents,
    getFilteredTasks
  } = usePlannerEvents();

  // Use swipe functionality
  const { isSwipeAnimating, swipeHandlers } = usePlannerSwipe({
    selectedDate,
    setSelectedDate,
    visibleDays,
    setCurrentMonth
  });

  // Update current time each minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Synchronize visible days with current month
  useEffect(() => {
    if (!currentMonth) return;

    // When month changes, update visible days to show days from current month
    const newVisibleDays = calculateVisibleDays(currentMonth);
    setVisibleDays(newVisibleDays);

    // Update task counts for visible days - only when currentMonth changes
    if (updateTaskCounts) {
      console.log("Updating task counts for visible days after month change");
      updateTaskCounts(newVisibleDays);
    }
  }, [currentMonth, updateTaskCounts]);

  // Navigation functions
  const previousWeek = useCallback(() => {
    const newFirstDay = getPreviousWeekDate(visibleDays);
    if (newFirstDay) setCurrentMonth(newFirstDay);
  }, [visibleDays, setCurrentMonth]);

  const nextWeek = useCallback(() => {
    const newFirstDay = getNextWeekDate(visibleDays);
    if (newFirstDay) setCurrentMonth(newFirstDay);
  }, [visibleDays, setCurrentMonth]);

  // Select a day to view
  const selectDay = useCallback((day: Date) => {
    if (!day) return;
    console.log("Selected day:", format(day, 'yyyy-MM-dd'));
    setSelectedDate(day);

    // If selected day is not in current month, update the month
    if (currentMonth) {
      const currentMonthValue = currentMonth.getMonth();
      const selectedMonthValue = day.getMonth();
      if (currentMonthValue !== selectedMonthValue) {
        console.log("Updating current month because selected day is in different month");
        setCurrentMonth(day);
      }
    }
  }, [currentMonth, setSelectedDate, setCurrentMonth]);

  // Force refresh events when selected date changes
  useEffect(() => {
    if (selectedDate && fetchEvents) {
      console.log("Selected date changed, refreshing events");
      fetchEvents();
    }
  }, [selectedDate, fetchEvents]);

  // Handle adding a new habit
  const handleAddHabit = useCallback(() => {
    setIsHabitModalOpen(true);
  }, []);

  // Handle success of adding a new habit
  const handleHabitSuccess = useCallback(() => {
    // Refetch events after a new habit is added
    if (fetchEvents) {
      fetchEvents();
    }
  }, [fetchEvents]);

  // Filter tasks based on selected area and completion status
  const filteredTasks = getFilteredTasks ? getFilteredTasks() : [];
  const filteredDisplayTasks = selectedArea === 'all' 
    ? filteredTasks 
    : filteredTasks.filter(task => !task.area_type || task.area_type === selectedArea);

  const handleGoToIntegrations = () => {
    navigate('/settings?tab=interacoes');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 w-full max-w-full overflow-x-hidden">
      {/* Header with modern design and elevated appearance */}
      <div className="bg-white rounded-b-3xl shadow-md pb-1 w-full relative z-10">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 pt-3 pb-1 rounded-b-3xl">
          {/* Month and year with navigation */}
          <PlannerHeader 
            currentMonth={currentMonth} 
            previousWeek={previousWeek} 
            nextWeek={nextWeek} 
          />

          {/* Day selector */}
          <DaySelector 
            visibleDays={visibleDays}
            selectedDate={selectedDate}
            selectDay={selectDay}
            getTaskCountForDay={getTaskCountForDay}
          />
        </div>
        
        {/* Google Calendar status */}
        {googleCalendarEvents && googleCalendarEvents.length > 0 && (
          <div className="flex items-center justify-center px-4 py-1.5 mt-1">
            <div className="text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1 flex items-center">
              <CalendarClock className="h-3 w-3 mr-1" />
              <span>
                {googleCalendarEvents.length} evento{googleCalendarEvents.length !== 1 ? 's' : ''} do Google Calendar
              </span>
            </div>
          </div>
        )}
        
        {/* Google Calendar connection status */}
        {!isGoogleCalendarEnabled && (
          <div className="flex items-center justify-center px-4 mt-1 mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 flex items-center gap-1 h-6 px-2"
                    onClick={handleGoToIntegrations}
                  >
                    <Info className="h-3 w-3" />
                    <span>Conectar Google Calendar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Conecte sua conta do Google Calendar para importar automaticamente seus eventos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Filter and actions bar with visual separation */}
      <div className="mt-3 relative z-0">
        <PlannerFilterBar 
          showOnlyCompleted={showOnlyCompleted} 
          setShowOnlyCompleted={setShowOnlyCompleted}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
        />
      </div>

      {/* Timeline view with tasks */}
      <div 
        {...swipeHandlers} 
        className={cn(
          "flex-1 px-4 sm:px-6 py-2 w-full max-w-full overflow-x-hidden transition-transform duration-300", 
          isSwipeAnimating ? "animate-bounce-x" : ""
        )}
      >
        <TimelineView 
          selectedDate={selectedDate} 
          taskEvents={filteredDisplayTasks} 
          onToggleCompletion={handleEventComplete} 
          onQuickAction={handleQuickAction} 
          isLoading={isLoading}
          showOnlyCompleted={showOnlyCompleted}
        />
      </div>

      {/* Quick Action Modal */}
      {quickActionEvent && (
        <QuickActionModal 
          eventId={quickActionEvent.id} 
          title={quickActionEvent.title} 
          onClose={closeQuickAction} 
          onDelete={handleDeleteEvent} 
          onEdit={handleEditEvent} 
          onComplete={handleEventComplete} 
          onDuplicate={handleDuplicateEvent} 
        />
      )}

      {/* Habit Modal */}
      <HabitModal 
        isOpen={isHabitModalOpen} 
        onOpenChange={setIsHabitModalOpen} 
        onSuccess={handleHabitSuccess} 
        userId={user?.id} 
      />
    </div>
  );
}
