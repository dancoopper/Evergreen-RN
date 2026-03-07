import { create } from 'zustand';

export interface HabitTask {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
}

interface AppState {
  tasks: HabitTask[];
  growthLevel: number;
  completeTask: (id: string) => void;
  resetTasks: () => void;
}

const initialTasks: HabitTask[] = [
  { id: '1', title: 'Drink water', icon: 'water', completed: false },
  { id: '2', title: 'Make your bed', icon: 'bed', completed: false },
  { id: '3', title: 'Take a short walk', icon: 'walk', completed: false },
  { id: '4', title: 'Tidy one small thing', icon: 'sparkles', completed: false },
];

export const useStore = create<AppState>((set) => ({
  tasks: initialTasks,
  growthLevel: 0,
  
  completeTask: (id) => set((state) => {
    const updatedTasks = state.tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    );
    
    // Calculate new growth level based on completed tasks
    const completedCount = updatedTasks.filter(t => t.completed).length;
    
    return {
      tasks: updatedTasks,
      growthLevel: completedCount, // Growth maps accurately to the number of completed tasks (0 to 4)
    };
  }),

  resetTasks: () => set({ 
    tasks: initialTasks,
    growthLevel: 0
  }),
}));
