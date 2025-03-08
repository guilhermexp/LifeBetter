
// Export all functionality from the refactored modules
export { convertDurationToMinutes, calculateFutureDates } from './utils/dateUtils';
export { createTask } from './utils/taskCreation';
export { 
  confirmTaskForPlanner,
  updateAllTaskInstances,
  deleteAllTaskInstances,
  updateTaskToPlanner
} from './utils/taskManagement';
