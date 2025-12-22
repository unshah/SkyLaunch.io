import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { useCFIStore } from '../../stores/cfiStore';
import type { Maneuver, GradeLevel } from '../../types';

// Grade options
const GRADES: { value: GradeLevel; label: string; emoji: string; color: string }[] = [
    { value: 'proficient', label: 'Proficient', emoji: '✓', color: colors.success },
    { value: 'satisfactory', label: 'Satisfactory', emoji: '○', color: colors.secondary },
    { value: 'needs_work', label: 'Needs Work', emoji: '⚠', color: colors.warning },
    { value: 'introduced', label: 'Introduced', emoji: '📚', color: colors.textSecondary },
];

// Category labels
const CATEGORY_ORDER = ['takeoff_landing', 'performance', 'slow_flight_stalls', 'navigation', 'emergency'];
const CATEGORY_LABELS: Record<string, string> = {
    preflight: '📋 Preflight',
    takeoff_landing: '🛫 Takeoffs & Landings',
    performance: '🎯 Performance',
    slow_flight_stalls: '⚠️ Slow Flight & Stalls',
    navigation: '🧭 Navigation',
    emergency: '🚨 Emergency',
};

// Cross-platform alert
const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export default function GradeFlightScreen() {
    const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName: string }>();
    const router = useRouter();
    const { cfiProfile } = useAuthStore();
    const { maneuvers, fetchManeuvers, gradeManeuver } = useCFIStore();

    const [selectedGrades, setSelectedGrades] = useState<Record<string, GradeLevel>>({});
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [flightDate, setFlightDate] = useState(new Date().toISOString().split('T')[0]);
    const [flightDuration, setFlightDuration] = useState('1.2');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchManeuvers();
    }, []);

    const handleGradeSelect = (maneuverId: string, grade: GradeLevel) => {
        setSelectedGrades(prev => {
            if (prev[maneuverId] === grade) {
                // Deselect if already selected
                const { [maneuverId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [maneuverId]: grade };
        });
    };

    const handleSubmit = async () => {
        if (!cfiProfile || !studentId) {
            showAlert('Error', 'Missing required data');
            return;
        }

        const gradedManeuvers = Object.entries(selectedGrades);
        if (gradedManeuvers.length === 0) {
            showAlert('No Grades', 'Please grade at least one maneuver');
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit each grade
            for (const [maneuverId, grade] of gradedManeuvers) {
                const result = await gradeManeuver(
                    studentId,
                    cfiProfile.id,
                    maneuverId,
                    grade,
                    undefined,
                    notes[maneuverId]
                );

                if (result.error) {
                    throw result.error;
                }
            }

            showAlert('Success', `Graded ${gradedManeuvers.length} maneuvers for ${studentName}`);
            router.back();
        } catch (error) {
            console.error('Error submitting grades:', error);
            showAlert('Error', 'Failed to submit grades');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group maneuvers by category
    const maneuversByCategory = maneuvers.reduce((acc, m) => {
        if (!acc[m.category]) acc[m.category] = [];
        acc[m.category].push(m);
        return acc;
    }, {} as Record<string, Maneuver[]>);

    const gradedCount = Object.keys(selectedGrades).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>← Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Grade Flight</Text>
                <Text style={styles.subtitle}>Student: {studentName}</Text>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Flight Info */}
                <Card variant="outlined" style={styles.flightInfoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoField}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <TextInput
                                style={styles.infoInput}
                                value={flightDate}
                                onChangeText={setFlightDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>
                        <View style={styles.infoField}>
                            <Text style={styles.infoLabel}>Duration (hrs)</Text>
                            <TextInput
                                style={styles.infoInput}
                                value={flightDuration}
                                onChangeText={setFlightDuration}
                                keyboardType="decimal-pad"
                                placeholder="1.2"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>
                    </View>
                </Card>

                {/* Grade Legend */}
                <View style={styles.legend}>
                    {GRADES.map(g => (
                        <View key={g.value} style={styles.legendItem}>
                            <Text style={[styles.legendEmoji, { color: g.color }]}>{g.emoji}</Text>
                            <Text style={styles.legendLabel}>{g.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Maneuvers by Category */}
                {CATEGORY_ORDER.map(category => {
                    const categoryManeuvers = maneuversByCategory[category];
                    if (!categoryManeuvers?.length) return null;

                    return (
                        <View key={category} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>
                                {CATEGORY_LABELS[category] || category}
                            </Text>
                            {categoryManeuvers.map(maneuver => {
                                const selectedGrade = selectedGrades[maneuver.id];
                                return (
                                    <Card key={maneuver.id} variant="outlined" style={styles.maneuverCard}>
                                        <Text style={styles.maneuverName}>{maneuver.name}</Text>
                                        {maneuver.acs_reference && (
                                            <Text style={styles.acsRef}>{maneuver.acs_reference}</Text>
                                        )}
                                        <View style={styles.gradeButtons}>
                                            {GRADES.map(g => (
                                                <TouchableOpacity
                                                    key={g.value}
                                                    style={[
                                                        styles.gradeBtn,
                                                        selectedGrade === g.value && {
                                                            backgroundColor: g.color + '20',
                                                            borderColor: g.color,
                                                        }
                                                    ]}
                                                    onPress={() => handleGradeSelect(maneuver.id, g.value)}
                                                >
                                                    <Text style={[
                                                        styles.gradeBtnText,
                                                        selectedGrade === g.value && { color: g.color }
                                                    ]}>
                                                        {g.emoji}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </Card>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, gradedCount === 0 && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting || gradedCount === 0}
                >
                    <Text style={styles.submitBtnText}>
                        {isSubmitting ? 'Submitting...' : `Submit ${gradedCount} Grades`}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
        paddingBottom: 12,
    },
    backBtn: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    flightInfoCard: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    infoField: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    infoInput: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendEmoji: {
        fontSize: 16,
    },
    legendLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    maneuverCard: {
        marginBottom: 12,
    },
    maneuverName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    acsRef: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    gradeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    gradeBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    gradeBtnText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    submitBtn: {
        backgroundColor: colors.secondary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: colors.border,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
