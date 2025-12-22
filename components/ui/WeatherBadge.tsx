import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';
import type { FlightCategory } from '../../types';

interface WeatherBadgeProps {
    category: FlightCategory;
    size?: 'small' | 'medium' | 'large';
}

const CATEGORY_CONFIG: Record<FlightCategory, { color: string; label: string }> = {
    VFR: { color: colors.vfr, label: 'VFR' },
    MVFR: { color: colors.mvfr, label: 'MVFR' },
    IFR: { color: colors.ifr, label: 'IFR' },
    LIFR: { color: colors.lifr, label: 'LIFR' },
};

export function WeatherBadge({ category, size = 'medium' }: WeatherBadgeProps) {
    const config = CATEGORY_CONFIG[category];

    return (
        <View style={[
            styles.badge,
            styles[`${size}Size`],
            { backgroundColor: config.color },
        ]}>
            <Text style={[styles.label, styles[`${size}Text`]]}>
                {config.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: colors.textInverse,
        fontWeight: '700',
    },
    // Sizes
    smallSize: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    mediumSize: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    largeSize: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    smallText: {
        fontSize: 10,
    },
    mediumText: {
        fontSize: 12,
    },
    largeText: {
        fontSize: 14,
    },
});
