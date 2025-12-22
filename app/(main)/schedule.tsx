import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Card } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { TRAINING_TASKS, CATEGORY_LABELS } from '../../constants/trainingData';
import type { TaskCategory } from '../../types';

// Generate mock schedule for the next 7 days
const generateSchedule = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const tasks = i % 2 === 0
            ? [TRAINING_TASKS[Math.floor(Math.random() * 8)]]
            : i % 3 === 0
                ? [TRAINING_TASKS[8 + Math.floor(Math.random() * 8)]]
                : [];

        days.push({
            date,
            isToday: i === 0,
            tasks,
        });
    }
    return days;
};

export default function ScheduleScreen() {
    const schedule = generateSchedule();

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>📅 Training Schedule</Text>
                    <Text style={styles.subtitle}>Your personalized flight plan</Text>
                </View>

                {/* Schedule */}
                {schedule.map((day, index) => (
                    <View key={index} style={styles.daySection}>
                        <View style={styles.dayHeader}>
                            <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                                {day.isToday ? 'Today' : formatDate(day.date)}
                            </Text>
                            {day.isToday && <View style={styles.todayBadge}><Text style={styles.todayText}>Now</Text></View>}
                        </View>

                        {day.tasks.length > 0 ? (
                            day.tasks.map((task, taskIndex) => {
                                const category = CATEGORY_LABELS[task.category as TaskCategory];
                                return (
                                    <Card key={taskIndex} variant="elevated" style={styles.taskCard}>
                                        <View style={styles.taskTime}>
                                            <Text style={styles.taskTimeText}>9:00 AM</Text>
                                            <View style={styles.taskLine} />
                                        </View>
                                        <View style={styles.taskContent}>
                                            <View style={styles.taskHeader}>
                                                <Text style={styles.taskEmoji}>{category.emoji}</Text>
                                                <Text style={styles.taskCategory}>{category.label}</Text>
                                            </View>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <Text style={styles.taskDesc}>{task.description}</Text>
                                            <View style={styles.taskMeta}>
                                                <Text style={styles.taskDuration}>⏱️ {task.estimated_hours}h</Text>
                                                {task.far_reference && (
                                                    <Text style={styles.taskFar}>📋 {task.far_reference}</Text>
                                                )}
                                            </View>
                                        </View>
                                    </Card>
                                );
                            })
                        ) : (
                            <View style={styles.emptyDay}>
                                <Text style={styles.emptyText}>No training scheduled</Text>
                            </View>
                        )}
                    </View>
                ))}
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
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 4,
    },
    // Day
    daySection: {
        marginBottom: 24,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    dayLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    dayLabelToday: {
        color: colors.secondary,
    },
    todayBadge: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    todayText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textInverse,
    },
    // Task
    taskCard: {
        flexDirection: 'row',
        padding: 0,
        overflow: 'hidden',
    },
    taskTime: {
        width: 70,
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: colors.surfaceSecondary,
    },
    taskTimeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    taskLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.secondary,
        marginTop: 8,
        borderRadius: 1,
    },
    taskContent: {
        flex: 1,
        padding: 16,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    taskEmoji: {
        fontSize: 20,
    },
    taskCategory: {
        fontSize: 12,
        color: colors.secondary,
        fontWeight: '600',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    taskDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: 12,
    },
    taskMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    taskDuration: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    taskFar: {
        fontSize: 12,
        color: colors.secondary,
        fontWeight: '500',
    },
    // Empty
    emptyDay: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 14,
        color: colors.textTertiary,
    },
});
