import type { GradeLevel, Endorsement } from '../types';

const GRADE_ORDER: GradeLevel[] = ['introduced', 'needs_work', 'satisfactory', 'proficient'];

export function gradeAtLeast(grade: GradeLevel, required: GradeLevel): boolean {
    return GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(required);
}

export function buildProficiencyMap(
    grades: Array<{ grade: GradeLevel; maneuver?: { code: string } | null }>
): Map<string, GradeLevel> {
    const proficiencyMap = new Map<string, GradeLevel>();

    // Sort by date desc before calling this, or assume input is sorted
    for (const grade of grades) {
        const code = grade.maneuver?.code;
        if (code && !proficiencyMap.has(code)) {
            proficiencyMap.set(code, grade.grade);
        }
    }

    return proficiencyMap;
}

export const TASK_MANEUVER_MAP: Record<string, string[]> = {
    'Takeoffs & Landings': [
        'normal_takeoff', 'normal_landing',
        'crosswind_takeoff', 'crosswind_landing',
        'soft_field_takeoff', 'soft_field_landing',
        'short_field_takeoff', 'short_field_landing',
        'go_around'
    ],
    'Slow Flight & Stalls': [
        'slow_flight', 'power_off_stalls', 'power_on_stalls', 'spin_awareness'
    ],
    'Ground Reference Maneuvers': ['ground_reference'],
    'Basic Maneuvers': ['steep_turns'],
    'Emergency Procedures': [
        'emergency_descent', 'emergency_approach', 'systems_malfunctions'
    ],
    'Cross-Country Flight': [
        'xc_flight_planning', 'pilotage_ded_reckoning', 'nav_systems', 'diversion', 'lost_procedures'
    ],
    'Pre-flight Procedures': [
        'certs_documents', 'weather_information', 'national_airspace'
    ],
    'Night Flying': ['normal_takeoff', 'normal_landing'],
    'Basic Instrument Flying': [],
    'Solo Practice': [
        'steep_turns', 'slow_flight', 'power_off_stalls', 'power_on_stalls',
        'normal_takeoff', 'normal_landing', 'go_around'
    ],
};

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
    // Oral Exam requires written test + ALL flight training per FAR 61.103
    'Oral Exam Preparation': [
        'FAA Knowledge Test Prep',
        'Takeoffs & Landings',
        'Basic Maneuvers',
        'Slow Flight & Stalls',
        'Ground Reference Maneuvers',
        'Emergency Procedures',
        'Night Flying',
        'Cross-Country Flight',
        'Solo Practice',
        'Basic Instrument Flying',
    ],
    // Checkride requires oral prep (which transitively requires all flight training)
    'Checkride Preparation': ['Oral Exam Preparation'],
};

export function checkPrerequisitesMet(
    taskTitle: string,
    completedTasks: Set<string>,
    maneuverProficiency: Map<string, GradeLevel>
): boolean {
    const prerequisites = TASK_PREREQUISITES[taskTitle];

    if (!prerequisites || prerequisites.length === 0) {
        return true;
    }

    return prerequisites.every(prereq => {
        if (completedTasks.has(prereq)) {
            return true;
        }

        const prereqManeuvers = TASK_MANEUVER_MAP[prereq] || [];
        if (prereqManeuvers.length === 0) {
            return completedTasks.has(prereq);
        }

        return prereqManeuvers.every(maneuverCode => {
            const grade = maneuverProficiency.get(maneuverCode);
            return grade && gradeAtLeast(grade, 'satisfactory');
        });
    });
}

export function determineLessonType(
    taskTitle: string,
    maneuverProficiency: Map<string, GradeLevel>,
    endorsements: Endorsement[]
): 'solo' | 'dual' {
    const now = new Date();
    const hasSoloEndorsement = endorsements.some(e => {
        if (e.type !== 'solo' && e.type !== 'pre_solo_flight') {
            return false;
        }
        if (e.expires_at) {
            return new Date(e.expires_at) > now;
        }
        return true;
    });

    if (!hasSoloEndorsement) {
        return 'dual';
    }

    const taskManeuvers = TASK_MANEUVER_MAP[taskTitle] || [];

    if (taskManeuvers.length === 0) {
        return 'dual';
    }

    const allSatisfactory = taskManeuvers.every(maneuverCode => {
        const grade = maneuverProficiency.get(maneuverCode);
        return grade && gradeAtLeast(grade, 'satisfactory');
    });

    return allSatisfactory ? 'solo' : 'dual';
}

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
            .slice(0, 3)
            .map(m => m.replace(/_/g, ' '))
            .join(', ');
        parts.push(`🔄 Re-practice: ${maneuverNames}`);
    }

    return parts.join(' • ');
}