import { FlightLogEntry } from '../types';
import { PPL_REQUIREMENTS } from '../constants/trainingData';

/**
 * Calculate days since the last logged flight
 */
export function getDaysSinceLastFlight(flights: FlightLogEntry[]): number | null {
    if (flights.length === 0) return null;

    // Find most recent flight
    const sortedFlights = [...flights].sort(
        (a, b) => new Date(b.flight_date).getTime() - new Date(a.flight_date).getTime()
    );

    const lastFlightDate = new Date(sortedFlights[0].flight_date);
    const today = new Date();
    const diffTime = today.getTime() - lastFlightDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calculate average flights per week based on training history
 */
export function getAverageFlightsPerWeek(flights: FlightLogEntry[]): number {
    if (flights.length < 2) return flights.length;

    const sortedFlights = [...flights].sort(
        (a, b) => new Date(a.flight_date).getTime() - new Date(b.flight_date).getTime()
    );

    const firstFlight = new Date(sortedFlights[0].flight_date);
    const lastFlight = new Date(sortedFlights[sortedFlights.length - 1].flight_date);
    const weeksBetween = Math.max(1, (lastFlight.getTime() - firstFlight.getTime()) / (1000 * 60 * 60 * 24 * 7));

    return Math.round((flights.length / weeksBetween) * 10) / 10;
}

/**
 * Calculate average hours per week
 */
export function getAverageHoursPerWeek(flights: FlightLogEntry[]): number {
    if (flights.length < 2) {
        const totalHours = flights.reduce((sum, f) => sum + f.duration_hours, 0);
        return totalHours;
    }

    const sortedFlights = [...flights].sort(
        (a, b) => new Date(a.flight_date).getTime() - new Date(b.flight_date).getTime()
    );

    const firstFlight = new Date(sortedFlights[0].flight_date);
    const lastFlight = new Date(sortedFlights[sortedFlights.length - 1].flight_date);
    const weeksBetween = Math.max(1, (lastFlight.getTime() - firstFlight.getTime()) / (1000 * 60 * 60 * 24 * 7));

    const totalHours = flights.reduce((sum, f) => sum + f.duration_hours, 0);

    return Math.round((totalHours / weeksBetween) * 10) / 10;
}

/**
 * Estimate completion date based on current pace
 */
export function getEstimatedCompletionDate(
    currentHours: number,
    hoursPerWeek: number
): Date | null {
    if (hoursPerWeek <= 0) return null;

    const hoursRemaining = Math.max(0, PPL_REQUIREMENTS.totalHours - currentHours);
    const weeksRemaining = hoursRemaining / hoursPerWeek;

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + Math.ceil(weeksRemaining * 7));

    return completionDate;
}

export type PaceStatus = 'on-track' | 'at-risk' | 'behind' | 'no-data';

interface PaceResult {
    status: PaceStatus;
    message: string;
    emoji: string;
    color: string;
}

/**
 * Get training pace status with recommendations
 */
export function getPaceStatus(
    daysSinceLastFlight: number | null,
    hoursPerWeek: number,
    targetWeeklyHours: number = 2
): PaceResult {
    // No flight data
    if (daysSinceLastFlight === null) {
        return {
            status: 'no-data',
            message: 'Log your first flight to start tracking!',
            emoji: '✈️',
            color: '#6B7280',
        };
    }

    // Behind - haven't flown in a while
    if (daysSinceLastFlight >= 14) {
        return {
            status: 'behind',
            message: `${daysSinceLastFlight} days since last flight. Skills may be getting rusty!`,
            emoji: '⚠️',
            color: '#EF4444',
        };
    }

    // At risk - flight recency declining
    if (daysSinceLastFlight >= 7) {
        return {
            status: 'at-risk',
            message: `${daysSinceLastFlight} days since last flight. Try to fly soon!`,
            emoji: '⏰',
            color: '#F59E0B',
        };
    }

    // Check weekly pace
    if (hoursPerWeek < targetWeeklyHours * 0.5) {
        return {
            status: 'at-risk',
            message: `Averaging ${hoursPerWeek}h/week. Consider increasing to ${targetWeeklyHours}h/week.`,
            emoji: '📈',
            color: '#F59E0B',
        };
    }

    // On track!
    return {
        status: 'on-track',
        message: `Great pace! ${hoursPerWeek}h/week average.`,
        emoji: '🚀',
        color: '#10B981',
    };
}

/**
 * Format estimated completion date nicely
 */
export function formatCompletionDate(date: Date | null): string {
    if (!date) return 'Unable to estimate';

    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Any day now!';
    if (diffDays <= 7) return `About ${diffDays} days`;
    if (diffDays <= 30) return `About ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays <= 90) return `About ${Math.ceil(diffDays / 30)} months`;

    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
