
// Knowledge Base for Habit Suggestions
// Define the structure for habit suggestions with clear, consistent types

/**
 * Frequência recomendada para implementação do hábito
 */
export type FrequencyType = "daily" | "weekly" | "monthly";

/**
 * Período de duração do hábito
 */
export type DurationType = "permanent" | "test";

/**
 * Categorias disponíveis para hábitos
 */
export type HabitCategory = 
  | "Physical Health" 
  | "Mental Wellness" 
  | "Productivity" 
  | "Nutrition" 
  | "Sleep" 
  | "Relationships" 
  | "Learning" 
  | "Finance";

/**
 * Detalhes sobre como implementar o hábito
 */
export interface HabitImplementation {
  /** Frequência recomendada (diária, semanal, mensal) */
  recommendedFrequency: FrequencyType;
  
  /** Quantas vezes deve ser realizado no período (ex: "uma vez por dia") */
  recommendedTimes: string;
  
  /** Se o hábito deve ser permanente ou apenas para teste */
  durationPeriod: DurationType;
  
  /** Duração do período de teste em dias (apenas para hábitos de teste) */
  testDuration?: number;
  
  /** Melhor momento do dia para realizar o hábito */
  bestTimeOfDay: string;
  
  /** Passos para progressão gradual na implementação do hábito */
  progressionSteps: string[];
  
  /** Dicas para adaptação do hábito às diferentes situações */
  adaptationTips: string[];
  
  /** Base científica que justifica o hábito */
  scientificBasis: string;
  
  /** @deprecated Use recommendedTimes instead */
  time?: string;
  
  /** @deprecated Use testDuration instead */
  recommended_duration?: number;
}

/**
 * Estrutura completa para uma sugestão de hábito
 */
export interface HabitSuggestion {
  /** Identificador único do hábito */
  id: string;
  
  /** Categoria a que o hábito pertence */
  category: HabitCategory;
  
  /** Título do hábito */
  title: string;
  
  /** Descrição detalhada do que é o hábito e seu propósito */
  description: string;
  
  /** Lista de benefícios que o hábito proporciona */
  benefits: string[];
  
  /** Facilidade de implementação em uma escala de 1-10 (10 = mais fácil) */
  easeOfImplementation: number;
  
  /** Tempo necessário para praticar o hábito */
  timeInvestment: string;
  
  /** Dicas para manter a motivação na prática do hábito */
  motivationTips: string[];
  
  /** Exemplo concreto de como implementar o hábito */
  exampleHabit: string;
  
  /** Considerações importantes no planejamento do hábito */
  planConsiderations: string[];
  
  /** Detalhes específicos de implementação do hábito */
  habitImplementations: HabitImplementation[];
}

// Sample Habit Suggestions
export const habitSuggestions: HabitSuggestion[] = [
  {
    id: "1",
    category: "Physical Health",
    title: "Regular Walking",
    description: "Incorporate short walks into your daily routine to improve cardiovascular health and boost mood.",
    benefits: [
      "Improved cardiovascular health",
      "Increased energy levels",
      "Stress reduction",
      "Weight management"
    ],
    easeOfImplementation: 8,
    timeInvestment: "15-30 minutes per day",
    motivationTips: [
      "Walk in nature or a park",
      "Listen to music or podcasts",
      "Walk with a friend or family member"
    ],
    exampleHabit: "Take a 20-minute walk during lunch break.",
    planConsiderations: [
      "Choose a safe and accessible walking route",
      "Wear comfortable shoes",
      "Set a specific time for your walk"
    ],
    habitImplementations: [
      {
        recommendedFrequency: "daily",
        recommendedTimes: "Once a day",
        durationPeriod: "permanent",
        bestTimeOfDay: "Morning or lunch break",
        progressionSteps: [
          "Start with 10-minute walks",
          "Gradually increase the duration",
          "Incorporate hills or varied terrain"
        ],
        adaptationTips: [
          "Adjust the duration based on your schedule",
          "Walk indoors if the weather is bad",
          "Find a walking buddy for motivation"
        ],
        scientificBasis: "Studies show that regular walking improves cardiovascular health and reduces the risk of chronic diseases.",
      },
    ],
  },
  {
    id: "2",
    category: "Mental Wellness",
    title: "Mindful Breathing",
    description: "Practice mindful breathing exercises to reduce stress and improve focus.",
    benefits: [
      "Reduced stress and anxiety",
      "Improved focus and concentration",
      "Enhanced emotional regulation",
      "Increased self-awareness"
    ],
    easeOfImplementation: 9,
    timeInvestment: "5-10 minutes per day",
    motivationTips: [
      "Create a quiet and comfortable space",
      "Use a guided meditation app",
      "Focus on the sensation of your breath"
    ],
    exampleHabit: "Take 5 minutes each morning to practice deep breathing.",
    planConsiderations: [
      "Find a quiet time and place",
      "Use a timer to track your practice",
      "Be patient and persistent"
    ],
    habitImplementations: [
      {
        recommendedFrequency: "daily",
        recommendedTimes: "Once or twice a day",
        durationPeriod: "permanent",
        bestTimeOfDay: "Morning or before bed",
        progressionSteps: [
          "Start with 2-minute sessions",
          "Gradually increase the duration",
          "Explore different breathing techniques"
        ],
        adaptationTips: [
          "Practice during stressful moments",
          "Combine with other relaxation techniques",
          "Adjust the duration based on your needs"
        ],
        scientificBasis: "Mindful breathing activates the parasympathetic nervous system, reducing stress and promoting relaxation.",
      },
    ],
  },
  {
    id: "3",
    category: "Productivity",
    title: "Prioritize Tasks",
    description: "Start each day by identifying and prioritizing your most important tasks.",
    benefits: [
      "Increased efficiency",
      "Reduced overwhelm",
      "Improved time management",
      "Greater sense of accomplishment"
    ],
    easeOfImplementation: 7,
    timeInvestment: "5-10 minutes per day",
    motivationTips: [
      "Use a task management app",
      "Break large tasks into smaller steps",
      "Reward yourself for completing tasks"
    ],
    exampleHabit: "Spend 10 minutes each morning planning your day.",
    planConsiderations: [
      "Use a prioritization method (e.g., Eisenhower Matrix)",
      "Set realistic goals",
      "Review and adjust your plan as needed"
    ],
    habitImplementations: [
      {
        recommendedFrequency: "daily",
        recommendedTimes: "Once a day",
        durationPeriod: "permanent",
        bestTimeOfDay: "Morning",
        progressionSteps: [
          "Start by listing all tasks",
          "Prioritize based on importance and urgency",
          "Focus on the top 1-3 tasks"
        ],
        adaptationTips: [
          "Adjust priorities as new tasks arise",
          "Delegate or eliminate low-priority tasks",
          "Use time-blocking to schedule tasks"
        ],
        scientificBasis: "Prioritizing tasks improves focus and reduces cognitive load, leading to increased productivity.",
      },
    ],
  },
  {
    id: "4",
    category: "Nutrition",
    title: "Hydration",
    description: "Drink enough water throughout the day to maintain optimal health and energy levels.",
    benefits: [
      "Improved energy levels",
      "Better skin health",
      "Enhanced cognitive function",
      "Support for bodily functions"
    ],
    easeOfImplementation: 9,
    timeInvestment: "Ongoing throughout the day",
    motivationTips: [
      "Carry a water bottle with you",
      "Set reminders to drink water",
      "Track your water intake"
    ],
    exampleHabit: "Drink a glass of water before each meal.",
    planConsiderations: [
      "Determine your daily water needs",
      "Choose water over sugary drinks",
      "Make water easily accessible"
    ],
    habitImplementations: [
      {
        recommendedFrequency: "daily",
        recommendedTimes: "Throughout the day",
        durationPeriod: "permanent",
        bestTimeOfDay: "All day",
        progressionSteps: [
          "Start by drinking a glass of water in the morning",
          "Carry a water bottle and refill it regularly",
          "Set reminders to drink water throughout the day"
        ],
        adaptationTips: [
          "Add flavor to your water with fruits or herbs",
          "Drink more water during physical activity",
          "Adjust your intake based on climate and activity level"
        ],
        scientificBasis: "Adequate hydration is essential for maintaining bodily functions and overall health.",
      },
    ],
  },
  {
    id: "5",
    category: "Sleep",
    title: "Consistent Sleep Schedule",
    description: "Go to bed and wake up at the same time each day to regulate your body's natural sleep-wake cycle.",
    benefits: [
      "Improved sleep quality",
      "Increased energy levels",
      "Better mood",
      "Enhanced cognitive function"
    ],
    easeOfImplementation: 7,
    timeInvestment: "Requires daily commitment",
    motivationTips: [
      "Create a relaxing bedtime routine",
      "Avoid caffeine and alcohol before bed",
      "Make your bedroom dark, quiet, and cool"
    ],
    exampleHabit: "Go to bed at 10 PM and wake up at 6 AM every day.",
    planConsiderations: [
      "Choose a sleep schedule that fits your lifestyle",
      "Be consistent on weekends",
      "Adjust your schedule gradually"
    ],
    habitImplementations: [
      {
        recommendedFrequency: "daily",
        recommendedTimes: "Every night and morning",
        durationPeriod: "permanent",
        bestTimeOfDay: "Night and morning",
        progressionSteps: [
          "Start by setting a consistent bedtime and wake-up time",
          "Create a relaxing bedtime routine",
          "Avoid screens before bed"
        ],
        adaptationTips: [
          "Adjust your schedule gradually",
          "Use blackout curtains to darken your room",
          "Consult a sleep specialist if you have trouble sleeping"
        ],
        scientificBasis: "A consistent sleep schedule regulates the body's circadian rhythm, improving sleep quality and overall health.",
      },
    ],
  },
];

/**
 * Utilitário para buscar hábitos por categoria
 */
export const getHabitsByCategory = (category: HabitCategory): HabitSuggestion[] => {
  return habitSuggestions.filter(habit => habit.category === category);
};

/**
 * Utilitário para buscar um hábito específico por ID
 */
export const getHabitById = (id: string): HabitSuggestion | undefined => {
  return habitSuggestions.find(habit => habit.id === id);
};

/**
 * Utilitário para buscar hábitos com base na facilidade de implementação
 * @param minEase Valor mínimo de facilidade (1-10)
 * @param maxEase Valor máximo de facilidade (1-10)
 */
export const getHabitsByEase = (minEase: number, maxEase: number): HabitSuggestion[] => {
  return habitSuggestions.filter(
    habit => habit.easeOfImplementation >= minEase && habit.easeOfImplementation <= maxEase
  );
};

/**
 * Retorna todas as categorias disponíveis
 */
export const getAllCategories = (): HabitCategory[] => {
  return [...new Set(habitSuggestions.map(habit => habit.category))] as HabitCategory[];
};
