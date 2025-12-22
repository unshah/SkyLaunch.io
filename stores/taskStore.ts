import { create } from 'zustand';
import { supabase, TABLES } from '../lib/supabase';
import type { UserTask, TaskStatus, TaskCategory } from '../types';

interface TaskWithDetails extends UserTask {
    training_task?: {
        id: string;
        title: string;
        category: TaskCategory;
    };
}

interface TaskState {
    userTasks: TaskWithDetails[];
    taskStatusByTitle: Record<string, TaskStatus>;
    isLoading: boolean;
}

interface TaskActions {
    fetchUserTasks: () => Promise<void>;
    updateTaskStatus: (taskTitle: string, status: TaskStatus, notes?: string) => Promise<{ error: Error | null }>;
    getTaskStatus: (taskTitle: string) => TaskStatus;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set, get) => ({
    userTasks: [],
    taskStatusByTitle: {},
    isLoading: false,

    fetchUserTasks: async () => {
        set({ isLoading: true });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                set({ isLoading: false });
                return;
            }

            // Fetch user's task progress with joined training_tasks data
            const { data, error } = await supabase
                .from(TABLES.USER_TASKS)
                .select(`
                    *,
                    training_task:task_id (
                        id,
                        title,
                        category
                    )
                `)
                .eq('user_id', session.user.id);

            if (error) throw error;

            // Build a map of task title -> status for quick lookup
            const statusMap: Record<string, TaskStatus> = {};
            (data || []).forEach((ut: any) => {
                if (ut.training_task?.title) {
                    statusMap[ut.training_task.title] = ut.status;
                }
            });

            set({
                userTasks: data || [],
                taskStatusByTitle: statusMap,
            });
        } catch (error) {
            console.error('Error fetching user tasks:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskStatus: async (taskTitle: string, status: TaskStatus, notes?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { error: new Error('Not authenticated') };
            }

            // First, get the task from training_tasks table by title
            const { data: taskData, error: taskError } = await supabase
                .from(TABLES.TRAINING_TASKS)
                .select('id')
                .eq('title', taskTitle)
                .single();

            if (taskError || !taskData) {
                console.error('Task not found:', taskTitle, taskError);
                return { error: new Error('Task not found in database') };
            }

            // Check if user already has this task in their progress
            const existingTask = get().userTasks.find(
                (ut: any) => ut.task_id === taskData.id || ut.training_task?.id === taskData.id
            );

            if (existingTask) {
                // Update existing
                const { error } = await supabase
                    .from(TABLES.USER_TASKS)
                    .update({
                        status,
                        notes: notes || existingTask.notes,
                        completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null,
                    })
                    .eq('id', existingTask.id);

                if (error) throw error;
            } else {
                // Insert new
                const { error } = await supabase
                    .from(TABLES.USER_TASKS)
                    .insert({
                        user_id: session.user.id,
                        task_id: taskData.id,
                        status,
                        notes,
                        completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null,
                    });

                if (error) throw error;
            }

            // Update local state immediately
            set((state) => ({
                taskStatusByTitle: {
                    ...state.taskStatusByTitle,
                    [taskTitle]: status,
                }
            }));

            // Then refresh from DB
            await get().fetchUserTasks();
            return { error: null };
        } catch (error) {
            console.error('Error updating task status:', error);
            return { error: error as Error };
        }
    },

    getTaskStatus: (taskTitle: string): TaskStatus => {
        return get().taskStatusByTitle[taskTitle] || 'pending';
    },
}));

