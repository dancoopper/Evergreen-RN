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
  syncTasksToSupabase: (tasks: HabitTask[]) => Promise<void>;
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
    const task = state.tasks.find(t => t.id === id);
    
    // If the task is already completed, do nothing to avoid double incrementing
    if (!task || task.completed) return;

    const updatedTasks = state.tasks.map(t =>
      t.id === id ? { ...t, completed: true } : t
    );
    
    // Increment the growth level by 1 for the newly completed task
    const newGrowthLevel = state.growthLevel + 1;

    // Sync to Supabase if logged in
    if (state.user && !state.user.isGuest && state.user.fake_id) {
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

      // Update User world_level
      supabase.from('User').update({ world_level: newGrowthLevel })
        .eq('fake_id', state.user.fake_id)
        .then(({ error }) => {
          if (error) console.error("Error updating world_level:", error);
        });
    }

    set({ tasks: updatedTasks, growthLevel: newGrowthLevel });
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
          // Removed Math.max overwrite so manual UI checks or Supabase overrides aren't broken by historical task counts.
        }

        console.log("=== DEBUG USESTORE START ===");
        console.log("Supabase raw world_level:", userData?.world_level);
        console.log("Tasks found in DB:", userTasks?.length || 0);
        console.log("Final applied newGrowthLevel:", newGrowthLevel);
        console.log("=== DEBUG USESTORE END ===");

        return {
          growthLevel: newGrowthLevel,
          tasks: syncedTasks
        };
      });
    } catch (err) {
      console.error("Error fetching user data from Supabase:", err);
    }
  },

  syncTasksToSupabase: async (tasks: HabitTask[]) => {
    const state = get();
    if (!state.user || state.user.isGuest || !state.user.fake_id) return;

    try {
      const rows = tasks.map(task => ({
        task_name: task.title,
        description: task.description,
        category: task.category,
        completed: false,
        user_id: state.user!.fake_id,
      }));

      const { error } = await supabase.from('Task').insert(rows);
      if (error) {
        console.error('Error syncing AI tasks to Supabase:', error);
      } else {
        console.log('✅ AI tasks synced to Supabase:', rows.length);
      }
    } catch (err) {
      console.error('Error syncing AI tasks:', err);
    }
  },

  resetTasks: () => set((state) => ({
    tasks: state.tasks.map(t => ({ ...t, completed: false }))
  })),

  setTasks: (tasks) => set({ tasks }),
  setLoadingTasks: (loading) => set({ isLoadingTasks: loading }),

  user: null,
  setUser: (user) => set({ user }),
  isOnboarded: false,
  setOnboarded: (value) => set({ isOnboarded: value }),
  userGoal: '',
  setUserGoal: (goal) => set({ userGoal: goal }),
}));
