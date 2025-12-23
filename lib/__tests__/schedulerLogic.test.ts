/**
 * Unit Tests for Scheduler Logic
 * 
 * Tests the pure functions in schedulerLogic.ts for:
 * - Grade comparison
 * - Prerequisite checking
 * - Solo eligibility
 * - Reinforcement prioritization
 */

import {
    gradeAtLeast,
    buildProficiencyMap,
    checkPrerequisitesMet,
    determineLessonType,
    getReinforcementManeuvers,
    getTasksForReinforcement,
    prioritizeByReinforcement,
    generateLessonNote,
    TASK_MANEUVER_MAP,
    TASK_PREREQUISITES,
} from '../schedulerLogic';

import type { GradeLevel, Endorsement, ManeuverGrade } from '../../types';

// ============================================
// gradeAtLeast Tests
// ============================================
describe('gradeAtLeast', () => {
    it('should return true when grade equals required', () => {
        expect(gradeAtLeast('satisfactory', 'satisfactory')).toBe(true);
        expect(gradeAtLeast('proficient', 'proficient')).toBe(true);
    });

    it('should return true when grade exceeds required', () => {
        expect(gradeAtLeast('proficient', 'satisfactory')).toBe(true);
        expect(gradeAtLeast('satisfactory', 'needs_work')).toBe(true);
        expect(gradeAtLeast('proficient', 'introduced')).toBe(true);
    });

    it('should return false when grade is below required', () => {
        expect(gradeAtLeast('introduced', 'satisfactory')).toBe(false);
        expect(gradeAtLeast('needs_work', 'proficient')).toBe(false);
        expect(gradeAtLeast('satisfactory', 'proficient')).toBe(false);
    });
});

// ============================================
// buildProficiencyMap Tests
// ============================================
describe('buildProficiencyMap', () => {
    it('should build a map from grades array', () => {
        const grades = [
            { id: '1', student_id: 's1', cfi_id: 'c1', maneuver_id: 'm1', flight_log_id: null, grade: 'satisfactory' as GradeLevel, graded_at: '2024-01-02', notes: null, maneuver: { code: 'steep_turns', name: 'Steep Turns' } },
            { id: '2', student_id: 's1', cfi_id: 'c1', maneuver_id: 'm2', flight_log_id: null, grade: 'needs_work' as GradeLevel, graded_at: '2024-01-01', notes: null, maneuver: { code: 'short_field_landing', name: 'Short Field Landing' } },
        ];

        const map = buildProficiencyMap(grades);

        expect(map.get('steep_turns')).toBe('satisfactory');
        expect(map.get('short_field_landing')).toBe('needs_work');
        expect(map.size).toBe(2);
    });

    it('should keep only the first (most recent) grade for each maneuver', () => {
        const grades = [
            { id: '1', student_id: 's1', cfi_id: 'c1', maneuver_id: 'm1', flight_log_id: null, grade: 'proficient' as GradeLevel, graded_at: '2024-01-03', notes: null, maneuver: { code: 'steep_turns', name: 'Steep Turns' } },
            { id: '2', student_id: 's1', cfi_id: 'c1', maneuver_id: 'm1', flight_log_id: null, grade: 'needs_work' as GradeLevel, graded_at: '2024-01-01', notes: null, maneuver: { code: 'steep_turns', name: 'Steep Turns' } },
        ];

        const map = buildProficiencyMap(grades);

        // Should have the first (most recent) grade
        expect(map.get('steep_turns')).toBe('proficient');
        expect(map.size).toBe(1);
    });

    it('should handle empty array', () => {
        const map = buildProficiencyMap([]);
        expect(map.size).toBe(0);
    });
});

// ============================================
// checkPrerequisitesMet Tests
// ============================================
describe('checkPrerequisitesMet', () => {
    it('should return true for tasks with no prerequisites', () => {
        const completedTasks = new Set<string>();
        const proficiency = new Map<string, GradeLevel>();

        expect(checkPrerequisitesMet('Pre-flight Procedures', completedTasks, proficiency)).toBe(true);
        expect(checkPrerequisitesMet('Aerodynamics & Principles of Flight', completedTasks, proficiency)).toBe(true);
    });

    it('should return true when prerequisite task is completed', () => {
        const completedTasks = new Set(['Pre-flight Procedures']);
        const proficiency = new Map<string, GradeLevel>();

        expect(checkPrerequisitesMet('Takeoffs & Landings', completedTasks, proficiency)).toBe(true);
    });

    it('should return true when prerequisite maneuvers are satisfactory', () => {
        const completedTasks = new Set<string>();
        const proficiency = new Map<string, GradeLevel>([
            ['certs_documents', 'satisfactory'],
            ['weather_information', 'proficient'],
            ['national_airspace', 'satisfactory'],
        ]);

        // Takeoffs & Landings requires Pre-flight Procedures
        // Pre-flight maps to: certs_documents, weather_information, national_airspace
        expect(checkPrerequisitesMet('Takeoffs & Landings', completedTasks, proficiency)).toBe(true);
    });

    it('should return false when prerequisite maneuvers are not satisfactory', () => {
        const completedTasks = new Set<string>();
        const proficiency = new Map<string, GradeLevel>([
            ['certs_documents', 'needs_work'], // Not satisfactory
            ['weather_information', 'proficient'],
            ['national_airspace', 'satisfactory'],
        ]);

        expect(checkPrerequisitesMet('Takeoffs & Landings', completedTasks, proficiency)).toBe(false);
    });

    it('should return false when prerequisite not completed and no grades', () => {
        const completedTasks = new Set<string>();
        const proficiency = new Map<string, GradeLevel>();

        expect(checkPrerequisitesMet('Slow Flight & Stalls', completedTasks, proficiency)).toBe(false);
    });

    it('should handle multiple prerequisites', () => {
        const completedTasks = new Set(['Navigation & Flight Planning']);
        const proficiency = new Map<string, GradeLevel>([
            ['normal_takeoff', 'proficient'],
            ['normal_landing', 'proficient'],
            ['crosswind_takeoff', 'satisfactory'],
            ['crosswind_landing', 'satisfactory'],
            ['soft_field_takeoff', 'satisfactory'],
            ['soft_field_landing', 'satisfactory'],
            ['short_field_takeoff', 'satisfactory'],
            ['short_field_landing', 'satisfactory'],
            ['go_around', 'satisfactory'],
        ]);

        // Cross-Country requires: Navigation & Flight Planning, Takeoffs & Landings
        expect(checkPrerequisitesMet('Cross-Country Flight', completedTasks, proficiency)).toBe(true);
    });
});

// ============================================
// determineLessonType Tests
// ============================================
describe('determineLessonType', () => {
    const validSoloEndorsement: Endorsement = {
        id: 'e1',
        student_id: 's1',
        cfi_id: 'c1',
        type: 'solo',
        text: 'Solo endorsement',
        signed_at: '2024-01-01',
        expires_at: '2025-12-31', // Valid future date
    };

    const expiredEndorsement: Endorsement = {
        id: 'e2',
        student_id: 's1',
        cfi_id: 'c1',
        type: 'solo',
        text: 'Expired endorsement',
        signed_at: '2023-01-01',
        expires_at: '2023-06-01', // Expired
    };

    it('should return dual when no solo endorsement', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'proficient'],
        ]);

        expect(determineLessonType('Basic Maneuvers', proficiency, [])).toBe('dual');
    });

    it('should return dual when solo endorsement is expired', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'proficient'],
        ]);

        expect(determineLessonType('Basic Maneuvers', proficiency, [expiredEndorsement])).toBe('dual');
    });

    it('should return dual when maneuvers are not satisfactory', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'needs_work'],
        ]);

        expect(determineLessonType('Basic Maneuvers', proficiency, [validSoloEndorsement])).toBe('dual');
    });

    it('should return solo when endorsed and maneuvers are satisfactory', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'satisfactory'],
        ]);

        expect(determineLessonType('Basic Maneuvers', proficiency, [validSoloEndorsement])).toBe('solo');
    });

    it('should return solo when endorsed and maneuvers are proficient', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'proficient'],
        ]);

        expect(determineLessonType('Basic Maneuvers', proficiency, [validSoloEndorsement])).toBe('solo');
    });

    it('should return dual for tasks with no mapped maneuvers', () => {
        const proficiency = new Map<string, GradeLevel>();

        // Basic Instrument Flying has empty maneuver list
        expect(determineLessonType('Basic Instrument Flying', proficiency, [validSoloEndorsement])).toBe('dual');
    });

    it('should check all maneuvers for a task', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['slow_flight', 'satisfactory'],
            ['power_off_stalls', 'satisfactory'],
            ['power_on_stalls', 'needs_work'], // One is not satisfactory
            ['spin_awareness', 'satisfactory'],
        ]);

        expect(determineLessonType('Slow Flight & Stalls', proficiency, [validSoloEndorsement])).toBe('dual');
    });
});

// ============================================
// getReinforcementManeuvers Tests
// ============================================
describe('getReinforcementManeuvers', () => {
    it('should return maneuvers with needs_work grade', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'proficient'],
            ['short_field_landing', 'needs_work'],
            ['crosswind_landing', 'needs_work'],
            ['slow_flight', 'satisfactory'],
        ]);

        const result = getReinforcementManeuvers(proficiency);

        expect(result).toContain('short_field_landing');
        expect(result).toContain('crosswind_landing');
        expect(result).not.toContain('steep_turns');
        expect(result).not.toContain('slow_flight');
        expect(result.length).toBe(2);
    });

    it('should return empty array when no needs_work grades', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'proficient'],
            ['slow_flight', 'satisfactory'],
        ]);

        expect(getReinforcementManeuvers(proficiency)).toEqual([]);
    });
});

// ============================================
// getTasksForReinforcement Tests
// ============================================
describe('getTasksForReinforcement', () => {
    it('should return tasks containing reinforcement maneuvers', () => {
        const reinforcementManeuvers = ['short_field_landing', 'steep_turns'];

        const tasks = getTasksForReinforcement(reinforcementManeuvers);

        expect(tasks).toContain('Takeoffs & Landings'); // Has short_field_landing
        expect(tasks).toContain('Basic Maneuvers'); // Has steep_turns
    });

    it('should not duplicate tasks', () => {
        // Both are in Takeoffs & Landings
        const reinforcementManeuvers = ['short_field_landing', 'crosswind_landing'];

        const tasks = getTasksForReinforcement(reinforcementManeuvers);

        const takeoffCount = tasks.filter(t => t === 'Takeoffs & Landings').length;
        expect(takeoffCount).toBe(1);
    });

    it('should return empty array for no reinforcement maneuvers', () => {
        expect(getTasksForReinforcement([])).toEqual([]);
    });
});

// ============================================
// prioritizeByReinforcement Tests
// ============================================
describe('prioritizeByReinforcement', () => {
    it('should put reinforcement tasks first', () => {
        const tasks = [
            { title: 'Cross-Country Flight', id: '1' },
            { title: 'Takeoffs & Landings', id: '2' },
            { title: 'Basic Maneuvers', id: '3' },
        ];
        const reinforcementTitles = ['Takeoffs & Landings'];

        const sorted = prioritizeByReinforcement(tasks, reinforcementTitles);

        expect(sorted[0].title).toBe('Takeoffs & Landings');
    });

    it('should maintain relative order for non-reinforcement tasks', () => {
        const tasks = [
            { title: 'A', id: '1' },
            { title: 'B', id: '2' },
            { title: 'C', id: '3' },
        ];
        const reinforcementTitles: string[] = [];

        const sorted = prioritizeByReinforcement(tasks, reinforcementTitles);

        expect(sorted.map(t => t.title)).toEqual(['A', 'B', 'C']);
    });

    it('should not mutate original array', () => {
        const tasks = [
            { title: 'A', id: '1' },
            { title: 'B', id: '2' },
        ];
        const reinforcementTitles = ['B'];

        prioritizeByReinforcement(tasks, reinforcementTitles);

        expect(tasks[0].title).toBe('A');
    });
});

// ============================================
// generateLessonNote Tests
// ============================================
describe('generateLessonNote', () => {
    it('should include solo indicator for solo lessons', () => {
        const note = generateLessonNote('Basic Maneuvers', 'solo', false);
        expect(note).toContain('Solo eligible');
    });

    it('should include instructor indicator for dual lessons', () => {
        const note = generateLessonNote('Basic Maneuvers', 'dual', false);
        expect(note).toContain('With instructor');
    });

    it('should include reinforcement info when applicable', () => {
        const note = generateLessonNote(
            'Takeoffs & Landings',
            'dual',
            true,
            ['short_field_landing', 'crosswind_landing']
        );
        expect(note).toContain('Re-practice');
        expect(note).toContain('short field landing');
    });

    it('should limit reinforcement maneuvers to 3', () => {
        const note = generateLessonNote(
            'Takeoffs & Landings',
            'dual',
            true,
            ['one', 'two', 'three', 'four', 'five']
        );
        // Should only show first 3
        expect(note).toContain('one');
        expect(note).toContain('two');
        expect(note).toContain('three');
        expect(note).not.toContain('four');
    });
});

// ============================================
// Integration-style Tests
// ============================================
describe('Scheduling Scenario Tests', () => {
    const validEndorsement: Endorsement = {
        id: 'e1',
        student_id: 's1',
        cfi_id: 'c1',
        type: 'solo',
        text: 'Solo',
        signed_at: '2024-01-01',
        expires_at: '2025-12-31',
    };

    it('Scenario: Student proficient in steep turns, needs work on landings', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['steep_turns', 'proficient'],
            ['normal_takeoff', 'satisfactory'],
            ['normal_landing', 'satisfactory'],
            ['short_field_landing', 'needs_work'],
            ['short_field_takeoff', 'needs_work'],
        ]);

        // Check what needs reinforcement
        const reinforcement = getReinforcementManeuvers(proficiency);
        expect(reinforcement).toContain('short_field_landing');
        expect(reinforcement).toContain('short_field_takeoff');

        // Basic Maneuvers can be solo (steep_turns is proficient)
        expect(determineLessonType('Basic Maneuvers', proficiency, [validEndorsement])).toBe('solo');

        // Takeoffs & Landings needs instructor (short_field not satisfactory)
        expect(determineLessonType('Takeoffs & Landings', proficiency, [validEndorsement])).toBe('dual');
    });

    it('Scenario: All takeoff/landing maneuvers satisfactory = solo eligible', () => {
        const proficiency = new Map<string, GradeLevel>([
            ['normal_takeoff', 'satisfactory'],
            ['normal_landing', 'proficient'],
            ['crosswind_takeoff', 'satisfactory'],
            ['crosswind_landing', 'satisfactory'],
            ['soft_field_takeoff', 'satisfactory'],
            ['soft_field_landing', 'satisfactory'],
            ['short_field_takeoff', 'satisfactory'],
            ['short_field_landing', 'satisfactory'],
            ['go_around', 'proficient'],
        ]);

        expect(determineLessonType('Takeoffs & Landings', proficiency, [validEndorsement])).toBe('solo');
    });
});
