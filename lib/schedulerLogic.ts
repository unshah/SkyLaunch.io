/**
 * Adaptive Scheduler Logic
 * 
 * Pure functions for performance-based scheduling decisions.
 * These functions use CFI grades and prerequisites to determine:
 * - Which tasks a student is eligible for
 * - Whether a task can be done solo or requires an instructor
 * - What maneuvers need reinforcement
 */

import type { GradeLevel, Endorsement } from '../types';

// Grade levels in order of proficiency
const GRADE_ORDER: GradeLevel[] = ['introduced', 'needs_work', 'satisfactory', 'proficient'];

/**
 * Check if a grade level meets or exceeds the required level
 */
export function gradeAtLeast(grade: GradeLevel, required: GradeLevel): boolean {
    return GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(required);
}

/**
 * Build a proficiency map from an array of maneuver grades.
 * For each maneuver, keeps only the most recent grade.
 * 
 * @param grades - Array of grade objects with maneuver code
 * @returns Map of maneuver code to latest grade level
 */
export function buildProficiencyMap(
    grades: Array<{ grade: GradeLevel; maneuver?: { code: string } | null }>
): Map<string, GradeLevel> {
    const proficiencyMap = new Map<string, GradeLevel>();

    // Grades should be sorted by graded_at descending, so first occurrence is latest
    for (const grade of grades) {
        const code = grade.maneuver?.code;
        if (code && !proficiencyMap.has(code)) {
            proficiencyMap.set(code, grade.grade);
        }
    }

    return proficiencyMap;
}

/**
 * Task-to-Maneuver mapping
 * Maps training task titles to their associated maneuver codes
 */
export const TASK_MANEUVER_MAP: Record<string, string[]> = {
    // Takeoffs & Landings
    'Takeoffs & Landings': [
        'normal_takeoff', 'normal_landing',
        'crosswind_takeoff', 'crosswind_landing',
        'soft_field_takeoff', 'soft_field_landing',
        'short_field_takeoff', 'short_field_landing',
        'go_around'
    ],

    // Slow Flight & Stalls
    'Slow Flight & Stalls': [
        'slow_flight', 'power_off_stalls', 'power_on_stalls', 'spin_awareness'
    ],

    // Ground Reference
    'Ground Reference Maneuvers': ['ground_reference'],

    // Performance
    'Basic Maneuvers': ['steep_turns'],

    // Emergency
    'Emergency Procedures': [
        'emergency_descent', 'emergency_approach', 'systems_malfunctions'
    ],

    // Navigation
    'Cross-Country Flight': [
        'xc_flight_planning', 'pilotage_ded_reckoning', 'nav_systems', 'diversion', 'lost_procedures'
    ],

    // Preflight
    'Pre-flight Procedures': [
        'certs_documents', 'weather_information', 'national_airspace'
    ],

    // Night
    'Night Flying': ['normal_takeoff', 'normal_landing'],

    // Instrument
    'Basic Instrument Flying': [],

    // Solo - requires all basic maneuvers
    'Solo Practice': [
        'steep_turns', 'slow_flight', 'power_off_stalls', 'power_on_stalls',
        'normal_takeoff', 'normal_landing', 'go_around'
    ],
};

/**
 * Task prerequisites mapping (mirrors trainingData.ts but by title for lookup)
 */
export const TASK_PREREQUISITES: Record<string, string[]> = {
    'Takeoffs & Landings': ['Pre-flight Procedures'],
    'Basic Maneuvers': ['Pre-flight Procedures'],
    'Slow Flight & Stalls': ['Basic Maneuvers'],
    'Ground Reference Maneuvers': ['Basic Maneuvers'],
    'Emergency Procedures': ['Basic Maneuvers'],
    'Night Flying': ['Takeoffs & Landings'],
    'Cross-Country Flight': ['Navigation & Flight Planning', 'Takeoffs & Landings'],
    'Solo Practice': ['Basic Maneuvers', 'Takeoffs & Landings'],
    'Basic Instrument Flying': ['Basic Maneuvers'],
    'Oral Exam Preparation': ['FAA Knowledge Test Prep'],
    'Checkride Preparation': ['Oral Exam Preparation'],
};

/**
 * Check if all prerequisites for a task are met.
 * A prerequisite is met when:
 * 1. The prerequisite task is in the completed set, OR
 * 2. All maneuvers for that prerequisite are graded at least 'satisfactory'
 * 
 * @param taskTitle - The task to check prerequisites for
 * @param completedTasks - Set of completed task titles
 * @param maneuverProficiency - Map of maneuver code to grade level
 * @returns true if all prerequisites are met
 */
export function checkPrerequisitesMet(
    taskTitle: string,
    completedTasks: Set<string>,
    maneuverProficiency: Map<string, GradeLevel>
): boolean {
    const prerequisites = TASK_PREREQUISITES[taskTitle];

    // No prerequisites = always eligible
    if (!prerequisites || prerequisites.length === 0) {
        return true;
    }

    return prerequisites.every(prereq => {
        // Check if task is completed
        if (completedTasks.has(prereq)) {
            return true;
        }

        // Check if maneuvers for prerequisite are proficient
        const prereqManeuvers = TASK_MANEUVER_MAP[prereq] || [];
        if (prereqManeuvers.length === 0) {
            // No maneuvers mapped, rely on task completion
            return completedTasks.has(prereq);
        }

        // All maneuvers must be at least satisfactory
        return prereqManeuvers.every(maneuverCode => {
            const grade = maneuverProficiency.get(maneuverCode);
            return grade && gradeAtLeast(grade, 'satisfactory');
        });
    });
}

/**
 * Determine if a task can be practiced solo or requires an instructor.
 * 
 * Solo eligibility requires:
 * 1. A valid (non-expired) solo endorsement
 * 2. All maneuvers for the task graded at least 'satisfactory'
 * 
 * @param taskTitle - The task to check
 * @param maneuverProficiency - Map of maneuver code to grade level
 * @param endorsements - Array of student's endorsements
 * @returns 'solo' if can practice alone, 'dual' if requires instructor
 */
export function determineLessonType(
    taskTitle: string,
    maneuverProficiency: Map<string, GradeLevel>,
    endorsements: Endorsement[]
): 'solo' | 'dual' {
    // Check for valid solo endorsement
    const now = new Date();
    const hasSoloEndorsement = endorsements.some(e => {
        if (e.type !== 'solo' && e.type !== 'pre_solo_flight') {
            return false;
        }
        // Check if not expired
        if (e.expires_at) {
            return new Date(e.expires_at) > now;
        }
        return true;
    });

    if (!hasSoloEndorsement) {
        return 'dual';
    }

    // Check if all maneuvers for this task are at least satisfactory
    const taskManeuvers = TASK_MANEUVER_MAP[taskTitle] || [];

    // Tasks without mapped maneuvers require instructor for safety
    if (taskManeuvers.length === 0) {
        return 'dual';
    }

    const allSatisfactory = taskManeuvers.every(maneuverCode => {
        const grade = maneuverProficiency.get(maneuverCode);
        return grade && gradeAtLeast(grade, 'satisfactory');
    });

    return allSatisfactory ? 'solo' : 'dual';
}

/**
 * Get maneuvers that need reinforcement (graded 'needs_work').
 * 
 * @param maneuverProficiency - Map of maneuver code to grade level
 * @returns Array of maneuver codes needing practice
 */
export function getReinforcementManeuvers(
    maneuverProficiency: Map<string, GradeLevel>
): string[] {
    const needsWork: string[] = [];

    for (const [code, grade] of maneuverProficiency) {
        if (grade === 'needs_work') {
            needsWork.push(code);
        }
    }

    return needsWork;
}

/**
 * Find tasks that contain maneuvers needing reinforcement.
 * 
 * @param reinforcementManeuvers - Array of maneuver codes needing work
 * @returns Array of task titles that address those maneuvers
 */
export function getTasksForReinforcement(
    reinforcementManeuvers: string[]
): string[] {
    const tasks: Set<string> = new Set();

    for (const [taskTitle, maneuvers] of Object.entries(TASK_MANEUVER_MAP)) {
        const hasReinforcementManeuver = maneuvers.some(m =>
            reinforcementManeuvers.includes(m)
        );
        if (hasReinforcementManeuver) {
            tasks.add(taskTitle);
        }
    }

    return Array.from(tasks);
}

/**
 * Sort tasks by priority, putting reinforcement tasks first.
 * 
 * @param tasks - Array of tasks to sort
 * @param reinforcementTaskTitles - Task titles that need reinforcement
 * @returns Sorted array with reinforcement tasks first
 */
export function prioritizeByReinforcement<T extends { title: string }>(
    tasks: T[],
    reinforcementTaskTitles: string[]
): T[] {
    const reinforcementSet = new Set(reinforcementTaskTitles);

    return [...tasks].sort((a, b) => {
        const aIsReinforcement = reinforcementSet.has(a.title) ? 0 : 1;
        const bIsReinforcement = reinforcementSet.has(b.title) ? 0 : 1;
        return aIsReinforcement - bIsReinforcement;
    });
}

/**
 * Generate a note for a scheduled lesson based on context.
 * 
 * @param taskTitle - The task being scheduled
 * @param lessonType - 'solo' or 'dual'
 * @param isReinforcement - Whether this is for reinforcement
 * @param reinforcementManeuvers - Maneuvers needing work (if reinforcement)
 * @returns A descriptive note for the schedule entry
 */
export function generateLessonNote(
    taskTitle: string,
    lessonType: 'solo' | 'dual',
    isReinforcement: boolean,
    reinforcementManeuvers: string[] = []
): string {
    const parts: string[] = [];

    if (lessonType === 'solo') {
        parts.push('✈️ Solo eligible');
    } else {
        parts.push('👨‍✈️ With instructor');
    }

    if (isReinforcement && reinforcementManeuvers.length > 0) {
        const maneuverNames = reinforcementManeuvers
            .slice(0, 3) // Limit to 3 for brevity
            .map(m => m.replace(/_/g, ' '))
            .join(', ');
        parts.push(`🔄 Re-practice: ${maneuverNames}`);
    }

    return parts.join(' • ');
}
