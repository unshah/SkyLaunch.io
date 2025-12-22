import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const SUPABASE_URL = 'https://wzotkouzemmkwztvxmbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6b3Rrb3V6ZW1ta3d6dHZ4bWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjE3NTksImV4cCI6MjA4MTkzNzc1OX0.vLghdJ6lccZRkWGqerviMv79PayS-T4OC0vJuvI7T9M';

// Custom storage adapter that works on both web and native
const ExpoSecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && window.localStorage) {
                    return window.localStorage.getItem(key);
                }
                return null;
            }
            return await AsyncStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(key, value);
                }
                return;
            }
            await AsyncStorage.setItem(key, value);
        } catch {
            // Ignore storage errors
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.removeItem(key);
                }
                return;
            }
            await AsyncStorage.removeItem(key);
        } catch {
            // Ignore storage errors
        }
    },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Database table names
export const TABLES = {
    PROFILES: 'profiles',
    TRAINING_TASKS: 'training_tasks',
    USER_TASKS: 'user_tasks',
    FLIGHT_LOG: 'flight_log',
} as const;
