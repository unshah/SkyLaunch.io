import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { TaskItem } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useTaskStore } from '../../stores/taskStore';
import { TRAINING_TASKS, CATEGORY_LABELS } from '../../constants/trainingData';
import type { TaskCategory, TaskStatus } from '../../types';

// Group tasks by category
const groupedTasks = TRAINING_TASKS.reduce((acc, task) => {
    if (!acc[task.category]) {
        acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
}, {} as Record<TaskCategory, typeof TRAINING_TASKS>);

const CATEGORY_ORDER: TaskCategory[] = ['ground_school', 'flight', 'simulator', 'exam'];

export default function TasksScreen() {
    const { taskStatusByTitle, isLoading, fetchUserTasks, updateTaskStatus, getTaskStatus } = useTaskStore();
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<TaskCategory | null>('ground_school');

    useEffect(() => {
        fetchUserTasks();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserTasks();
        setRefreshing(false);
    };

    const handleTaskPress = async (taskTitle: string) => {
        const currentStatus = getTaskStatus(taskTitle);

        // Cycle through statuses: pending -> in_progress -> completed -> pending
        const nextStatus: TaskStatus =
            currentStatus === 'pending' ? 'in_progress' :
                currentStatus === 'in_progress' ? 'completed' : 'pending';

        // Update in database (store will update local state immediately)
        await updateTaskStatus(taskTitle, nextStatus);
    };

    const getCompletedCount = (category: TaskCategory) => {
        const tasks = groupedTasks[category] || [];
        return tasks.filter(t => getTaskStatus(t.title) === 'completed').length;
    };

    const getTotalCount = (category: TaskCategory) => {
        return (groupedTasks[category] || []).length;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Training Tasks</Text>
                    <Text style={styles.subtitle}>Track your PPL progress</Text>
                </View>

                {/* Overall Progress */}
                <View style={styles.overallProgress}>
                    <Text style={styles.overallLabel}>Overall Progress</Text>
                    <Text style={styles.overallValue}>
                        {Object.values(taskStatusByTitle).filter(s => s === 'completed').length} / {TRAINING_TASKS.length} tasks
                    </Text>
                </View>

                {/* Categories */}
                {CATEGORY_ORDER.map((category) => {
                    const categoryInfo = CATEGORY_LABELS[category];
                    const tasks = groupedTasks[category] || [];
                    const isExpanded = expandedCategory === category;
                    const completedCount = getCompletedCount(category);
                    const totalCount = getTotalCount(category);

                    return (
                        <View key={category} style={styles.categorySection}>
                            {/* Category Header */}
                            <TouchableOpacity
                                style={styles.categoryHeader}
                                onPress={() => setExpandedCategory(isExpanded ? null : category)}
                            >
                                <View style={styles.categoryLeft}>
                                    <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
                                    <View>
                                        <Text style={styles.categoryTitle}>{categoryInfo.label}</Text>
                                        <Text style={styles.categoryProgress}>
                                            {completedCount} / {totalCount} completed
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                            </TouchableOpacity>

                            {/* Progress Bar */}
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(completedCount / totalCount) * 100}%` }
                                    ]}
                                />
                            </View>

                            {/* Tasks List */}
                            {isExpanded && (
                                <View style={styles.tasksList}>
                                    {tasks.map((task, index) => (
                                        <TaskItem
                                            key={`${category}-${index}`}
                                            title={task.title}
                                            description={task.description || undefined}
                                            category={task.category}
                                            status={getTaskStatus(task.title)}
                                            farReference={task.far_reference || undefined}
                                            estimatedHours={task.estimated_hours}
                                            onPress={() => handleTaskPress(task.title)}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Legend */}
                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Status Legend</Text>
                    <View style={styles.legendItems}>
                        <View style={styles.legendItem}>
                            <Text style={styles.legendIcon}>○</Text>
                            <Text style={styles.legendText}>Not Started</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <Text style={[styles.legendIcon, { color: colors.warning }]}>◐</Text>
                            <Text style={styles.legendText}>In Progress</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <Text style={[styles.legendIcon, { color: colors.success }]}>✓</Text>
                            <Text style={styles.legendText}>Completed</Text>
                        </View>
                    </View>
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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 20,
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
    overallProgress: {
        backgroundColor: colors.secondary + '15',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    overallLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
    },
    overallValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.secondary,
    },
    categorySection: {
        marginBottom: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    categoryProgress: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    expandIcon: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        marginTop: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.success,
        borderRadius: 2,
    },
    tasksList: {
        marginTop: 8,
    },
    legend: {
        marginTop: 24,
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    legendTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
    },
    legendItems: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendIcon: {
        fontSize: 16,
        marginRight: 6,
        color: colors.textSecondary,
    },
    legendText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
});
