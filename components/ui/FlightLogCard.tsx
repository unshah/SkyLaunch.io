import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors';
import type { FlightConditions } from '../../types';

interface FlightLogCardProps {
    id: string;
    flightDate: string;
    departureAirport: string;
    arrivalAirport?: string;
    durationHours: number;
    instructorName?: string;
    aircraftType?: string;
    aircraftRegistration?: string;
    conditions: FlightConditions;
    isSolo?: boolean;
    isCrossCountry?: boolean;
    notes?: string;
    onPress?: () => void;
    onDelete?: () => void;
}

const CONDITIONS_CONFIG: Record<FlightConditions, { label: string; color: string }> = {
    vfr: { label: 'VFR', color: colors.success },
    ifr: { label: 'IFR', color: colors.warning },
    night: { label: 'Night', color: colors.secondary },
};

export function FlightLogCard({
    flightDate,
    departureAirport,
    arrivalAirport,
    durationHours,
    instructorName,
    aircraftType,
    aircraftRegistration,
    conditions,
    isSolo,
    isCrossCountry,
    notes,
    onPress,
    onDelete,
}: FlightLogCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const condConfig = CONDITIONS_CONFIG[conditions];
    const formattedDate = new Date(flightDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    // Check if this is a CFI graded flight (has graded maneuvers in notes)
    const isCFIGraded = notes?.includes('CFI Flight Training - Graded');

    const handlePress = () => {
        if (notes) {
            setIsExpanded(!isExpanded);
        }
        onPress?.();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.date}>{formattedDate}</Text>
                <Text style={styles.duration}>{durationHours.toFixed(1)}h</Text>
            </View>

            {/* Route */}
            <View style={styles.route}>
                <Text style={styles.airport}>{departureAirport}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.airport}>{arrivalAirport || departureAirport}</Text>
            </View>

            {/* Aircraft info */}
            {(aircraftType || aircraftRegistration) && (
                <Text style={styles.aircraft}>
                    {[aircraftType, aircraftRegistration].filter(Boolean).join(' • ')}
                </Text>
            )}

            {/* Badges */}
            <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: condConfig.color + '20' }]}>
                    <Text style={[styles.badgeText, { color: condConfig.color }]}>
                        {condConfig.label}
                    </Text>
                </View>

                {isSolo && (
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>Solo</Text>
                    </View>
                )}

                {isCrossCountry && (
                    <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.accent }]}>XC</Text>
                    </View>
                )}

                {isCFIGraded && (
                    <View style={[styles.badge, { backgroundColor: '#9333ea20' }]}>
                        <Text style={[styles.badgeText, { color: '#9333ea' }]}>👨‍✈️ CFI Graded</Text>
                    </View>
                )}
            </View>

            {/* Instructor */}
            {instructorName && (
                <Text style={styles.instructor}>Instructor: {instructorName}</Text>
            )}

            {/* Notes - Expandable */}
            {notes && (
                <View style={styles.notesContainer}>
                    <Text
                        style={[styles.notes, isExpanded && styles.notesExpanded]}
                        numberOfLines={isExpanded ? undefined : 2}
                    >
                        {notes}
                    </Text>
                    {notes.length > 80 && (
                        <Text style={styles.expandHint}>
                            {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
                        </Text>
                    )}
                </View>
            )}

            {/* Delete button */}
            {onDelete && (
                <TouchableOpacity style={styles.deleteBtn} onPress={(e) => { e.stopPropagation?.(); onDelete(); }}>
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    duration: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.secondary,
    },
    route: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    airport: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    arrow: {
        fontSize: 16,
        color: colors.textSecondary,
        marginHorizontal: 8,
    },
    aircraft: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 10,
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    instructor: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    notes: {
        fontSize: 13,
        color: colors.textTertiary,
        fontStyle: 'italic',
    },
    notesContainer: {
        marginTop: 8,
    },
    notesExpanded: {
        fontStyle: 'normal',
        color: colors.textSecondary,
        lineHeight: 20,
    },
    expandHint: {
        fontSize: 11,
        color: colors.secondary,
        marginTop: 4,
        fontWeight: '500',
    },
    deleteBtn: {
        marginTop: 12,
        alignSelf: 'flex-end',
    },
    deleteText: {
        fontSize: 13,
        color: colors.danger,
        fontWeight: '500',
    },
});
