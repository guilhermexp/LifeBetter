import { useReducer, useContext, createContext, ReactNode, useCallback, useMemo, Dispatch } from 'react';

// Define action types
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : { type: Key; payload: M[Key] };
};

// Define possible actions
export enum ActionTypes {
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

// Define payload types for each action
type Payload = {
  [ActionTypes.SET_USER]: {
    user: User | null;
  };
  [ActionTypes.SET_THEME]: {
    theme: 'light' | 'dark' | 'system';
  };
  [ActionTypes.SET_TASKS]: {
    tasks: Task[];
  };
  [ActionTypes.ADD_TASK]: {
    task: Task;
  };
  [ActionTypes.UPDATE_TASK]: {
    taskId: string;
    updates: Partial<Task>;
  };
  [ActionTypes.DELETE_TASK]: {
    taskId: string;
  };
  [ActionTypes.SET_LOADING]: {
    loading: boolean;
    resource?: string;
  };
  [ActionTypes.SET_ERROR]: {
    error: Error | null;
    resource?: string;
  };
  [ActionTypes.RESET_STATE]: undefined;
};

// Create the action types
export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

// Define the state types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  scheduled_date?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  user_id: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export interface State {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  tasks: Task[];
  loading: {
    global: boolean;
    tasks: boolean;
    user: boolean;
    [key: string]: boolean;
  };
  error: {
    global: Error | null;
    tasks: Error | null;
    user: Error | null;
    [key: string]: Error | null;
  };
}

// Define the initial state
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

// Create the reducer function
const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
      };
    
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload.theme,
      };
    
    case ActionTypes.SET_TASKS:
      return {
        ...state,
        tasks: action.payload.tasks,
      };
    
    case ActionTypes.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload.task],
      };
    
    case ActionTypes.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    
    case ActionTypes.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };
    
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.resource || 'global']: action.payload.loading,
        },
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.resource || 'global']: action.payload.error,
        },
      };
    
    case ActionTypes.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create the context
const StoreContext = createContext<{
  state: State;
  dispatch: Dispatch<Actions>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Create the provider component
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  
  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// Create the hook
export const useStore = () => {
  const context = useContext(StoreContext);
  
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  
  return context;
};

// Create action creators
export const useActions = () => {
  const { dispatch } = useStore();
  
  const setUser = useCallback(
    (user: User | null) => {
      dispatch({
        type: ActionTypes.SET_USER,
        payload: { user },
      });
    },
    [dispatch]
  );
  
  const setTheme = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      dispatch({
        type: ActionTypes.SET_THEME,
        payload: { theme },
      });
    },
    [dispatch]
  );
  
  const setTasks = useCallback(
    (tasks: Task[]) => {
      dispatch({
        type: ActionTypes.SET_TASKS,
        payload: { tasks },
      });
    },
    [dispatch]
  );
  
  const addTask = useCallback(
    (task: Task) => {
      dispatch({
        type: ActionTypes.ADD_TASK,
        payload: { task },
      });
    },
    [dispatch]
  );
  
  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      dispatch({
        type: ActionTypes.UPDATE_TASK,
        payload: { taskId, updates },
      });
    },
    [dispatch]
  );
  
  const deleteTask = useCallback(
    (taskId: string) => {
      dispatch({
        type: ActionTypes.DELETE_TASK,
        payload: { taskId },
      });
    },
    [dispatch]
  );
  
  const setLoading = useCallback(
    (loading: boolean, resource?: string) => {
      dispatch({
        type: ActionTypes.SET_LOADING,
        payload: { loading, resource },
      });
    },
    [dispatch]
  );
  
  const setError = useCallback(
    (error: Error | null, resource?: string) => {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: { error, resource },
      });
    },
    [dispatch]
  );
  
  const resetState = useCallback(() => {
    dispatch({
      type: ActionTypes.RESET_STATE,
    });
  }, [dispatch]);
  
  return {
    setUser,
    setTheme,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    setLoading,
    setError,
    resetState,
  };
};

// Create selectors
export const useSelectors = () => {
  const { state } = useStore();
  
  const getUser = useCallback(() => state.user, [state.user]);
  
  const getTheme = useCallback(() => state.theme, [state.theme]);
  
  const getTasks = useCallback(() => state.tasks, [state.tasks]);
  
  const getTaskById = useCallback(
    (taskId: string) => state.tasks.find((task) => task.id === taskId),
    [state.tasks]
  );
  
  const getCompletedTasks = useCallback(
    () => state.tasks.filter((task) => task.completed),
    [state.tasks]
  );
  
  const getIncompleteTasks = useCallback(
    () => state.tasks.filter((task) => !task.completed),
    [state.tasks]
  );
  
  const getTasksByDate = useCallback(
    (date: string) => state.tasks.filter((task) => task.scheduled_date === date),
    [state.tasks]
  );
  
  const getTasksByPriority = useCallback(
    (priority: 'low' | 'medium' | 'high') =>
      state.tasks.filter((task) => task.priority === priority),
    [state.tasks]
  );
  
  const isLoading = useCallback(
    (resource?: string) => state.loading[resource || 'global'],
    [state.loading]
  );
  
  const getError = useCallback(
    (resource?: string) => state.error[resource || 'global'],
    [state.error]
  );
  
  return {
    getUser,
    getTheme,
    getTasks,
    getTaskById,
    getCompletedTasks,
    getIncompleteTasks,
    getTasksByDate,
    getTasksByPriority,
    isLoading,
    getError,
  };
};
