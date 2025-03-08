
import { useState } from "react";
import { DetectedContext, TaskContextType } from "./task-context/types";
import { processText as processTextUtil } from "./task-context/contextProcessor";

// Use 'export type' instead of 're-export' for TypeScript with isolatedModules
export type { TaskContextType } from "./task-context/types";

export const useTaskContextDetector = () => {
  const [detectedContext, setDetectedContext] = useState<DetectedContext>({
    title: "",
    date: null,
    time: null,
    type: 'task',
    location: null,
    people: [],
    category: null,
    suggestedColor: null
  });

  // Process text to extract context
  const processText = (text: string) => {
    const context = processTextUtil(text);
    setDetectedContext(context);
  };

  return { processText, detectedContext };
};
