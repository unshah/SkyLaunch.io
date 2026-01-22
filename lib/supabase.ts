import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration - loaded from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase configuration. Please check your .env file.');
}

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

// Get the appropriate redirect URL based on platform
export const getRedirectUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:8081/auth/callback';
    }
    return 'skylaunch://auth/callback';
};

// Password reset always redirects to native app (not web)
export const getPasswordResetRedirectUrl = () => {
    return 'skylaunch://auth/callback';
};
