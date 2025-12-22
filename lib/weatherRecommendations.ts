import type { MetarData } from '../types';

// Typical student pilot crosswind limits by aircraft type
export const CROSSWIND_LIMITS = {
    'C172': 15, // Cessna 172 - 15 knots demonstrated
    'C152': 12, // Cessna 152 - 12 knots demonstrated
    'PA28': 17, // Piper Cherokee - 17 knots demonstrated
    'default': 10, // Conservative student limit
} as const;

interface TrainingRecommendation {
    type: 'fly' | 'ground' | 'caution' | 'no-go';
    title: string;
    message: string;
    emoji: string;
    activities: string[];
    color: string;
}

/**
 * Calculate crosswind component given wind and runway direction
 * @param windDir - Wind direction in degrees
 * @param windSpeed - Wind speed in knots
 * @param runwayHeading - Runway heading in degrees (e.g., 270 for runway 27)
 * @returns Crosswind component in knots
 */
export function calculateCrosswind(
    windDir: number,
    windSpeed: number,
    runwayHeading: number
): number {
    // Calculate the angle between wind and runway
    const angleDiff = Math.abs(windDir - runwayHeading);
    const angleRad = (Math.min(angleDiff, 360 - angleDiff) * Math.PI) / 180;

    // Crosswind = Wind Speed × sin(angle)
    return Math.abs(Math.round(windSpeed * Math.sin(angleRad)));
}

/**
 * Calculate headwind/tailwind component
 */
export function calculateHeadwind(
    windDir: number,
    windSpeed: number,
    runwayHeading: number
): number {
    const angleDiff = windDir - runwayHeading;
    const angleRad = (angleDiff * Math.PI) / 180;

    // Positive = headwind, Negative = tailwind
    return Math.round(windSpeed * Math.cos(angleRad));
}

/**
 * Check if crosswind is within student limits
 */
export function isCrosswindSafe(
    windDir: number,
    windSpeed: number,
    runwayHeading: number,
    aircraftType: keyof typeof CROSSWIND_LIMITS = 'default'
): { safe: boolean; crosswind: number; limit: number } {
    const crosswind = calculateCrosswind(windDir, windSpeed, runwayHeading);
    const limit = CROSSWIND_LIMITS[aircraftType] || CROSSWIND_LIMITS.default;

    return {
        safe: crosswind <= limit,
        crosswind,
        limit,
    };
}

/**
 * Get training recommendation based on current weather
 */
export function getTrainingRecommendation(
    weather: MetarData,
    runwayHeading: number = 0, // Default to any runway
    aircraftType: keyof typeof CROSSWIND_LIMITS = 'default'
): TrainingRecommendation {
    // Check flight category first
    if (weather.flight_category === 'LIFR') {
        return {
            type: 'no-go',
            title: 'Low IFR Conditions',
            message: 'Conditions are below VFR minimums. Stay on the ground today.',
            emoji: '🚫',
            activities: ['Chair fly procedures', 'Study weather theory', 'Review emergency procedures'],
            color: '#EF4444',
        };
    }

    if (weather.flight_category === 'IFR') {
        return {
            type: 'ground',
            title: 'IFR Conditions',
            message: 'Great day for ground school! Conditions are not suitable for VFR training.',
            emoji: '📚',
            activities: ['FAA Knowledge Test prep', 'Systems study', 'Weather briefing practice'],
            color: '#6B7280',
        };
    }

    // Check wind limits - default to 0 if null
    const windSpeed = weather.wind_gust_kt ?? weather.wind_speed_kt ?? 0;
    const windDir = weather.wind_dir_degrees ?? 0;
    const crosswindCheck = runwayHeading > 0
        ? isCrosswindSafe(windDir, windSpeed, runwayHeading, aircraftType)
        : { safe: windSpeed <= 15, crosswind: 0, limit: 15 };

    // High winds
    if (windSpeed > 25) {
        return {
            type: 'no-go',
            title: 'High Winds',
            message: `Winds ${windSpeed}kt are too strong for student training.`,
            emoji: '💨',
            activities: ['Ground reference maneuvers study', 'Crosswind landing videos', 'Simulator time'],
            color: '#EF4444',
        };
    }

    // Crosswind too high
    if (!crosswindCheck.safe) {
        return {
            type: 'caution',
            title: 'Crosswind Advisory',
            message: `Crosswind component ${crosswindCheck.crosswind}kt exceeds ${crosswindCheck.limit}kt limit for students.`,
            emoji: '⚠️',
            activities: ['Practice with instructor only', 'Choose alternate runway', 'Crosswind technique review'],
            color: '#F59E0B',
        };
    }

    // Marginal VFR
    if (weather.flight_category === 'MVFR') {
        return {
            type: 'caution',
            title: 'Marginal VFR',
            message: 'Flyable but limited visibility. Good for instructor with student, not solo.',
            emoji: '🌥️',
            activities: ['Pattern work only', 'Hood time', 'Slow flight in practice area'],
            color: '#F59E0B',
        };
    }

    // Moderate winds - good for training!
    if (windSpeed >= 8 && windSpeed <= 15) {
        return {
            type: 'fly',
            title: 'Great Training Day!',
            message: `Perfect conditions for crosswind practice. Winds ${windSpeed}kt.`,
            emoji: '🎯',
            activities: ['Crosswind landings', 'Ground reference maneuvers', 'Pattern work'],
            color: '#10B981',
        };
    }

    // Check for night conditions (rough estimate based on civil twilight)
    const hour = new Date().getHours();
    const isDarkish = hour < 6 || hour > 19;

    if (isDarkish && weather.flight_category === 'VFR') {
        return {
            type: 'fly',
            title: 'Night Flying Conditions',
            message: 'Clear and calm - perfect for night training!',
            emoji: '🌙',
            activities: ['Night landings', 'Night cross-country', 'City lights navigation'],
            color: '#6366F1',
        };
    }

    // Calm winds, clear skies - VFR
    return {
        type: 'fly',
        title: 'Perfect VFR Day!',
        message: 'Excellent conditions for flying. Get up there!',
        emoji: '☀️',
        activities: ['Solo pattern work', 'Cross-country', 'Maneuvers practice', 'First solo attempt'],
        color: '#10B981',
    };
}

/**
 * Get a quick one-liner recommendation
 */
export function getQuickRecommendation(weather: MetarData): string {
    const rec = getTrainingRecommendation(weather);
    return `${rec.emoji} ${rec.title}`;
}
