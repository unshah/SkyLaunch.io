import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, ProgressRing } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useCFIStore } from '../../stores/cfiStore';
import type { ManeuverGrade, FlightLogEntry } from '../../types';

// Maneuver category labels
const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
    preflight: { label: 'Preflight', emoji: '📋' },
    takeoff_landing: { label: 'Takeoffs & Landings', emoji: '🛫' },
    performance: { label: 'Performance', emoji: '🎯' },
    slow_flight_stalls: { label: 'Slow Flight & Stalls', emoji: '⚠️' },
    navigation: { label: 'Navigation', emoji: '🧭' },
    emergency: { label: 'Emergency', emoji: '🚨' },
};

// Grade colors
const GRADE_COLORS: Record<string, string> = {
    proficient: colors.success,
    satisfactory: colors.secondary,
    needs_work: colors.warning,
    introduced: colors.textSecondary,
};

export default function StudentDetailScreen() {
    const { studentId, studentName } = useLocalSearchParams<{ studentId: string; studentName: string }>();
    const router = useRouter();
    const { maneuvers, fetchManeuvers, getStudentGrades, getStudentFlights } = useCFIStore();

    const [grades, setGrades] = useState<ManeuverGrade[]>([]);
    const [flights, setFlights] = useState<FlightLogEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'progress' | 'maneuvers' | 'flights'>('progress');

    useEffect(() => {
        loadData();
    }, [studentId]);

    const loadData = async () => {
        if (!studentId) return;

        await fetchManeuvers();
        const studentGrades = await getStudentGrades(studentId);
        const studentFlights = await getStudentFlights(studentId);

        setGrades(studentGrades);
        setFlights(studentFlights);
    };

    // Get latest grade for each maneuver
    const getLatestGrade = (maneuverId: string): ManeuverGrade | undefined => {
        return grades.find(g => g.maneuver_id === maneuverId);
    };

    // Calculate progress stats
    const proficientCount = grades.filter(g => g.grade === 'proficient').length;
    const totalManeuvers = maneuvers.length;
    const progressPercent = totalManeuvers > 0 ? (proficientCount / totalManeuvers) * 100 : 0;

    // Group maneuvers by category
    const maneuversByCategory = maneuvers.reduce((acc, m) => {
        if (!acc[m.category]) acc[m.category] = [];
        acc[m.category].push(m);
        return acc;
    }, {} as Record<string, typeof maneuvers>);

    // Total flight hours
    const totalHours = flights.reduce((sum, f) => sum + f.duration_hours, 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{studentName || 'Student'}</Text>
                <Text style={styles.subtitle}>{totalHours.toFixed(1)} hours logged</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['progress', 'maneuvers', 'flights'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {activeTab === 'progress' && (
                    <>
                        {/* Overall Progress */}
                        <Card variant="elevated" style={styles.progressCard}>
                            <View style={styles.progressRow}>
                                <ProgressRing
                                    progress={progressPercent}
                                    size={100}
                                    strokeWidth={10}
                                    color={colors.success}
                                    label={`${Math.round(progressPercent)}%`}
                                    sublabel="checkride ready"
                                />
                                <View style={styles.progressInfo}>
                                    <Text style={styles.progressTitle}>Maneuver Proficiency</Text>
                                    <Text style={styles.progressText}>
                                        {proficientCount} of {totalManeuvers} maneuvers proficient
                                    </Text>
                                </View>
                            </View>
                        </Card>

                        {/* Needs Work */}
                        <Text style={styles.sectionTitle}>⚠️ Needs Work</Text>
                        {grades.filter(g => g.grade === 'needs_work').length === 0 ? (
                            <Card variant="outlined" style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No maneuvers flagged!</Text>
                            </Card>
                        ) : (
                            grades.filter(g => g.grade === 'needs_work').map(g => (
                                <Card key={g.id} variant="outlined" style={styles.gradeCard}>
                                    <Text style={styles.gradeName}>{g.maneuver?.name}</Text>
                                    <Text style={[styles.gradeLabel, { color: GRADE_COLORS.needs_work }]}>
                                        Needs Work
                                    </Text>
                                </Card>
                            ))
                        )}

                        {/* Recent Activity */}
                        <Text style={styles.sectionTitle}>📅 Recent Flights</Text>
                        {flights.slice(0, 3).map(f => (
                            <Card key={f.id} variant="outlined" style={styles.flightCard}>
                                <Text style={styles.flightDate}>
                                    {new Date(f.flight_date).toLocaleDateString()}
                                </Text>
                                <Text style={styles.flightRoute}>
                                    {f.departure_airport} → {f.arrival_airport || f.departure_airport}
                                </Text>
                                <Text style={styles.flightHours}>{f.duration_hours}h</Text>
                            </Card>
                        ))}
                    </>
                )}

                {activeTab === 'maneuvers' && (
                    <>
                        {Object.entries(maneuversByCategory).map(([category, categoryManeuvers]) => {
                            const label = CATEGORY_LABELS[category] || { label: category, emoji: '📝' };
                            return (
                                <View key={category} style={styles.categorySection}>
                                    <Text style={styles.categoryTitle}>
                                        {label.emoji} {label.label}
                                    </Text>
                                    {categoryManeuvers.map(m => {
                                        const grade = getLatestGrade(m.id);
                                        return (
                                            <Card key={m.id} variant="outlined" style={styles.maneuverCard}>
                                                <View style={styles.maneuverRow}>
                                                    <View style={styles.maneuverInfo}>
                                                        <Text style={styles.maneuverName}>{m.name}</Text>
                                                        {m.acs_reference && (
                                                            <Text style={styles.acsRef}>{m.acs_reference}</Text>
                                                        )}
                                                    </View>
                                                    <View style={[
                                                        styles.gradeBadge,
                                                        { backgroundColor: grade ? GRADE_COLORS[grade.grade] + '20' : colors.border }
                                                    ]}>
                                                        <Text style={[
                                                            styles.gradeBadgeText,
                                                            { color: grade ? GRADE_COLORS[grade.grade] : colors.textSecondary }
                                                        ]}>
                                                            {grade?.grade?.replace('_', ' ').toUpperCase() || 'NOT GRADED'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </Card>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </>
                )}

                {activeTab === 'flights' && (
                    <>
                        {flights.length === 0 ? (
                            <Card variant="outlined" style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No flights logged yet</Text>
                            </Card>
                        ) : (
                            flights.map(f => (
                                <Card key={f.id} variant="outlined" style={styles.flightDetailCard}>
                                    <View style={styles.flightHeader}>
                                        <Text style={styles.flightDate}>
                                            {new Date(f.flight_date).toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.flightHoursLarge}>{f.duration_hours}h</Text>
                                    </View>
                                    <Text style={styles.flightRouteLarge}>
                                        {f.departure_airport} → {f.arrival_airport || f.departure_airport}
                                    </Text>
                                    <View style={styles.flightTags}>
                                        {f.is_solo && <Text style={styles.tag}>Solo</Text>}
                                        {f.is_cross_country && <Text style={styles.tag}>XC</Text>}
                                        <Text style={styles.tag}>{f.conditions?.toUpperCase()}</Text>
                                    </View>
                                </Card>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            {/* Grade Flight Button */}
            <TouchableOpacity
                style={styles.gradeButton}
                onPress={() => router.push({
                    pathname: '/(cfi)/grade-flight',
                    params: { studentId, studentName }
                })}
            >
                <Text style={styles.gradeButtonText}>✏️ Grade Flight</Text>
            </TouchableOpacity>
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
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.secondary,
    },
    tabText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.secondary,
        fontWeight: '600',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    progressCard: {
        marginBottom: 24,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    progressInfo: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    progressText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        marginTop: 8,
    },
    emptyCard: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textSecondary,
    },
    gradeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    gradeName: {
        fontSize: 14,
        color: colors.text,
    },
    gradeLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    flightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    flightDate: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        width: 100,
    },
    flightRoute: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
    },
    flightHours: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.secondary,
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
        marginBottom: 8,
    },
    maneuverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    maneuverInfo: {
        flex: 1,
    },
    maneuverName: {
        fontSize: 14,
        color: colors.text,
    },
    acsRef: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    gradeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    gradeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    flightDetailCard: {
        marginBottom: 12,
    },
    flightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    flightHoursLarge: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.secondary,
    },
    flightRouteLarge: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 8,
    },
    flightTags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: colors.border,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 11,
        color: colors.textSecondary,
    },
    gradeButton: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        backgroundColor: colors.secondary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    gradeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
