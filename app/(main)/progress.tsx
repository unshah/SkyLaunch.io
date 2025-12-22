import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, ProgressRing } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useFlightLogStore } from '../../stores/flightLogStore';
import { useTaskStore } from '../../stores/taskStore';
import { PPL_REQUIREMENTS, TRAINING_TASKS, CATEGORY_LABELS } from '../../constants/trainingData';
import type { TaskCategory } from '../../types';

export default function ProgressScreen() {
    const { totalHours, soloHours, crossCountryHours, nightHours, fetchFlightLogs, isLoading: flightLoading } = useFlightLogStore();
    const { taskStatusByTitle, fetchUserTasks, getTaskStatus, isLoading: taskLoading } = useTaskStore();
    const [refreshing, setRefreshing] = React.useState(false);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchFlightLogs();
            fetchUserTasks();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFlightLogs(), fetchUserTasks()]);
        setRefreshing(false);
    };

    // Calculate completed tasks by category
    const getCompletedInCategory = (category: TaskCategory) => {
        return TRAINING_TASKS
            .filter(t => t.category === category)
            .filter(t => getTaskStatus(t.title) === 'completed')
            .length;
    };

    const getTotalInCategory = (category: TaskCategory) => {
        return TRAINING_TASKS.filter(t => t.category === category).length;
    };

    // Calculate category progress using real data
    const categories: { key: TaskCategory; current: number; required: number; unit: string }[] = [
        {
            key: 'ground_school',
            current: getCompletedInCategory('ground_school'),
            required: getTotalInCategory('ground_school'),
            unit: 'tasks'
        },
        {
            key: 'flight',
            current: totalHours,
            required: PPL_REQUIREMENTS.totalHours,
            unit: 'hours'
        },
        {
            key: 'simulator',
            current: getCompletedInCategory('simulator'),
            required: getTotalInCategory('simulator'),
            unit: 'tasks'
        },
        {
            key: 'exam',
            current: getCompletedInCategory('exam'),
            required: getTotalInCategory('exam'),
            unit: 'tasks'
        },
    ];

    // Milestones based on actual flight hours
    const milestones = [
        { title: 'First Solo', hours: 15, completed: totalHours >= 15 },
        { title: 'Cross-Country Solo', hours: 25, completed: crossCountryHours >= 3 },
        { title: 'Night Flight', hours: 30, completed: nightHours >= 3 },
        { title: 'Knowledge Test', hours: 35, completed: getTaskStatus('FAA Knowledge Test Prep') === 'completed' },
        { title: 'Checkride', hours: 40, completed: totalHours >= 40 && getTaskStatus('Checkride Preparation') === 'completed' },
    ];

    // Total task completion
    const totalCompletedTasks = Object.values(taskStatusByTitle).filter(s => s === 'completed').length;

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
                    <Text style={styles.title}>📊 Your Progress</Text>
                    <Text style={styles.subtitle}>PPL Training Journey</Text>
                </View>

                {/* Overall Progress */}
                <Card variant="elevated" style={styles.overallCard}>
                    <View style={styles.overallContent}>
                        <ProgressRing
                            progress={(totalHours / PPL_REQUIREMENTS.totalHours) * 100}
                            size={140}
                            strokeWidth={12}
                            color={colors.success}
                            label={`${Math.round((totalHours / PPL_REQUIREMENTS.totalHours) * 100)}%`}
                            sublabel="complete"
                        />
                        <View style={styles.overallInfo}>
                            <Text style={styles.overallHours}>{totalHours}</Text>
                            <Text style={styles.overallLabel}>of {PPL_REQUIREMENTS.totalHours} flight hours</Text>
                            <Text style={styles.overallFar}>{totalCompletedTasks}/{TRAINING_TASKS.length} tasks done</Text>
                        </View>
                    </View>
                </Card>

                {/* Category Progress */}
                <Text style={styles.sectionTitle}>Training Categories</Text>
                <View style={styles.categoriesGrid}>
                    {categories.map((cat) => {
                        const label = CATEGORY_LABELS[cat.key];
                        const progress = cat.required > 0 ? Math.min(100, (cat.current / cat.required) * 100) : 0;
                        return (
                            <Card key={cat.key} variant="outlined" style={styles.categoryCard}>
                                <Text style={styles.categoryEmoji}>{label.emoji}</Text>
                                <Text style={styles.categoryLabel}>{label.label}</Text>
                                <View style={styles.categoryBar}>
                                    <View style={[styles.categoryFill, { width: `${progress}%` }]} />
                                </View>
                                <Text style={styles.categoryProgress}>
                                    {cat.current}/{cat.required} {cat.unit}
                                </Text>
                            </Card>
                        );
                    })}
                </View>

                {/* Milestones */}
                <Text style={styles.sectionTitle}>🏆 Milestones</Text>
                <View style={styles.milestones}>
                    {milestones.map((milestone, index) => (
                        <View key={index} style={styles.milestoneItem}>
                            <View style={[styles.milestoneIcon, milestone.completed && styles.milestoneCompleted]}>
                                <Text style={[styles.milestoneCheck, milestone.completed && { color: 'white' }]}>
                                    {milestone.completed ? '✓' : index + 1}
                                </Text>
                            </View>
                            <View style={styles.milestoneInfo}>
                                <Text style={[styles.milestoneTitle, milestone.completed && styles.milestoneCompletedText]}>
                                    {milestone.title}
                                </Text>
                                <Text style={styles.milestoneHours}>~{milestone.hours} hours</Text>
                            </View>
                            {index < milestones.length - 1 && <View style={styles.milestoneLine} />}
                        </View>
                    ))}
                </View>

                {/* Stats */}
                <Text style={styles.sectionTitle}>📈 Quick Stats</Text>
                <View style={styles.statsRow}>
                    <Card variant="elevated" style={styles.statCard}>
                        <Text style={styles.statValue}>{Math.max(0, PPL_REQUIREMENTS.soloHours - soloHours)}</Text>
                        <Text style={styles.statLabel}>Solo Hours Left</Text>
                    </Card>
                    <Card variant="elevated" style={styles.statCard}>
                        <Text style={styles.statValue}>{Math.max(0, PPL_REQUIREMENTS.crossCountryHours - crossCountryHours)}</Text>
                        <Text style={styles.statLabel}>XC Hours Left</Text>
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
    // Overall
    overallCard: {
        marginBottom: 24,
    },
    overallContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    overallInfo: {
        flex: 1,
    },
    overallHours: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.text,
    },
    overallLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    overallFar: {
        fontSize: 12,
        color: colors.secondary,
        fontWeight: '500',
        marginTop: 8,
    },
    // Section
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    // Categories
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    categoryCard: {
        width: '47%',
        alignItems: 'center',
        padding: 16,
    },
    categoryEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    categoryBar: {
        width: '100%',
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    categoryFill: {
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 3,
    },
    categoryProgress: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    // Milestones
    milestones: {
        marginBottom: 24,
    },
    milestoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        paddingBottom: 24,
    },
    milestoneIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    milestoneCompleted: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    milestoneCheck: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    milestoneInfo: {
        flex: 1,
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    milestoneCompletedText: {
        color: colors.success,
    },
    milestoneHours: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    milestoneLine: {
        position: 'absolute',
        left: 17,
        top: 36,
        width: 2,
        height: 24,
        backgroundColor: colors.border,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
});
