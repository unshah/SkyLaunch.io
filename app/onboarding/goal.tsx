import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';

const GOALS = [
    {
        id: 'private',
        emoji: '🛩️',
        title: 'Private Pilot License',
        subtitle: 'PPL - FAR Part 61/141',
        description: 'Learn to fly single-engine aircraft for personal use',
    },
    {
        id: 'instrument',
        emoji: '☁️',
        title: 'Instrument Rating',
        subtitle: 'IR - Coming Soon',
        description: 'Fly in clouds and low visibility conditions',
        disabled: true,
    },
    {
        id: 'commercial',
        emoji: '✈️',
        title: 'Commercial Pilot',
        subtitle: 'CPL - Coming Soon',
        description: 'Get paid to fly for hire',
        disabled: true,
    },
];

export default function GoalScreen() {
    const router = useRouter();
    const [selectedGoal, setSelectedGoal] = useState<string | null>('private');

    const handleContinue = () => {
        if (selectedGoal) {
            router.push({
                pathname: '/onboarding/availability',
                params: { goal: selectedGoal },
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Progress indicator */}
                <View style={styles.progress}>
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>What's your goal?</Text>
                    <Text style={styles.subtitle}>
                        We'll customize your training plan based on FAA requirements
                    </Text>
                </View>

                {/* Goal options */}
                <View style={styles.options}>
                    {GOALS.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.option,
                                selectedGoal === goal.id && styles.optionSelected,
                                goal.disabled && styles.optionDisabled,
                            ]}
                            onPress={() => !goal.disabled && setSelectedGoal(goal.id)}
                            disabled={goal.disabled}
                        >
                            <Text style={styles.optionEmoji}>{goal.emoji}</Text>
                            <View style={styles.optionText}>
                                <View style={styles.optionHeader}>
                                    <Text style={[
                                        styles.optionTitle,
                                        goal.disabled && styles.optionDisabledText,
                                    ]}>
                                        {goal.title}
                                    </Text>
                                    <Text style={[
                                        styles.optionSubtitle,
                                        goal.disabled && styles.optionDisabledText,
                                    ]}>{goal.subtitle}</Text>
                                </View>
                                <Text style={[
                                    styles.optionDescription,
                                    goal.disabled && styles.optionDisabledText,
                                ]}>
                                    {goal.description}
                                </Text>
                            </View>
                            {selectedGoal === goal.id && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Note about PPL focus */}
                <View style={styles.note}>
                    <Text style={styles.noteText}>
                        ℹ️ V1 focuses on Private Pilot training. Instrument and Commercial ratings coming soon!
                    </Text>
                </View>

                {/* Continue button */}
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedGoal}
                    size="large"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 48,
    },
    // Progress
    progress: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 24,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
    },
    progressActive: {
        backgroundColor: colors.secondary,
        width: 24,
    },
    // Header
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    // Options
    options: {
        flex: 1,
        gap: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
    },
    optionSelected: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight + '10',
    },
    optionDisabled: {
        opacity: 0.6,
        backgroundColor: colors.border + '30',
    },
    optionEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    optionText: {
        flex: 1,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 4,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    optionSubtitle: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    optionDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    optionDisabledText: {
        color: colors.textTertiary,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: colors.textInverse,
        fontWeight: '700',
        fontSize: 14,
    },
    // Note
    note: {
        backgroundColor: colors.secondaryLight + '15',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    noteText: {
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 20,
    },
});
