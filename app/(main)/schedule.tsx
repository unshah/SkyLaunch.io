import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useScheduleStore } from '../../stores/scheduleStore';
import type { TrainingSchedule } from '../../types';

const ACTIVITY_ICONS: Record<string, string> = {
    flight: '✈️',
    ground: '📚',
    sim: '🎮',
    exam_prep: '📝',
};

const STATUS_COLORS: Record<string, string> = {
    scheduled: colors.secondary,
    confirmed: colors.success,
    completed: colors.success,
    cancelled: colors.danger,
    weather_hold: colors.warning,
    rescheduled: colors.textSecondary,
};

export default function ScheduleScreen() {
    const router = useRouter();
    const { schedule, fetchSchedule, generateSchedule, updateScheduleStatus, isLoading } = useScheduleStore();
    const [refreshing, setRefreshing] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        await fetchSchedule(
            today.toISOString().split('T')[0],
            oneMonthLater.toISOString().split('T')[0]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSchedule();
        setRefreshing(false);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        const { error, entriesCreated } = await generateSchedule();
        setGenerating(false);

        if (error) {
            Platform.OS === 'web'
                ? window.alert(error.message)
                : Alert.alert('Error', error.message);
        } else {
            Platform.OS === 'web'
                ? window.alert(`Generated ${entriesCreated} training sessions!`)
                : Alert.alert('Success', `Generated ${entriesCreated} training sessions!`);
        }
    };

    const handleComplete = async (entry: TrainingSchedule) => {
        await updateScheduleStatus(entry.id, 'completed');
    };

    const handleCancel = async (entry: TrainingSchedule) => {
        await updateScheduleStatus(entry.id, 'cancelled');
    };

    // Group schedule by date
    const groupedSchedule: Record<string, TrainingSchedule[]> = {};
    schedule.forEach(entry => {
        if (!groupedSchedule[entry.scheduled_date]) {
            groupedSchedule[entry.scheduled_date] = [];
        }
        groupedSchedule[entry.scheduled_date].push(entry);
    });

    const sortedDates = Object.keys(groupedSchedule).sort();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.getTime() === today.getTime()) return 'Today';
        if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

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
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>📅 Training Schedule</Text>
                    <Text style={styles.subtitle}>
                        {schedule.length} sessions scheduled
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title={generating ? 'Generating...' : '🔄 Generate Schedule'}
                        onPress={handleGenerate}
                        disabled={generating}
                        variant="primary"
                        style={styles.actionBtn}
                    />
                    <Button
                        title="⏰ Set Availability"
                        onPress={() => router.push('/(main)/availability')}
                        variant="outline"
                        style={styles.actionBtn}
                    />
                </View>

                {/* Schedule List */}
                {sortedDates.length === 0 ? (
                    <Card variant="outlined" style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>📅</Text>
                        <Text style={styles.emptyTitle}>No Schedule Yet</Text>
                        <Text style={styles.emptyText}>
                            Set your availability and generate a personalized training schedule
                        </Text>
                    </Card>
                ) : (
                    sortedDates.map(date => (
                        <View key={date} style={styles.dateSection}>
                            <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                            {groupedSchedule[date].map(entry => (
                                <Card
                                    key={entry.id}
                                    variant="outlined"
                                    style={[
                                        styles.scheduleCard,
                                        entry.status === 'completed' && styles.completedCard,
                                        entry.status === 'cancelled' && styles.cancelledCard,
                                    ]}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.activityBadge}>
                                            <Text style={styles.activityIcon}>
                                                {ACTIVITY_ICONS[entry.activity_type]}
                                            </Text>
                                            <Text style={styles.activityType}>
                                                {entry.activity_type.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: STATUS_COLORS[entry.status] + '20' },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: STATUS_COLORS[entry.status] },
                                                ]}
                                            >
                                                {entry.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.taskTitle}>
                                        {entry.task_title || 'Training Session'}
                                    </Text>

                                    <Text style={styles.timeText}>
                                        🕐 {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                    </Text>

                                    {entry.aircraft_type && (
                                        <Text style={styles.aircraftText}>
                                            🛩️ {entry.aircraft_type}
                                        </Text>
                                    )}

                                    {entry.notes && (
                                        <Text style={styles.notesText}>
                                            {entry.notes}
                                        </Text>
                                    )}

                                    {entry.status === 'scheduled' && (
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity
                                                style={styles.completeBtn}
                                                onPress={() => handleComplete(entry)}
                                            >
                                                <Text style={styles.completeBtnText}>✓ Complete</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.cancelBtn}
                                                onPress={() => handleCancel(entry)}
                                            >
                                                <Text style={styles.cancelBtnText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Card>
                            ))}
                        </View>
                    ))
                )}
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
    header: {
        marginBottom: 24,
    },
    backBtn: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
    },
    emptyCard: {
        alignItems: 'center',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    dateSection: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    scheduleCard: {
        marginBottom: 12,
    },
    completedCard: {
        opacity: 0.6,
    },
    cancelledCard: {
        opacity: 0.4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activityIcon: {
        fontSize: 18,
    },
    activityType: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    timeText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    aircraftText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    completeBtn: {
        flex: 1,
        backgroundColor: colors.success + '15',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    completeBtnText: {
        color: colors.success,
        fontWeight: '600',
        fontSize: 14,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: colors.danger + '15',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: colors.danger,
        fontWeight: '600',
        fontSize: 14,
    },
    notesText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 8,
        padding: 8,
        backgroundColor: colors.surface,
        borderRadius: 6,
        lineHeight: 18,
        fontStyle: 'italic',
    },
});
