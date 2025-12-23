// SkyLaunch TypeScript Types
// All types are designed around FAA PPL requirements

// User roles
export type UserRole = 'student' | 'cfi';

// User profile types
export interface UserProfile {
    id: string;
    full_name: string | null;
    role: UserRole;
    training_goal: TrainingGoal;
    weekly_hours: number;
    schedule_intensity: ScheduleIntensity;
    current_flight_hours: number;
    target_completion_date: string | null;
    home_airport: string | null; // ICAO code
    max_sessions_per_day: number; // Max training sessions per day (default 1)
    session_duration: number; // Hours per session (default 2)
    created_at: string;
}

export type TrainingGoal = 'private' | 'instrument' | 'commercial' | 'atp';
export type ScheduleIntensity = 'aggressive' | 'balanced' | 'relaxed';

// CFI Profile
export interface CFIProfile {
    id: string;
    user_id: string;
    certificate_number: string | null;
    certificate_expiry: string | null;
    ratings: string[]; // ['CFI', 'CFII', 'MEI']
    invite_code: string | null;
    created_at: string;
    updated_at: string;
}

// Student-CFI Link
export interface StudentCFILink {
    id: string;
    student_id: string;
    cfi_id: string;
    status: 'active' | 'inactive';
    linked_at: string;
    // Joined data
    student?: UserProfile;
    cfi?: CFIProfile;
}

// Maneuver (from catalog)
export interface Maneuver {
    id: string;
    code: string;
    name: string;
    category: ManeuverCategory;
    acs_reference: string | null;
    description: string | null;
    certification_level: TrainingGoal;
    display_order: number;
}

export type ManeuverCategory =
    | 'preflight'
    | 'takeoff_landing'
    | 'performance'
    | 'slow_flight_stalls'
    | 'navigation'
    | 'emergency';

// Maneuver Grade (CFI grading)
export interface ManeuverGrade {
    id: string;
    student_id: string;
    cfi_id: string;
    flight_log_id: string | null;
    maneuver_id: string;
    grade: GradeLevel;
    notes: string | null;
    graded_at: string;
    // Joined data
    maneuver?: Maneuver;
}

export type GradeLevel = 'introduced' | 'needs_work' | 'satisfactory' | 'proficient';

// Endorsement
export interface Endorsement {
    id: string;
    student_id: string;
    cfi_id: string;
    type: EndorsementType;
    text: string;
    signed_at: string;
    expires_at: string | null;
}

export type EndorsementType =
    | 'pre_solo_written'
    | 'pre_solo_flight'
    | 'solo'
    | 'solo_xc'
    | 'solo_xc_repeated'
    | 'knowledge_test'
    | 'practical_test';

// Training task types
export interface TrainingTask {
    id: string;
    category: TaskCategory;
    title: string;
    description: string | null;
    estimated_hours: number;
    prerequisites: string[]; // Task IDs
    certification_level: TrainingGoal;
    far_reference: string | null; // FAA regulation reference
}

export type TaskCategory = 'ground_school' | 'flight' | 'simulator' | 'exam';

// User's task progress
export interface UserTask {
    id: string;
    user_id: string;
    task_id: string;
    status: TaskStatus;
    scheduled_date: string | null;
    completed_date: string | null;
    notes: string | null;
    created_at: string;
    // Joined from training_tasks
    task?: TrainingTask;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Flight log entry
export interface FlightLogEntry {
    id: string;
    user_id: string;
    flight_date: string;
    departure_airport: string;
    arrival_airport: string;
    duration_hours: number;
    instructor_name: string | null;
    aircraft_type: string | null;
    conditions: FlightConditions;
    is_solo?: boolean;
    is_cross_country?: boolean;
    notes: string | null;
    created_at: string;
}

export type FlightConditions = 'vfr' | 'ifr' | 'night';

// Weather types (from AviationWeather.gov)
export interface MetarData {
    raw_text: string;
    station_id: string;
    observation_time: string;
    temp_c: number | null;
    dewpoint_c: number | null;
    wind_dir_degrees: number | null;
    wind_speed_kt: number | null;
    wind_gust_kt: number | null;
    visibility_statute_mi: number | null;
    altim_in_hg: number | null;
    flight_category: FlightCategory;
    sky_condition: SkyCondition[];
}

export type FlightCategory = 'VFR' | 'MVFR' | 'IFR' | 'LIFR';

export interface SkyCondition {
    sky_cover: 'CLR' | 'FEW' | 'SCT' | 'BKN' | 'OVC';
    cloud_base_ft_agl: number | null;
}

// Onboarding state
export interface OnboardingData {
    goal: TrainingGoal | null;
    weeklyHours: number;
    intensity: ScheduleIntensity;
    currentHours: number;
    homeAirport: string;
}

// Auth state
export interface AuthState {
    user: {
        id: string;
        email: string;
    } | null;
    profile: UserProfile | null;
    cfiProfile: CFIProfile | null;
    isLoading: boolean;
    isOnboarded: boolean;
}

// ==========================================
// SCHEDULING TYPES
// ==========================================

// Day of week: 0 = Sunday, 6 = Saturday
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface UserAvailability {
    id: string;
    user_id: string;
    day_of_week: DayOfWeek;
    start_time: string; // HH:MM format
    end_time: string;
    is_preferred: boolean;
    created_at: string;
    updated_at: string;
}

export interface CFIAvailability {
    id: string;
    cfi_id: string;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    max_students: number;
    created_at: string;
    updated_at: string;
}

export type ScheduleStatus =
    | 'scheduled'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'weather_hold'
    | 'rescheduled';

export type ActivityType = 'flight' | 'ground' | 'sim' | 'exam_prep';

export interface TrainingSchedule {
    id: string;
    user_id: string;
    cfi_id: string | null;

    // When
    scheduled_date: string;
    start_time: string;
    end_time: string;

    // What
    activity_type: ActivityType;
    task_id: string | null;
    task_title: string | null;

    // Status
    status: ScheduleStatus;

    // Weather
    weather_conditions: object | null;
    weather_suitable: boolean;

    // Booking
    aircraft_type: string | null;
    notes: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}

export interface ScheduleGenerationLog {
    id: string;
    user_id: string;
    generated_at: string;
    schedule_start: string;
    schedule_end: string;
    entries_created: number;
    generation_params: object;
    weather_data: object | null;
}

// Time slot helper for UI
export interface TimeSlot {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    isPreferred?: boolean;
}
