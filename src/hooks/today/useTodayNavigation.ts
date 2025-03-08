
import { useState } from "react";
import { addDays, subDays } from "date-fns";

export function useTodayNavigation() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Functions to navigate between days
  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  return {
    selectedDate,
    setSelectedDate,
    goToNextDay,
    goToPreviousDay
  };
}
