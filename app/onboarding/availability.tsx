import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';

const HOURS_OPTIONS = [5, 8, 10, 15, 20];
const INTENSITY_OPTIONS = [
    { id: 'relaxed', label: 'Relaxed', desc: '6-12 months', emoji: '🐢' },
    { id: 'balanced', label: 'Balanced', desc: '4-6 months', emoji: '⚖️' },
    { id: 'aggressive', label: 'Intensive', desc: '2-3 months', emoji: '🚀' },
];

export default function AvailabilityScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [weeklyHours, setWeeklyHours] = useState(10);
    const [intensity, setIntensity] = useState('balanced');

    const handleContinue = () => {
        router.push({
            pathname: '/onboarding/experience',
            params: {
                ...params,
                weeklyHours: weeklyHours.toString(),
                intensity,
            },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Progress indicator */}
                <View style={styles.progress}>
                    <View style={[styles.progressDot, styles.progressComplete]} />
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>How much time?</Text>
                    <Text style={styles.subtitle}>
                        Help us create a realistic training schedule
                    </Text>
                </View>

                {/* Weekly hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hours per week</Text>
                    <View style={styles.hoursGrid}>
                        {HOURS_OPTIONS.map((hours) => (
                            <TouchableOpacity
                                key={hours}
                                style={[
                                    styles.hoursOption,
                                    weeklyHours === hours && styles.hoursSelected,
                                ]}
                                onPress={() => setWeeklyHours(hours)}
                            >
                                <Text style={[
                                    styles.hoursText,
                                    weeklyHours === hours && styles.hoursTextSelected,
                                ]}>
                                    {hours}
                                </Text>
                                <Text style={[
                                    styles.hoursLabel,
                                    weeklyHours === hours && styles.hoursLabelSelected,
                                ]}>
                                    hrs/wk
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Intensity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Training pace</Text>
                    <View style={styles.intensityGrid}>
                        {INTENSITY_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.intensityOption,
                                    intensity === option.id && styles.intensitySelected,
                                ]}
                                onPress={() => setIntensity(option.id)}
                            >
                                <Text style={styles.intensityEmoji}>{option.emoji}</Text>
                                <Text style={[
                                    styles.intensityLabel,
                                    intensity === option.id && styles.intensityLabelSelected,
                                ]}>
                                    {option.label}
                                </Text>
                                <Text style={styles.intensityDesc}>{option.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Estimate */}
                <View style={styles.estimate}>
                    <Text style={styles.estimateLabel}>Estimated completion:</Text>
                    <Text style={styles.estimateValue}>
                        {intensity === 'aggressive' ? '2-3' : intensity === 'balanced' ? '4-6' : '6-12'} months
                    </Text>
                </View>

                {/* Continue button */}
                <View style={styles.footer}>
                    <Button
                        title="Continue"
                        onPress={handleContinue}
                        size="large"
                    />
                </View>
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
    progressComplete: {
        backgroundColor: colors.success,
    },
    // Header
    header: {
        marginBottom: 32,
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
    },
    // Section
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    // Hours
    hoursGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    hoursOption: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        minHeight: 80,
    },
    hoursSelected: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight + '10',
    },
    hoursText: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        lineHeight: 26,
    },
    hoursTextSelected: {
        color: colors.secondary,
    },
    hoursLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    hoursLabelSelected: {
        color: colors.secondary,
    },
    // Intensity
    intensityGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    intensityOption: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    intensitySelected: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight + '10',
    },
    intensityEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    intensityLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    intensityLabelSelected: {
        color: colors.secondary,
    },
    intensityDesc: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    // Estimate
    estimate: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    estimateLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    estimateValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.secondary,
    },
    // Footer
    footer: {
        marginTop: 'auto',
    },
});
