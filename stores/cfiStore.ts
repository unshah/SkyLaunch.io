import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
    StudentCFILink,
    ManeuverGrade,
    Maneuver,
    Endorsement,
    UserProfile,
    FlightLogEntry,
    GradeLevel
} from '../types';

interface CFIStore {
    // State
    students: StudentCFILink[];
    maneuvers: Maneuver[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchStudents: () => Promise<void>;
    fetchManeuvers: () => Promise<void>;
    generateInviteCode: () => Promise<string | null>;
    getStudentGrades: (studentId: string) => Promise<ManeuverGrade[]>;
    getStudentFlights: (studentId: string) => Promise<FlightLogEntry[]>;
    createStudentFlight: (
        studentId: string,
        flightDate: string,
        duration: number,
        departureAirport: string,
        notes?: string
    ) => Promise<{ flightLogId: string | null; error: Error | null }>;
    gradeManeuver: (
        studentId: string,
        cfiId: string,
        maneuverId: string,
        grade: GradeLevel,
        flightLogId?: string,
        notes?: string
    ) => Promise<{ error: Error | null }>;
    getStudentEndorsements: (studentId: string) => Promise<Endorsement[]>;
}

export const useCFIStore = create<CFIStore>((set, get) => ({
    students: [],
    maneuvers: [],
    isLoading: false,
    error: null,

    fetchStudents: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            // First get CFI profile
            const { data: cfiProfile } = await supabase
                .from('cfi_profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

            if (!cfiProfile) {
                set({ students: [], isLoading: false });
                return;
            }

            // Fetch students linked to this CFI with their profile data
            const { data, error } = await supabase
                .from('student_cfi_links')
                .select(`
                    *,
                    student:student_id (
                        id,
                        full_name,
                        role,
                        training_goal,
                        current_flight_hours,
                        home_airport,
                        created_at
                    )
                `)
                .eq('cfi_id', cfiProfile.id)
                .eq('status', 'active');

            if (error) throw error;

            set({ students: data as StudentCFILink[], isLoading: false });
        } catch (error) {
            console.error('Error fetching students:', error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    fetchManeuvers: async () => {
        try {
            const { data, error } = await supabase
                .from('maneuvers')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;

            set({ maneuvers: data as Maneuver[] });
        } catch (error) {
            console.error('Error fetching maneuvers:', error);
        }
    },

    generateInviteCode: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            // First check if CFI already has an invite code
            const { data: existingProfile } = await supabase
                .from('cfi_profiles')
                .select('invite_code')
                .eq('user_id', session.user.id)
                .single();

            // If code already exists, return it (don't regenerate)
            if (existingProfile?.invite_code) {
                return existingProfile.invite_code;
            }

            // Generate a random 6-character code (only if none exists)
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Update CFI profile with new code
            const { error } = await supabase
                .from('cfi_profiles')
                .update({ invite_code: code })
                .eq('user_id', session.user.id);

            if (error) throw error;

            return code;
        } catch (error) {
            console.error('Error generating invite code:', error);
            return null;
        }
    },

    getStudentGrades: async (studentId: string) => {
        try {
            const { data, error } = await supabase
                .from('maneuver_grades')
                .select(`
                    *,
                    maneuver:maneuver_id (*)
                `)
                .eq('student_id', studentId)
                .order('graded_at', { ascending: false });

            if (error) throw error;

            return data as ManeuverGrade[];
        } catch (error) {
            console.error('Error fetching grades:', error);
            return [];
        }
    },

    getStudentFlights: async (studentId: string) => {
        try {
            const { data, error } = await supabase
                .from('flight_log')
                .select('*')
                .eq('user_id', studentId)
                .order('flight_date', { ascending: false });

            if (error) throw error;

            return data as FlightLogEntry[];
        } catch (error) {
            console.error('Error fetching student flights:', error);
            return [];
        }
    },

    createStudentFlight: async (
        studentId: string,
        flightDate: string,
        duration: number,
        departureAirport: string,
        notes?: string
    ) => {
        try {
            const { data, error } = await supabase
                .from('flight_log')
                .insert({
                    user_id: studentId,
                    flight_date: flightDate,
                    duration_hours: duration,
                    departure_airport: departureAirport.toUpperCase() || 'ZZZZ',
                    notes: notes || null,
                })
                .select('id')
                .single();

            if (error) throw error;

            return { flightLogId: data?.id || null, error: null };
        } catch (error) {
            console.error('Error creating student flight:', error);
            return { flightLogId: null, error: error as Error };
        }
    },

    gradeManeuver: async (
        studentId: string,
        cfiId: string,
        maneuverId: string,
        grade: GradeLevel,
        flightLogId?: string,
        notes?: string
    ) => {
        try {
            const { error } = await supabase
                .from('maneuver_grades')
                .insert({
                    student_id: studentId,
                    cfi_id: cfiId,
                    maneuver_id: maneuverId,
                    grade,
                    flight_log_id: flightLogId || null,
                    notes: notes || null,
                });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            console.error('Error grading maneuver:', error);
            return { error: error as Error };
        }
    },

    getStudentEndorsements: async (studentId: string) => {
        try {
            const { data, error } = await supabase
                .from('endorsements')
                .select('*')
                .eq('student_id', studentId)
                .order('signed_at', { ascending: false });

            if (error) throw error;

            return data as Endorsement[];
        } catch (error) {
            console.error('Error fetching endorsements:', error);
            return [];
        }
    },
}));
