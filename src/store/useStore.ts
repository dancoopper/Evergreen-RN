import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  fake_id?: string;
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

  // Supabase Sync
  fetchUserData: (fakeId: string) => Promise<void>;
}

export const defaultTasks: HabitTask[] = [
  { id: '1', title: 'Drink water', description: 'Have a full glass of water', icon: 'water', category: 'health', completed: false },
  { id: '2', title: 'Journaling', description: 'Write down 3 things you feel', icon: 'book', category: 'mind', completed: false },
  { id: '3', title: 'Text a friend', description: 'Reach out to someone you care about', icon: 'heart', category: 'social', completed: false },
  { id: '4', title: 'Tidy one spot', description: 'Pick one small area and clean it', icon: 'sparkles', category: 'environment', completed: false },
];

export const useStore = create<AppState>((set, get) => ({
  tasks: defaultTasks,
  isLoadingTasks: false,
  growthLevel: 0,

  completeTask: (id) => {
    const state = get();
    const updatedTasks = state.tasks.map(task =>
      task.id === id ? { ...task, completed: true } : task
    );
    const completedCount = updatedTasks.filter(t => t.completed).length;

    // Sync to Supabase if logged in
    if (state.user && !state.user.isGuest && state.user.fake_id) {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        supabase.from('Task').insert([
          {
            task_name: task.title,
            description: task.description,
            category: task.category,
            completed: true,
            user_id: state.user.fake_id
          }
        ]).then(({ error }) => {
          if (error) console.error("Error syncing task:", error);
        });
      }

      // Update User world_level
      supabase.from('User').update({ world_level: Math.max(1, completedCount) })
        .eq('fake_id', state.user.fake_id)
        .then(({ error }) => {
          if (error) console.error("Error updating world_level:", error);
        });
    }

    set({ tasks: updatedTasks, growthLevel: completedCount });
  },

  fetchUserData: async (fakeId: string) => {
    try {
      // Fetch world_level
      const { data: userData } = await supabase.from('User').select('world_level').eq('fake_id', fakeId).single();

      // Fetch completed tasks
      const { data: userTasks } = await supabase.from('Task').select('*').eq('user_id', fakeId).eq('completed', true);

      set((state) => {
        let newGrowthLevel = state.growthLevel;
        if (userData && typeof userData.world_level === 'number') {
          newGrowthLevel = userData.world_level;
        }

        let syncedTasks = state.tasks;
        if (userTasks && userTasks.length > 0) {
          syncedTasks = state.tasks.map(t => {
            if (userTasks.some(ut => ut.task_name === t.title)) {
              return { ...t, completed: true };
            }
            return t;
          });
          // Update growth level to match completed tasks if it's currently 0 or smaller
          const actualCompletedCount = syncedTasks.filter(t => t.completed).length;
          newGrowthLevel = Math.max(newGrowthLevel, actualCompletedCount);
        }

        return {
          growthLevel: newGrowthLevel,
          tasks: syncedTasks
        };
      });
    } catch (err) {
      console.error("Error fetching user data from Supabase:", err);
    }
  },

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
