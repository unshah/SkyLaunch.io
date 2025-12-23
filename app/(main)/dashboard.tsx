import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, ProgressRing, WeatherBadge } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { useFlightLogStore } from '../../stores/flightLogStore';
import { useTaskStore } from '../../stores/taskStore';
import { useStudentLinkStore } from '../../stores/studentLinkStore';
import { fetchMetar, getWeatherSummary, isSuitableForTraining } from '../../lib/weather';
import { getTrainingRecommendation } from '../../lib/weatherRecommendations';
import { getRunwayHeadings, getBestRunwayForWind } from '../../lib/airport';
import {
    getDaysSinceLastFlight,
    getAverageHoursPerWeek,
    getEstimatedCompletionDate,
    getPaceStatus,
    formatCompletionDate
} from '../../lib/paceCalculator';
import { TRAINING_TASKS, CATEGORY_LABELS } from '../../constants/trainingData';
import type { MetarData, TaskCategory } from '../../types';

export default function DashboardScreen() {
    const { profile } = useAuthStore();
    const { totalHours, soloHours, crossCountryHours, nightHours, flightLogs, fetchFlightLogs } = useFlightLogStore();
    const { taskStatusByTitle, fetchUserTasks, getTaskStatus } = useTaskStore();
    const { linkedCFI, fetchLinkedCFI, linkWithCFI, isLoading: isLinking } = useStudentLinkStore();
    const [weather, setWeather] = useState<MetarData | null>(null);
    const [runwayHeadings, setRunwayHeadings] = useState<number[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [cfiCode, setCfiCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);

    const loadWeather = async () => {
        if (profile?.home_airport) {
            const data = await fetchMetar(profile.home_airport);
            setWeather(data);

            // Also fetch runway data for crosswind calculation
            const headings = await getRunwayHeadings(profile.home_airport);
            setRunwayHeadings(headings);
        }
    };

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchFlightLogs();
            fetchUserTasks();
            fetchLinkedCFI();
            loadWeather();
        }, [profile?.home_airport])
    );

    useEffect(() => {
        loadWeather();
    }, [profile?.home_airport]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadWeather(),
            fetchFlightLogs(),
            fetchUserTasks(),
        ]);
        setRefreshing(false);
    };

    // Calculate progress using real flight hours from store
    const currentHours = totalHours || 0;
    const targetHours = 40;
    const progress = Math.min(100, (currentHours / targetHours) * 100);

    // Pace tracking
    const daysSinceLastFlight = getDaysSinceLastFlight(flightLogs);
    const hoursPerWeek = getAverageHoursPerWeek(flightLogs);
    const estimatedCompletion = getEstimatedCompletionDate(currentHours, hoursPerWeek);
    const paceStatus = getPaceStatus(daysSinceLastFlight, hoursPerWeek, profile?.weekly_hours || 2);

    // Weather recommendation with runway data for accurate crosswind
    const bestRunway = weather && runwayHeadings.length > 0
        ? getBestRunwayForWind(
            runwayHeadings,
            weather.wind_dir_degrees || 0,
            weather.wind_gust_kt ?? weather.wind_speed_kt ?? 0
        )
        : null;
    const weatherRecommendation = weather
        ? getTrainingRecommendation(weather, bestRunway?.heading || 0)
        : null;

    // Get incomplete tasks for "Today's Focus" - filter out completed ones
    const incompleteTasks = TRAINING_TASKS.filter(
        task => getTaskStatus(task.title) !== 'completed'
    ).slice(0, 3);

    // Calculate completed tasks count
    const completedTasksCount = Object.values(taskStatusByTitle).filter(s => s === 'completed').length;

    // Weather suitability
    const suitability = weather ? isSuitableForTraining(weather) : null;

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greeting}! ✈️</Text>
                        <Text style={styles.subtitle}>Ready to fly today?</Text>
                    </View>
                </View>

                {/* CFI Link Card */}
                <Card variant="outlined" style={styles.cfiCard}>
                    {linkedCFI ? (
                        <View style={styles.cfiLinked}>
                            <Text style={styles.cfiLinkedEmoji}>👨‍✈️</Text>
                            <View>
                                <Text style={styles.cfiLinkedLabel}>Your Instructor</Text>
                                <Text style={styles.cfiLinkedName}>{linkedCFI.name}</Text>
                            </View>
                        </View>
                    ) : showCodeInput ? (
                        <View>
                            <Text style={styles.cfiInputLabel}>Enter CFI Invite Code</Text>
                            <View style={styles.cfiInputRow}>
                                <TextInput
                                    style={styles.cfiInput}
                                    placeholder="ABC123"
                                    placeholderTextColor={colors.textTertiary}
                                    value={cfiCode}
                                    onChangeText={setCfiCode}
                                    autoCapitalize="characters"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={styles.cfiLinkBtn}
                                    onPress={async () => {
                                        const result = await linkWithCFI(cfiCode);
                                        if (result.success) {
                                            setShowCodeInput(false);
                                            setCfiCode('');
                                        } else {
                                            Platform.OS === 'web'
                                                ? window.alert(result.error || 'Failed to link')
                                                : Alert.alert('Error', result.error || 'Failed to link');
                                        }
                                    }}
                                    disabled={isLinking || cfiCode.length < 4}
                                >
                                    <Text style={styles.cfiLinkBtnText}>
                                        {isLinking ? '...' : 'Link'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.cfiPrompt}
                            onPress={() => setShowCodeInput(true)}
                        >
                            <Text style={styles.cfiPromptEmoji}>🔗</Text>
                            <View style={styles.cfiPromptText}>
                                <Text style={styles.cfiPromptTitle}>Link with your CFI</Text>
                                <Text style={styles.cfiPromptSub}>Enter their invite code to get graded</Text>
                            </View>
                            <Text style={styles.cfiPromptArrow}>→</Text>
                        </TouchableOpacity>
                    )}
                </Card>

                {/* Pace Card - NEW */}
                <Card variant="elevated" style={[styles.paceCard, { borderLeftColor: paceStatus.color }]}>
                    <View style={styles.paceHeader}>
                        <Text style={styles.paceEmoji}>{paceStatus.emoji}</Text>
                        <View style={styles.paceInfo}>
                            <Text style={[styles.paceStatus, { color: paceStatus.color }]}>
                                {paceStatus.status === 'on-track' ? 'On Track' :
                                    paceStatus.status === 'at-risk' ? 'At Risk' :
                                        paceStatus.status === 'behind' ? 'Falling Behind' : 'Get Started'}
                            </Text>
                            <Text style={styles.paceMessage}>{paceStatus.message}</Text>
                        </View>
                    </View>
                    {estimatedCompletion && (
                        <View style={styles.etaRow}>
                            <Text style={styles.etaLabel}>Estimated PPL completion:</Text>
                            <Text style={styles.etaValue}>{formatCompletionDate(estimatedCompletion)}</Text>
                        </View>
                    )}
                </Card>

                {/* Weather Recommendation Card - NEW */}
                {weatherRecommendation && (
                    <Card variant="elevated" style={[styles.recommendationCard, { borderLeftColor: weatherRecommendation.color }]}>
                        <View style={styles.recHeader}>
                            <Text style={styles.recEmoji}>{weatherRecommendation.emoji}</Text>
                            <View style={styles.recInfo}>
                                <Text style={[styles.recTitle, { color: weatherRecommendation.color }]}>
                                    {weatherRecommendation.title}
                                </Text>
                                <Text style={styles.recMessage}>{weatherRecommendation.message}</Text>
                            </View>
                        </View>
                        <View style={styles.activitiesRow}>
                            <Text style={styles.activitiesLabel}>Suggested activities:</Text>
                            {weatherRecommendation.activities.slice(0, 2).map((activity, i) => (
                                <Text key={i} style={styles.activityItem}>• {activity}</Text>
                            ))}
                        </View>
                        {/* Runway Info for Transparency */}
                        {bestRunway && weather && (
                            <View style={styles.runwayInfo}>
                                <Text style={styles.runwayLabel}>
                                    🛬 Using Runway {Math.round(bestRunway.heading / 10).toString().padStart(2, '0')}
                                </Text>
                                <Text style={styles.runwayCrosswind}>
                                    Crosswind: {bestRunway.crosswind}kt
                                </Text>
                            </View>
                        )}
                        {!bestRunway && profile?.home_airport && runwayHeadings.length === 0 && (
                            <View style={styles.runwayInfo}>
                                <Text style={styles.runwayLabel}>
                                    🛬 Loading runway data for {profile.home_airport}...
                                </Text>
                            </View>
                        )}
                        {!bestRunway && !profile?.home_airport && (
                            <View style={styles.runwayInfo}>
                                <Text style={styles.runwayLabel}>
                                    📍 Set home airport for runway data
                                </Text>
                            </View>
                        )}
                    </Card>
                )}

                {/* Weather Card */}
                {profile?.home_airport && (
                    <Card variant="elevated" style={styles.weatherCard}>
                        <View style={styles.weatherHeader}>
                            <Text style={styles.weatherTitle}>
                                Weather at {profile.home_airport}
                            </Text>
                            {weather && <WeatherBadge category={weather.flight_category} />}
                        </View>
                        {weather ? (
                            <>
                                <Text style={styles.weatherSummary}>
                                    {getWeatherSummary(weather)}
                                </Text>
                                <View style={[
                                    styles.suitability,
                                    { backgroundColor: suitability?.suitable ? colors.success + '15' : colors.danger + '15' }
                                ]}>
                                    <Text style={[
                                        styles.suitabilityText,
                                        { color: suitability?.suitable ? colors.success : colors.danger }
                                    ]}>
                                        {suitability?.suitable ? '✓ ' : '✗ '}{suitability?.reason}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.weatherLoading}>Loading weather data...</Text>
                        )}
                    </Card>
                )}

                {/* Progress Card */}
                <Card variant="elevated" style={styles.progressCard}>
                    <View style={styles.progressContent}>
                        <ProgressRing
                            progress={progress}
                            size={100}
                            strokeWidth={8}
                            label={`${currentHours}`}
                            sublabel="hours"
                        />
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressTitle}>Flight Hours</Text>
                            <Text style={styles.progressDesc}>
                                {currentHours} of {targetHours} hours completed
                            </Text>
                            <Text style={styles.progressNote}>
                                {completedTasksCount}/{TRAINING_TASKS.length} tasks completed
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Today's Focus - shows incomplete tasks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Today's Focus</Text>
                    {incompleteTasks.length > 0 ? (
                        incompleteTasks.map((task, index) => {
                            const category = CATEGORY_LABELS[task.category as TaskCategory];
                            const status = getTaskStatus(task.title);
                            return (
                                <Card key={index} variant="outlined" style={styles.taskCard}>
                                    <View style={styles.taskHeader}>
                                        <Text style={styles.taskEmoji}>{category.emoji}</Text>
                                        <View style={styles.taskInfo}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Text style={styles.taskCategory}>
                                                {category.label} • {status === 'in_progress' ? '🔄 In Progress' : 'Not started'}
                                            </Text>
                                        </View>
                                        <Text style={styles.taskHours}>{task.estimated_hours}h</Text>
                                    </View>
                                    <Text style={styles.taskDesc}>{task.description}</Text>
                                    {task.far_reference && (
                                        <Text style={styles.taskFar}>📋 {task.far_reference}</Text>
                                    )}
                                </Card>
                            );
                        })
                    ) : (
                        <Card variant="outlined" style={styles.taskCard}>
                            <Text style={styles.allDoneText}>🎉 All tasks completed!</Text>
                        </Card>
                    )}
                </View>

                {/* Quick Stats - using real data from flightLogStore */}
                <View style={styles.statsGrid}>
                    <Card variant="elevated" style={styles.statCard}>
                        <Text style={styles.statValue}>{currentHours}</Text>
                        <Text style={styles.statLabel}>Total Hours</Text>
                    </Card>
                    <Card variant="elevated" style={styles.statCard}>
                        <Text style={styles.statValue}>{Math.max(0, targetHours - currentHours)}</Text>
                        <Text style={styles.statLabel}>Hours Left</Text>
                    </Card>
                    <Card variant="elevated" style={styles.statCard}>
                        <Text style={styles.statValue}>{soloHours}</Text>
                        <Text style={styles.statLabel}>Solo Hours</Text>
                    </Card>
                    <Card variant="elevated" style={styles.statCard}>
                        <Text style={styles.statValue}>{crossCountryHours}</Text>
                        <Text style={styles.statLabel}>XC Hours</Text>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    // Header
    header: {
        marginBottom: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 4,
    },
    // Weather
    weatherCard: {
        marginBottom: 16,
        backgroundColor: colors.primary,
    },
    weatherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    weatherTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textInverse,
    },
    weatherSummary: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
    },
    weatherLoading: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    },
    suitability: {
        borderRadius: 8,
        padding: 12,
    },
    suitabilityText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Progress
    progressCard: {
        marginBottom: 20,
    },
    progressContent: {
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
        marginBottom: 4,
    },
    progressDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    progressNote: {
        fontSize: 12,
        color: colors.secondary,
        fontWeight: '500',
    },
    // Section
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    // Task
    taskCard: {
        marginBottom: 12,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    taskCategory: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    taskHours: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.secondary,
    },
    taskDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: 8,
    },
    taskFar: {
        fontSize: 12,
        color: colors.secondary,
        fontWeight: '500',
    },
    allDoneText: {
        fontSize: 16,
        color: colors.success,
        textAlign: 'center',
        padding: 16,
    },
    // Stats
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '47%',
        alignItems: 'center',
        paddingVertical: 20,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    // Pace Card
    paceCard: {
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    paceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paceEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    paceInfo: {
        flex: 1,
    },
    paceStatus: {
        fontSize: 16,
        fontWeight: '700',
    },
    paceMessage: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    etaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    etaLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    etaValue: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.secondary,
    },
    // Recommendation Card
    recommendationCard: {
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    recInfo: {
        flex: 1,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    recMessage: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    activitiesRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    activitiesLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    activityItem: {
        fontSize: 13,
        color: colors.text,
        marginTop: 2,
    },
    // CFI Link Card
    cfiCard: {
        marginBottom: 16,
    },
    cfiLinked: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cfiLinkedEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    cfiLinkedLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    cfiLinkedName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    cfiInputLabel: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
    },
    cfiInputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cfiInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        letterSpacing: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cfiLinkBtn: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
    },
    cfiLinkBtnText: {
        color: 'white',
        fontWeight: '700',
    },
    cfiPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cfiPromptEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    cfiPromptText: {
        flex: 1,
    },
    cfiPromptTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    cfiPromptSub: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    cfiPromptArrow: {
        fontSize: 18,
        color: colors.textSecondary,
    },
    // Runway info styles
    runwayInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    runwayLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    runwayCrosswind: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '600',
        backgroundColor: colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
});


