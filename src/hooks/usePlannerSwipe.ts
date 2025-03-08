
import { useState, useCallback } from "react";
import { addDays, subDays } from "date-fns";
import { useSwipeable } from "react-swipeable";

interface UsePlannerSwipeProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  visibleDays: Date[];
  setCurrentMonth: (date: Date) => void;
}

export function usePlannerSwipe({
  selectedDate,
  setSelectedDate,
  visibleDays,
  setCurrentMonth
}: UsePlannerSwipeProps) {
  const [isSwipeAnimating, setIsSwipeAnimating] = useState(false);
  
  // Navigate to previous day
  const previousDay = useCallback(() => {
    if (!selectedDate) return;
    setIsSwipeAnimating(true);
    const newDate = subDays(selectedDate, 1);
    setSelectedDate(newDate);

    // If needed, update the visible week
    if (visibleDays.length > 0 && newDate.getTime() < visibleDays[0].getTime()) {
      setCurrentMonth(newDate);
    }
    setTimeout(() => {
      setIsSwipeAnimating(false);
    }, 300);
  }, [selectedDate, visibleDays, setSelectedDate, setCurrentMonth]);

  // Navigate to next day
  const nextDay = useCallback(() => {
    if (!selectedDate) return;
    setIsSwipeAnimating(true);
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);

    // If needed, update the visible week
    if (visibleDays.length > 0 && newDate.getTime() > visibleDays[6].getTime()) {
      setCurrentMonth(newDate);
    }
    setTimeout(() => {
      setIsSwipeAnimating(false);
    }, 300);
  }, [selectedDate, visibleDays, setSelectedDate, setCurrentMonth]);

  // Setup swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextDay(),
    onSwipedRight: () => previousDay(),
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  return {
    isSwipeAnimating,
    swipeHandlers,
    previousDay,
    nextDay
  };
}
