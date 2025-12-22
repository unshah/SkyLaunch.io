import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase, TABLES } from '../lib/supabase';
import type { AuthState, UserProfile, CFIProfile } from '../types';

// Get the appropriate redirect URL based on platform
const getRedirectUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:8081/auth/callback';
    }
    return 'skylaunch://auth/callback';
};

interface AuthStore extends AuthState {
    signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    fetchCFIProfile: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    cfiProfile: null,
    isLoading: true,
    isOnboarded: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                set({ user: { id: session.user.id, email: session.user.email! } });
                await get().fetchProfile();
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            set({ isLoading: false });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                set({ user: { id: session.user.id, email: session.user.email! } });
                await get().fetchProfile();
            } else {
                set({ user: null, profile: null, cfiProfile: null, isOnboarded: false });
            }
        });
    },

    signUp: async (email: string, password: string, name?: string) => {
        try {
            set({ isLoading: true });
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: getRedirectUrl(),
                    data: {
                        full_name: name || '',
                    }
                }
            });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        } finally {
            set({ isLoading: false });
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            set({ isLoading: true });
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null, cfiProfile: null, isOnboarded: false });
    },

    fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Fetch profile error:', error);
                return;
            }

            if (data) {
                const profile = data as UserProfile;
                set({ profile, isOnboarded: true });

                // If user is a CFI, also fetch CFI profile
                if (profile.role === 'cfi') {
                    await get().fetchCFIProfile();
                }
            } else {
                set({ isOnboarded: false });
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
        }
    },

    fetchCFIProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('cfi_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Fetch CFI profile error:', error);
                return;
            }

            if (data) {
                set({ cfiProfile: data as CFIProfile });
            }
        } catch (error) {
            console.error('CFI profile fetch error:', error);
        }
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

