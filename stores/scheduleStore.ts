import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
    UserAvailability,
    CFIAvailability,
    TrainingSchedule,
    DayOfWeek,
    TimeSlot,
    ActivityType,
    Endorsement,
    GradeLevel,
} from '../types';
import {
    buildProficiencyMap,
    checkPrerequisitesMet,
    determineLessonType,
    getReinforcementManeuvers,
    getTasksForReinforcement,
    prioritizeByReinforcement,
    generateLessonNote,
    TASK_MANEUVER_MAP,
} from '../lib/schedulerLogic';

interface ScheduleStore {
    // State
    userAvailability: UserAvailability[];
    cfiAvailability: CFIAvailability[];
    schedule: TrainingSchedule[];
    isLoading: boolean;
    error: string | null;

    // Availability Actions
    fetchUserAvailability: () => Promise<void>;
    saveUserAvailability: (slots: TimeSlot[]) => Promise<{ error: Error | null }>;
    fetchCFIAvailability: () => Promise<void>;
    saveCFIAvailability: (slots: TimeSlot[]) => Promise<{ error: Error | null }>;

    // Schedule Actions
    fetchSchedule: (startDate: string, endDate: string) => Promise<void>;
    generateSchedule: (startDate?: Date) => Promise<{ error: Error | null; entriesCreated: number }>;
    updateScheduleStatus: (id: string, status: TrainingSchedule['status']) => Promise<{ error: Error | null }>;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
    userAvailability: [],
    cfiAvailability: [],
    schedule: [],
    isLoading: false,
    error: null,

    fetchUserAvailability: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('user_availability')
                .select('*')
                .eq('user_id', session.user.id)
                .order('day_of_week', { ascending: true });

            if (error) throw error;
            set({ userAvailability: data as UserAvailability[] });
        } catch (error) {
            console.error('Error fetching user availability:', error);
        }
    },

    saveUserAvailability: async (slots: TimeSlot[]) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return { error: new Error('Not authenticated') };

            // Delete existing availability
            await supabase
                .from('user_availability')
                .delete()
                .eq('user_id', session.user.id);

            // Insert new slots
            if (slots.length > 0) {
                const rows = slots.map(slot => ({
                    user_id: session.user.id,
                    day_of_week: slot.dayOfWeek,
                    start_time: slot.startTime,
                    end_time: slot.endTime,
                    is_preferred: slot.isPreferred || false,
                }));

                const { error } = await supabase
                    .from('user_availability')
                    .insert(rows);

                if (error) throw error;
            }

            await get().fetchUserAvailability();
            return { error: null };
        } catch (error) {
            console.error('Error saving availability:', error);
            return { error: error as Error };
        }
    },

    fetchCFIAvailability: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Get CFI profile ID
            const { data: cfiProfile } = await supabase
                .from('cfi_profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

            if (!cfiProfile) return;

            const { data, error } = await supabase
                .from('cfi_availability')
                .select('*')
                .eq('cfi_id', cfiProfile.id)
                .order('day_of_week', { ascending: true });

            if (error) throw error;
            set({ cfiAvailability: data as CFIAvailability[] });
        } catch (error) {
            console.error('Error fetching CFI availability:', error);
        }
    },

    saveCFIAvailability: async (slots: TimeSlot[]) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return { error: new Error('Not authenticated') };

            // Get CFI profile ID
            const { data: cfiProfile, error: profileError } = await supabase
                .from('cfi_profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

            console.log('CFI save availability - profile:', cfiProfile, 'error:', profileError);

            if (!cfiProfile) return { error: new Error('CFI profile not found. Please ensure you have a CFI profile.') };

            // Delete existing availability
            const { error: deleteError } = await supabase
                .from('cfi_availability')
                .delete()
                .eq('cfi_id', cfiProfile.id);

            if (deleteError) {
                console.error('Error deleting CFI availability:', deleteError);
                // If table doesn't exist, provide helpful message
                if (deleteError.message?.includes('does not exist') || deleteError.code === '42P01') {
                    return { error: new Error('Database not set up. Please run supabase_schema_scheduling.sql in Supabase SQL Editor.') };
                }
            }

            // Insert new slots
            if (slots.length > 0) {
                const rows = slots.map(slot => ({
                    cfi_id: cfiProfile.id,
                    day_of_week: slot.dayOfWeek,
                    start_time: slot.startTime,
                    end_time: slot.endTime,
                    max_students: 1,
                }));

                console.log('Inserting CFI availability rows:', rows);

                const { error } = await supabase
                    .from('cfi_availability')
                    .insert(rows);

                if (error) {
                    console.error('Error inserting CFI availability:', error);
                    throw error;
                }
            }

            await get().fetchCFIAvailability();
            return { error: null };
        } catch (error: any) {
            console.error('Error saving CFI availability:', error);
            return { error: error as Error };
        }
    },

    fetchSchedule: async (startDate: string, endDate: string) => {
        set({ isLoading: true });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('training_schedule')
                .select('*')
                .eq('user_id', session.user.id)
                .gte('scheduled_date', startDate)
                .lte('scheduled_date', endDate)
                .order('scheduled_date', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;
            set({ schedule: data as TrainingSchedule[] });
        } catch (error) {
            console.error('Error fetching schedule:', error);
            set({ error: (error as Error).message });
        } finally {
            set({ isLoading: false });
        }
    },

    generateSchedule: async (startDate?: Date) => {
        set({ isLoading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return { error: new Error('Not authenticated'), entriesCreated: 0 };

            // 1. Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (!profile) return { error: new Error('Profile not found'), entriesCreated: 0 };

            // 2. Get user availability
            const { data: availability } = await supabase
                .from('user_availability')
                .select('*')
                .eq('user_id', session.user.id);

            if (!availability || availability.length === 0) {
                return { error: new Error('Please set your availability first'), entriesCreated: 0 };
            }

            // 3. Fetch current weather (as baseline for near-term scheduling)
            let currentWeather = null;
            let isGoodFlyingWeather = true;

            if (profile.home_airport) {
                try {
                    // Dynamic import to avoid circular dependencies
                    const { fetchMetar, isSuitableForTraining } = await import('../lib/weather');
                    currentWeather = await fetchMetar(profile.home_airport);
                    if (currentWeather) {
                        const suitability = isSuitableForTraining(currentWeather);
                        isGoodFlyingWeather = suitability.suitable;
                    }
                } catch (weatherError) {
                    console.log('Weather fetch failed, defaulting to good weather assumption');
                }
            }

            // 4. Get training tasks - separate flight and ground tasks
            const { data: allTasks, error: tasksError } = await supabase
                .from('training_tasks')
                .select('*')
                .order('created_at', { ascending: true });

            console.log('Schedule generation - tasks fetched:', allTasks?.length || 0, 'error:', tasksError);

            // Get user's completed tasks to know what needs refresher
            const { data: userTasks } = await supabase
                .from('user_tasks')
                .select('task_id, status, completed_at')
                .eq('user_id', session.user.id);

            const completedTaskIds = new Set(
                (userTasks || [])
                    .filter(t => t.status === 'completed')
                    .map(t => t.task_id)
            );

            // Build completed task titles for prerequisite checking
            const completedTaskTitles = new Set(
                (allTasks || [])
                    .filter(t => completedTaskIds.has(t.id))
                    .map(t => t.title)
            );

            // 4b. Fetch maneuver grades for adaptive scheduling
            const { data: grades } = await supabase
                .from('maneuver_grades')
                .select('*, maneuver:maneuver_id (code, name)')
                .eq('student_id', session.user.id)
                .order('graded_at', { ascending: false });

            const maneuverProficiency = buildProficiencyMap(grades || []);
            console.log('Schedule generation - proficiency map size:', maneuverProficiency.size);

            // 4c. Fetch endorsements for solo eligibility
            const { data: endorsements } = await supabase
                .from('endorsements')
                .select('*')
                .eq('student_id', session.user.id);

            const studentEndorsements: Endorsement[] = endorsements || [];

            // 4d. Get reinforcement needs
            const reinforcementManeuvers = getReinforcementManeuvers(maneuverProficiency);
            const reinforcementTaskTitles = getTasksForReinforcement(reinforcementManeuvers);
            console.log('Schedule generation - reinforcement tasks:', reinforcementTaskTitles);

            // Separate tasks by type and filter by prerequisites
            const allFlightTasks = (allTasks || []).filter(t =>
                t.category === 'flight' || t.category === 'simulator'
            );
            const allGroundTasks = (allTasks || []).filter(t =>
                t.category === 'ground_school' || t.category === 'exam'
            );

            // Filter flight tasks by prerequisites
            const eligibleFlightTasks = allFlightTasks.filter(t =>
                checkPrerequisitesMet(t.title, completedTaskTitles, maneuverProficiency)
            );

            // Prioritize reinforcement tasks
            const flightTasks = prioritizeByReinforcement(eligibleFlightTasks, reinforcementTaskTitles);
            const groundTasks = allGroundTasks;

            console.log('Schedule generation - eligible flight tasks:', flightTasks.length, 'of', allFlightTasks.length);

            // Map flight topics to related ground prep
            const groundPrepForFlight: Record<string, string[]> = {
                'Pre-flight Procedures': ['Aircraft Systems', 'Airport Operations'],
                'Takeoffs & Landings': ['Aerodynamics & Principles of Flight', 'Airport Operations'],
                'Basic Maneuvers': ['Aerodynamics & Principles of Flight'],
                'Slow Flight & Stalls': ['Aerodynamics & Principles of Flight'],
                'Ground Reference Maneuvers': ['Navigation & Flight Planning'],
                'Emergency Procedures': ['Aircraft Systems', 'Aeromedical Factors'],
                'Night Flying': ['Aeromedical Factors', 'Airport Operations'],
                'Cross-Country Flight': ['Navigation & Flight Planning', 'Weather Theory & Reports', 'Federal Aviation Regulations'],
                'Solo Practice': ['Federal Aviation Regulations', 'Airspace & ATC Procedures'],
                'Basic Instrument Flying': ['Weather Theory & Reports'],
            };

            // Track which ground topics are scheduled for refresher
            const scheduledGroundRefreshers = new Set<string>();

            // 5. Generate 1 month of weather-aware schedule with ground prep
            const scheduleEntries: Partial<TrainingSchedule>[] = [];

            // Calculate start date - default to next Monday
            const getNextMonday = () => {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
                const nextMonday = new Date(today);
                nextMonday.setDate(today.getDate() + daysUntilMonday);
                nextMonday.setHours(0, 0, 0, 0);
                return nextMonday;
            };

            const scheduleStartDate = startDate || getNextMonday();
            const oneMonthLater = new Date(scheduleStartDate);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            let currentDate = new Date(scheduleStartDate);
            let flightTaskIndex = 0;
            let groundTaskIndex = 0;
            let weeklyHoursUsed = 0;
            const maxWeeklyHours = profile.weekly_hours || 10;

            // Day names for notes
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // Helper to find ground prep task by title
            const findGroundTask = (title: string) =>
                groundTasks.find(t => t.title === title);

            // Simulate weather patterns (in production, use 7-day forecast API)
            const getSimulatedWeatherSuitability = (date: Date): boolean => {
                // Use current real weather for next 3 days, then simulate
                const daysFromStart = Math.floor((date.getTime() - scheduleStartDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysFromStart <= 2 && currentWeather) {
                    // Use real weather for near-term
                    return isGoodFlyingWeather;
                }

                // Simulate: ~70% of days are good VFR
                // Use date as seed for consistent results
                const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
                const pseudoRandom = (dayOfYear * 13 + date.getFullYear()) % 10;
                return pseudoRandom < 7; // 70% chance of good weather
            };

            while (currentDate <= oneMonthLater) {
                const dayOfWeek = currentDate.getDay();
                const dateStr = currentDate.toISOString().split('T')[0];

                // Reset weekly hours on Sunday
                if (dayOfWeek === 0) {
                    weeklyHoursUsed = 0;
                }

                // Check if we have tasks left
                const hasFlightTasks = flightTaskIndex < flightTasks.length;
                const hasGroundTasks = groundTaskIndex < groundTasks.length;

                if (!hasFlightTasks && !hasGroundTasks) break;

                // Find availability for this day
                const daySlots = availability.filter(a => a.day_of_week === dayOfWeek);

                // Check weather suitability for this date
                const weatherSuitable = getSimulatedWeatherSuitability(currentDate);

                // Limit sessions per day (default 1 for flights to avoid fatigue)
                const maxSessionsPerDay = profile.max_sessions_per_day || 1;
                const sessionDuration = profile.session_duration || 2;
                let dailySessionCount = 0;

                for (const slot of daySlots) {
                    if (weeklyHoursUsed >= maxWeeklyHours) break;
                    if (dailySessionCount >= maxSessionsPerDay) break;
                    if (flightTaskIndex >= flightTasks.length && groundTaskIndex >= groundTasks.length) break;

                    let task: typeof flightTasks[number] | typeof groundTasks[number] | undefined;
                    let activityType: ActivityType;
                    let notes: string | null = null;
                    const dayName = dayNames[dayOfWeek];

                    if (weatherSuitable && flightTaskIndex < flightTasks.length) {
                        // Good weather → schedule flight training
                        task = flightTasks[flightTaskIndex];
                        activityType = task.category === 'simulator' ? 'sim' : 'flight';

                        // Determine if this can be solo or requires instructor
                        const lessonType = determineLessonType(task.title, maneuverProficiency, studentEndorsements);
                        const isReinforcement = reinforcementTaskTitles.includes(task.title);
                        const taskReinforcementManeuvers = isReinforcement
                            ? reinforcementManeuvers.filter(m => (TASK_MANEUVER_MAP[task.title] || []).includes(m))
                            : [];

                        notes = generateLessonNote(task.title, lessonType, isReinforcement, taskReinforcementManeuvers);
                        if (weatherSuitable) {
                            notes = `☀️ ${dayName}: ${notes}`;
                        }

                        flightTaskIndex++;
                    } else if (!weatherSuitable && groundTaskIndex < groundTasks.length) {
                        // Bad weather → schedule ground school
                        task = groundTasks[groundTaskIndex];
                        activityType = task.category === 'exam' ? 'exam_prep' : 'ground';

                        // Check if this is prep for an upcoming flight
                        if (flightTaskIndex < flightTasks.length) {
                            const upcomingFlight = flightTasks[flightTaskIndex];
                            const neededPrep = groundPrepForFlight[upcomingFlight.title] || [];
                            if (neededPrep.includes(task.title)) {
                                notes = `🌧️ ${dayName}: Weather not ideal for flying - perfect for ground prep before "${upcomingFlight.title}"`;
                            } else {
                                notes = `🌧️ ${dayName}: Weather not ideal for flying - scheduled ground school`;
                            }
                        } else {
                            notes = `🌧️ ${dayName}: Weather not ideal - scheduled ground school`;
                        }
                        groundTaskIndex++;
                    } else if (groundTaskIndex < groundTasks.length) {
                        // Fallback to ground school
                        task = groundTasks[groundTaskIndex];
                        activityType = task.category === 'exam' ? 'exam_prep' : 'ground';
                        notes = `📚 ${dayName}: Ground school to complete curriculum`;
                        groundTaskIndex++;
                    } else if (flightTaskIndex < flightTasks.length) {
                        // Only flight tasks left, schedule with weather warning
                        task = flightTasks[flightTaskIndex];
                        activityType = task.category === 'simulator' ? 'sim' : 'flight';

                        const lessonType = determineLessonType(task.title, maneuverProficiency, studentEndorsements);
                        const isReinforcement = reinforcementTaskTitles.includes(task.title);

                        if (!weatherSuitable) {
                            notes = `⚠️ ${dayName}: Weather marginal - verify forecast • ${lessonType === 'solo' ? '✈️ Solo eligible' : '👨‍✈️ With instructor'}`;
                        } else {
                            notes = generateLessonNote(task.title, lessonType, isReinforcement, []);
                        }
                        flightTaskIndex++;
                    } else {
                        continue;
                    }

                    scheduleEntries.push({
                        user_id: session.user.id,
                        scheduled_date: dateStr,
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        activity_type: activityType,
                        task_id: task.id,
                        task_title: task.title,
                        status: (weatherSuitable || activityType !== 'flight') ? 'scheduled' : 'weather_hold',
                        weather_suitable: weatherSuitable || activityType !== 'flight',
                        weather_conditions: currentWeather ? {
                            flight_category: currentWeather.flight_category,
                            visibility: currentWeather.visibility_statute_mi,
                            wind: currentWeather.wind_speed_kt,
                        } : null,
                        notes,
                    });

                    weeklyHoursUsed += sessionDuration;
                    dailySessionCount++;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            // 6. Clear old future schedule and insert new
            const startDateStr = scheduleStartDate.toISOString().split('T')[0];
            await supabase
                .from('training_schedule')
                .delete()
                .eq('user_id', session.user.id)
                .gte('scheduled_date', startDateStr)
                .in('status', ['scheduled', 'weather_hold']);

            if (scheduleEntries.length > 0) {
                const { error } = await supabase
                    .from('training_schedule')
                    .insert(scheduleEntries);

                if (error) throw error;
            }

            // 7. Log generation with weather data
            await supabase
                .from('schedule_generation_log')
                .insert({
                    user_id: session.user.id,
                    schedule_start: startDateStr,
                    schedule_end: oneMonthLater.toISOString().split('T')[0],
                    entries_created: scheduleEntries.length,
                    generation_params: {
                        weekly_hours: profile.weekly_hours,
                        schedule_intensity: profile.schedule_intensity,
                        home_airport: profile.home_airport,
                    },
                    weather_data: currentWeather ? {
                        station_id: currentWeather.station_id,
                        flight_category: currentWeather.flight_category,
                        observation_time: currentWeather.observation_time,
                    } : null,
                });

            // Refresh schedule
            await get().fetchSchedule(
                startDateStr,
                oneMonthLater.toISOString().split('T')[0]
            );

            return { error: null, entriesCreated: scheduleEntries.length };
        } catch (error) {
            console.error('Error generating schedule:', error);
            set({ error: (error as Error).message });
            return { error: error as Error, entriesCreated: 0 };
        } finally {
            set({ isLoading: false });
        }
    },

    updateScheduleStatus: async (id: string, status: TrainingSchedule['status']) => {
        try {
            const updates: Partial<TrainingSchedule> = { status };
            if (status === 'completed') {
                updates.completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('training_schedule')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // Update local state
            set(state => ({
                schedule: state.schedule.map(s =>
                    s.id === id ? { ...s, ...updates } : s
                )
            }));

            return { error: null };
        } catch (error) {
            console.error('Error updating schedule status:', error);
            return { error: error as Error };
        }
    },
}));
