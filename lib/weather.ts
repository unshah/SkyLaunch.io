import type { MetarData, FlightCategory } from '../types';

const AVIATION_WEATHER_BASE_URL = 'https://aviationweather.gov/api/data/metar';

/**
 * Fetches METAR data for a given airport
 * @param stationId - ICAO airport code (e.g., 'KFFZ')
 * @returns MetarData object or null if fetch fails
 */
export async function fetchMetar(stationId: string): Promise<MetarData | null> {
    try {
        const url = `${AVIATION_WEATHER_BASE_URL}?ids=${stationId}&format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error('Weather API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            console.error('No METAR data found for station:', stationId);
            return null;
        }

        const metar = data[0];
        return parseMetarResponse(metar);
    } catch (error) {
        console.error('Error fetching METAR:', error);
        return null;
    }
}

/**
 * Parses raw METAR API response into our MetarData type
 */
function parseMetarResponse(raw: any): MetarData {
    return {
        raw_text: raw.rawOb || '',
        station_id: raw.icaoId || '',
        observation_time: raw.reportTime || '',
        temp_c: raw.temp ?? null,
        dewpoint_c: raw.dewp ?? null,
        wind_dir_degrees: raw.wdir ?? null,
        wind_speed_kt: raw.wspd ?? null,
        wind_gust_kt: raw.wgst ?? null,
        visibility_statute_mi: raw.visib ?? null,
        altim_in_hg: raw.altim ?? null,
        flight_category: determineFlightCategory(raw.visib, raw.clouds),
        sky_condition: parseSkyCondition(raw.clouds),
    };
}

/**
 * Determines flight category based on visibility and ceiling
 * FAA standards:
 * - VFR: Ceiling > 3000ft AND Visibility > 5sm
 * - MVFR: Ceiling 1000-3000ft OR Visibility 3-5sm
 * - IFR: Ceiling 500-1000ft OR Visibility 1-3sm
 * - LIFR: Ceiling < 500ft OR Visibility < 1sm
 */
function determineFlightCategory(visibility: number | null, clouds: any[]): FlightCategory {
    const ceiling = getCeiling(clouds);

    // Default to VFR if we can't determine
    if (visibility === null && ceiling === null) return 'VFR';

    const vis = visibility ?? 10;
    const ceil = ceiling ?? 10000;

    if (ceil < 500 || vis < 1) return 'LIFR';
    if (ceil < 1000 || vis < 3) return 'IFR';
    if (ceil < 3000 || vis < 5) return 'MVFR';
    return 'VFR';
}

/**
 * Gets the ceiling (lowest broken or overcast layer)
 */
function getCeiling(clouds: any[]): number | null {
    if (!clouds || clouds.length === 0) return null;

    for (const layer of clouds) {
        if (layer.cover === 'BKN' || layer.cover === 'OVC') {
            return layer.base ?? null;
        }
    }
    return null;
}

/**
 * Parses cloud layers into our SkyCondition type
 */
function parseSkyCondition(clouds: any[]) {
    if (!clouds || clouds.length === 0) {
        return [{ sky_cover: 'CLR' as const, cloud_base_ft_agl: null }];
    }

    return clouds.map((layer: any) => ({
        sky_cover: layer.cover || 'CLR',
        cloud_base_ft_agl: layer.base ?? null,
    }));
}

/**
 * Gets a human-readable weather summary
 */
export function getWeatherSummary(metar: MetarData): string {
    const parts: string[] = [];

    if (metar.wind_speed_kt !== null) {
        let wind = `Wind ${metar.wind_dir_degrees ?? 'Variable'}° at ${metar.wind_speed_kt}kt`;
        if (metar.wind_gust_kt) wind += ` gusting ${metar.wind_gust_kt}kt`;
        parts.push(wind);
    }

    if (metar.visibility_statute_mi !== null) {
        parts.push(`Visibility ${metar.visibility_statute_mi}SM`);
    }

    if (metar.temp_c !== null) {
        parts.push(`Temp ${metar.temp_c}°C`);
    }

    return parts.join(' • ');
}

/**
 * Determines if conditions are suitable for VFR flight training
 */
export function isSuitableForTraining(metar: MetarData): {
    suitable: boolean;
    reason: string;
} {
    if (metar.flight_category === 'LIFR') {
        return { suitable: false, reason: 'Low IFR conditions - not suitable for training' };
    }

    if (metar.flight_category === 'IFR') {
        return { suitable: false, reason: 'IFR conditions - requires instrument rating' };
    }

    if (metar.wind_gust_kt && metar.wind_gust_kt > 25) {
        return { suitable: false, reason: `Strong gusts (${metar.wind_gust_kt}kt) - not recommended for students` };
    }

    if (metar.wind_speed_kt && metar.wind_speed_kt > 20) {
        return { suitable: false, reason: `High winds (${metar.wind_speed_kt}kt) - challenging for students` };
    }

    if (metar.flight_category === 'MVFR') {
        return { suitable: true, reason: 'Marginal VFR - check with your instructor' };
    }

    return { suitable: true, reason: 'Good VFR conditions for training' };
}
