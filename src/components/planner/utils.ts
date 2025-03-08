
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatWeekdayAndDay = (date: Date) => {
  const weekday = format(date, "EEEE", { locale: ptBR });
  const day = format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
  
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day
  };
};

export const formatMonthYear = (date: Date) => {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
};
