/**
 * Airport Data Module
 * Fetches airport and runway information from AirportDB (free API)
 * Based on OurAirports data
 */

interface Runway {
    le_ident: string; // e.g., "09" or "27"
    he_ident: string; // e.g., "27" or "09"
    le_heading_degT: number; // True heading of low-end
    he_heading_degT: number; // True heading of high-end
    length_ft: number;
    width_ft: number;
    surface: string;
    lighted: boolean;
    closed: boolean;
}

interface AirportData {
    icao_code: string;
    name: string;
    latitude_deg: number;
    longitude_deg: number;
    elevation_ft: number;
    runways: Runway[];
}

interface AirportDBResponse {
    icao: string;
    iata: string;
    name: string;
    city: string;
    country: string;
    elevation_ft: string;
    latitude_deg: string;
    longitude_deg: string;
    runways: {
        le_ident: string;
        he_ident: string;
        le_heading_degT: string;
        he_heading_degT: string;
        length_ft: string;
        width_ft: string;
        surface: string;
        lighted: string;
        closed: string;
    }[];
}

// Cache for airport data to reduce API calls
const airportCache: Map<string, { data: AirportData; timestamp: number }> = new Map();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch airport data including runway information
 * Uses AirportDB free API (based on OurAirports)
 */
export async function fetchAirportData(icaoCode: string): Promise<AirportData | null> {
    const normalizedCode = icaoCode.toUpperCase().trim();

    if (!normalizedCode || normalizedCode.length < 3) {
        console.warn('Invalid ICAO code:', icaoCode);
        return null;
    }

    // Check cache first
    const cached = airportCache.get(normalizedCode);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.data;
    }

    try {
        // AirportDB API endpoint with token from environment
        const AIRPORT_DB_TOKEN = process.env.EXPO_PUBLIC_AIRPORT_DB_TOKEN;
        if (!AIRPORT_DB_TOKEN) {
            console.warn('AirportDB token not configured. Runway data will be unavailable.');
            return null;
        }
        console.log('Calling AirportDB API for:', normalizedCode);
        const response = await fetch(
            `https://airportdb.io/api/v1/airport/${normalizedCode}?apiToken=${AIRPORT_DB_TOKEN}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        console.log('API response status:', response.status);
        if (!response.ok) {
            console.warn(`Airport API error: ${normalizedCode}, status: ${response.status}`);
            return null;
        }

        const data: AirportDBResponse = await response.json();
        console.log('Airport data received:', data?.icao, 'runways:', data?.runways?.length || 0);

        // Transform to our format
        const airportData: AirportData = {
            icao_code: data.icao,
            name: data.name,
            latitude_deg: parseFloat(data.latitude_deg) || 0,
            longitude_deg: parseFloat(data.longitude_deg) || 0,
            elevation_ft: parseFloat(data.elevation_ft) || 0,
            runways: (data.runways || []).map(rwy => ({
                le_ident: rwy.le_ident,
                he_ident: rwy.he_ident,
                le_heading_degT: parseFloat(rwy.le_heading_degT) || 0,
                he_heading_degT: parseFloat(rwy.he_heading_degT) || 0,
                length_ft: parseFloat(rwy.length_ft) || 0,
                width_ft: parseFloat(rwy.width_ft) || 0,
                surface: rwy.surface,
                lighted: rwy.lighted === '1' || rwy.lighted === 'true',
                closed: rwy.closed === '1' || rwy.closed === 'true',
            })),
        };

        // Cache the result
        airportCache.set(normalizedCode, { data: airportData, timestamp: Date.now() });

        return airportData;
    } catch (error) {
        console.error('Error fetching airport data:', error);
        return null;
    }
}

/**
 * Get all runway headings for an airport
 * Returns an array of heading pairs [low_end, high_end]
 */
export async function getRunwayHeadings(icaoCode: string): Promise<number[]> {
    console.log('Fetching runway headings for:', icaoCode);
    const airport = await fetchAirportData(icaoCode);

    if (!airport || !airport.runways.length) {
        console.log('No airport/runway data for:', icaoCode);
        return [];
    }

    console.log('Found', airport.runways.length, 'runways');
    const headings: number[] = [];

    for (const runway of airport.runways) {
        if (runway.closed) continue; // Skip closed runways

        // Try true headings first, fallback to runway ident
        if (runway.le_heading_degT > 0) {
            headings.push(runway.le_heading_degT);
        } else if (runway.le_ident) {
            const h = parseInt(runway.le_ident.replace(/[LCR]/g, ''), 10) * 10;
            if (!isNaN(h) && h > 0) headings.push(h);
        }
        if (runway.he_heading_degT > 0) {
            headings.push(runway.he_heading_degT);
        } else if (runway.he_ident) {
            const h = parseInt(runway.he_ident.replace(/[LCR]/g, ''), 10) * 10;
            if (!isNaN(h) && h > 0) headings.push(h);
        }
    }

    const unique = [...new Set(headings)];
    console.log('Runway headings:', unique);
    return unique;
}

/**
 * Get the primary (longest) runway heading for an airport
 */
export async function getPrimaryRunwayHeading(icaoCode: string): Promise<number | null> {
    const airport = await fetchAirportData(icaoCode);

    if (!airport || !airport.runways.length) {
        return null;
    }

    // Find the longest runway that's not closed
    const openRunways = airport.runways.filter(r => !r.closed);
    if (openRunways.length === 0) return null;

    const longestRunway = openRunways.reduce((longest, current) =>
        current.length_ft > longest.length_ft ? current : longest
    );

    // Return the low-end heading (could also return both)
    return longestRunway.le_heading_degT || longestRunway.he_heading_degT || null;
}

/**
 * Get the best runway for current wind conditions
 * Returns the runway with the lowest crosswind component
 */
export function getBestRunwayForWind(
    runwayHeadings: number[],
    windDirection: number,
    windSpeed: number
): { heading: number; crosswind: number } | null {
    if (!runwayHeadings.length) return null;

    let bestRunway = { heading: runwayHeadings[0], crosswind: Infinity };

    for (const heading of runwayHeadings) {
        const angleDiff = Math.abs(windDirection - heading);
        const angleRad = (Math.min(angleDiff, 360 - angleDiff) * Math.PI) / 180;
        const crosswind = Math.abs(Math.round(windSpeed * Math.sin(angleRad)));

        if (crosswind < bestRunway.crosswind) {
            bestRunway = { heading, crosswind };
        }
    }

    return bestRunway;
}

export type { AirportData, Runway };
