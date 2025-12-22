import { create } from 'zustand';
import { supabase, TABLES } from '../lib/supabase';
import type { FlightLogEntry, FlightConditions } from '../types';

interface FlightLogState {
    flightLogs: FlightLogEntry[];
    isLoading: boolean;
    totalHours: number;
    soloHours: number;
    crossCountryHours: number;
    nightHours: number;
}

interface FlightLogActions {
    fetchFlightLogs: () => Promise<void>;
    addFlightLog: (entry: Omit<FlightLogEntry, 'id' | 'user_id' | 'created_at'> & { is_solo?: boolean; is_cross_country?: boolean }) => Promise<{ error: Error | null }>;
    updateFlightLog: (id: string, updates: Partial<FlightLogEntry>) => Promise<{ error: Error | null }>;
    deleteFlightLog: (id: string) => Promise<{ error: Error | null }>;
    calculateTotals: () => void;
}

type FlightLogStore = FlightLogState & FlightLogActions;

export const useFlightLogStore = create<FlightLogStore>((set, get) => ({
    flightLogs: [],
    isLoading: false,
    totalHours: 0,
    soloHours: 0,
    crossCountryHours: 0,
    nightHours: 0,

    fetchFlightLogs: async () => {
        set({ isLoading: true });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                set({ isLoading: false });
                return;
            }

            const { data, error } = await supabase
                .from(TABLES.FLIGHT_LOG)
                .select('*')
                .eq('user_id', session.user.id)
                .order('flight_date', { ascending: false });

            if (error) throw error;

            set({ flightLogs: data || [] });
            get().calculateTotals();
        } catch (error) {
            console.error('Error fetching flight logs:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addFlightLog: async (entry) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { error: new Error('Not authenticated') };
            }

            const { error } = await supabase
                .from(TABLES.FLIGHT_LOG)
                .insert({
                    user_id: session.user.id,
                    flight_date: entry.flight_date,
                    departure_airport: entry.departure_airport,
                    arrival_airport: entry.arrival_airport || entry.departure_airport,
                    duration_hours: entry.duration_hours,
                    instructor_name: entry.instructor_name,
                    aircraft_type: entry.aircraft_type,
                    aircraft_registration: (entry as any).aircraft_registration,
                    conditions: entry.conditions,
                    is_solo: entry.is_solo || false,
                    is_cross_country: entry.is_cross_country || false,
                    notes: entry.notes,
                });

            if (error) throw error;

            // Refresh the list
            await get().fetchFlightLogs();
            return { error: null };
        } catch (error) {
            console.error('Error adding flight log:', error);
            return { error: error as Error };
        }
    },

    updateFlightLog: async (id, updates) => {
        try {
            const { error } = await supabase
                .from(TABLES.FLIGHT_LOG)
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            await get().fetchFlightLogs();
            return { error: null };
        } catch (error) {
            console.error('Error updating flight log:', error);
            return { error: error as Error };
        }
    },

    deleteFlightLog: async (id) => {
        try {
            const { error } = await supabase
                .from(TABLES.FLIGHT_LOG)
                .delete()
                .eq('id', id);

            if (error) throw error;

            await get().fetchFlightLogs();
            return { error: null };
        } catch (error) {
            console.error('Error deleting flight log:', error);
            return { error: error as Error };
        }
    },

    calculateTotals: () => {
        const { flightLogs } = get();

        let totalHours = 0;
        let soloHours = 0;
        let crossCountryHours = 0;
        let nightHours = 0;

        flightLogs.forEach((log: any) => {
            const hours = parseFloat(String(log.duration_hours)) || 0;
            totalHours += hours;

            if (log.is_solo) soloHours += hours;
            if (log.is_cross_country) crossCountryHours += hours;
            if (log.conditions === 'night') nightHours += hours;
        });

        set({
            totalHours: Math.round(totalHours * 10) / 10,
            soloHours: Math.round(soloHours * 10) / 10,
            crossCountryHours: Math.round(crossCountryHours * 10) / 10,
            nightHours: Math.round(nightHours * 10) / 10,
        });
    },
}));
