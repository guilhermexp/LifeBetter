
// This file is now a barrel export file that re-exports functionality from smaller, focused files

import { processUserInput, ProcessUserInputProps } from './inputProcessingService';
import { presentTaskConfirmation } from './taskService';

// Re-export the main functions
export { 
  processUserInput,
  presentTaskConfirmation as presentTaskConfirmationService
};

// Re-export the interface
export type { ProcessUserInputProps as AssistantServiceProps };
