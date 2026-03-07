import { create } from 'zustand';

export type TaskCategory = 'health' | 'mind' | 'social' | 'environment';

export interface HabitTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: TaskCategory;
  completed: boolean;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  isGuest?: boolean;
}

interface AppState {
  tasks: HabitTask[];
  isLoadingTasks: boolean;
  growthLevel: number;
  completeTask: (id: string) => void;
  resetTasks: () => void;
  setTasks: (tasks: HabitTask[]) => void;
  setLoadingTasks: (loading: boolean) => void;

  // Auth & Onboarding State
  user: User | null;
  setUser: (user: User | null) => void;
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
  userGoal: string;
  setUserGoal: (goal: string) => void;
}

export const defaultTasks: HabitTask[] = [
  { id: '1', title: 'Drink water', description: 'Have a full glass of water', icon: 'water', category: 'health', completed: false },
  { id: '2', title: 'Journaling', description: 'Write down 3 things you feel', icon: 'book', category: 'mind', completed: false },
  { id: '3', title: 'Text a friend', description: 'Reach out to someone you care about', icon: 'heart', category: 'social', completed: false },
  { id: '4', title: 'Tidy one spot', description: 'Pick one small area and clean it', icon: 'sparkles', category: 'environment', completed: false },
];

export const useStore = create<AppState>((set) => ({
  tasks: defaultTasks,
  isLoadingTasks: false,
  growthLevel: 0,

  completeTask: (id) => set((state) => {
    const updatedTasks = state.tasks.map(task =>
      task.id === id ? { ...task, completed: true } : task
    );

    const completedCount = updatedTasks.filter(t => t.completed).length;

    return {
      tasks: updatedTasks,
      growthLevel: completedCount,
    };
  }),

  resetTasks: () => set((state) => ({
    tasks: state.tasks.map(t => ({ ...t, completed: false })),
    growthLevel: 0
  })),

  setTasks: (tasks) => set({ tasks, growthLevel: 0 }),
  setLoadingTasks: (loading) => set({ isLoadingTasks: loading }),

  user: null,
  setUser: (user) => set({ user }),
  isOnboarded: false,
  setOnboarded: (value) => set({ isOnboarded: value }),
  userGoal: '',
  setUserGoal: (goal) => set({ userGoal: goal }),
}));
