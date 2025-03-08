
// Format time range for display
export const formatTimeRange = (startTime?: string | null, duration?: number | null) => {
  if (!startTime) return "";
  
  const [hours, minutes] = startTime.split(':').map(num => parseInt(num));
  let formattedStart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  if (!duration) return formattedStart;
  
  // Calculate end time
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + duration);
  
  const formattedEnd = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Format duration in minutes or hours
  let durationText = "";
  if (duration < 60) {
    durationText = `(${duration} min)`;
  } else {
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    durationText = mins > 0 ? `(${hours}h ${mins}min)` : `(${hours}h)`;
  }
  
  return `${formattedStart} – ${formattedEnd} ${durationText}`;
};
