import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';

// Define the state interface
interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  scheduled_date?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  user_id: string;
  created_at: string;
}

interface State {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  tasks: Task[];
  loading: Record<string, boolean>;
  error: Record<string, Error | null>;
}

// Define action types
enum ActionType {
  SET_USER = 'SET_USER',
  SET_THEME = 'SET_THEME',
  SET_TASKS = 'SET_TASKS',
  ADD_TASK = 'ADD_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  RESET_STATE = 'RESET_STATE',
}

// Define action interfaces
interface SetUserAction {
  type: ActionType.SET_USER;
  payload: { user: User | null };
}

interface SetThemeAction {
  type: ActionType.SET_THEME;
  payload: { theme: 'light' | 'dark' | 'system' };
}

interface SetTasksAction {
  type: ActionType.SET_TASKS;
  payload: { tasks: Task[] };
}

interface AddTaskAction {
  type: ActionType.ADD_TASK;
  payload: { task: Task };
}

interface UpdateTaskAction {
  type: ActionType.UPDATE_TASK;
  payload: { taskId: string; updates: Partial<Task> };
}

interface DeleteTaskAction {
  type: ActionType.DELETE_TASK;
  payload: { taskId: string };
}

interface SetLoadingAction {
  type: ActionType.SET_LOADING;
  payload: { resource: string; loading: boolean };
}

interface SetErrorAction {
  type: ActionType.SET_ERROR;
  payload: { resource: string; error: Error | null };
}

interface ResetStateAction {
  type: ActionType.RESET_STATE;
}

type Action =
  | SetUserAction
  | SetThemeAction
  | SetTasksAction
  | AddTaskAction
  | UpdateTaskAction
  | DeleteTaskAction
  | SetLoadingAction
  | SetErrorAction
  | ResetStateAction;

// Define initial state
const initialState: State = {
  user: null,
  theme: 'system',
  tasks: [],
  loading: {
    global: false,
    tasks: false,
    user: false,
  },
  error: {
    global: null,
    tasks: null,
    user: null,
  },
};

// Create reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_USER:
      return {
        ...state,
        user: action.payload.user,
      };
    case ActionType.SET_THEME:
      return {
        ...state,
        theme: action.payload.theme,
      };
    case ActionType.SET_TASKS:
      return {
        ...state,
        tasks: action.payload.tasks,
      };
    case ActionType.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload.task],
      };
    case ActionType.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    case ActionType.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.resource]: action.payload.loading,
        },
      };
    case ActionType.SET_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.resource]: action.payload.error,
        },
      };
    case ActionType.RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

// Create context
interface StoreContextType {
  state: State;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Create provider component
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Create hook to use the store
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Export action types
export { ActionType };
export type { State, User, Task, Action };
