import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/Colors';
import type { TaskStatus, TaskCategory } from '../../types';

interface TaskItemProps {
    title: string;
    description?: string;
    category: TaskCategory;
    status: TaskStatus;
    farReference?: string;
    estimatedHours?: number;
    onPress: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, { icon: string; color: string; bgColor: string }> = {
    pending: { icon: '○', color: colors.textSecondary, bgColor: 'transparent' },
    in_progress: { icon: '◐', color: colors.warning, bgColor: colors.warning + '20' },
    completed: { icon: '✓', color: colors.success, bgColor: colors.success + '20' },
};

export function TaskItem({
    title,
    description,
    category,
    status,
    farReference,
    estimatedHours,
    onPress,
}: TaskItemProps) {
    const config = STATUS_CONFIG[status];

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: config.bgColor || colors.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.checkbox}>
                <Text style={[styles.checkIcon, { color: config.color }]}>
                    {config.icon}
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={[
                    styles.title,
                    status === 'completed' && styles.titleCompleted
                ]}>
                    {title}
                </Text>

                {description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {description}
                    </Text>
                )}

                <View style={styles.meta}>
                    {farReference && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{farReference}</Text>
                        </View>
                    )}
                    {estimatedHours && (
                        <Text style={styles.hours}>~{estimatedHours}h</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkIcon: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: colors.secondary + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
    },
    hours: {
        fontSize: 12,
        color: colors.textTertiary,
    },
});
