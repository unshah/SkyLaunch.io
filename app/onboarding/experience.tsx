import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';

export default function ExperienceScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [flightHours, setFlightHours] = useState('0');

    const handleContinue = () => {
        router.push({
            pathname: '/onboarding/airport',
            params: {
                ...params,
                currentHours: flightHours,
            },
        });
    };

    const hours = parseFloat(flightHours) || 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Progress indicator */}
                <View style={styles.progress}>
                    <View style={[styles.progressDot, styles.progressComplete]} />
                    <View style={[styles.progressDot, styles.progressComplete]} />
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressDot} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your experience</Text>
                    <Text style={styles.subtitle}>
                        How many flight hours do you have logged?
                    </Text>
                </View>

                {/* Hours input */}
                <View style={styles.inputSection}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={flightHours}
                            onChangeText={setFlightHours}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor={colors.textTertiary}
                        />
                        <Text style={styles.inputSuffix}>hours</Text>
                    </View>
                    <Text style={styles.inputHint}>
                        Enter 0 if you're just starting out
                    </Text>
                </View>

                {/* Progress info */}
                <View style={styles.progressInfo}>
                    <Text style={styles.progressTitle}>
                        {hours === 0 ? 'Starting Fresh!' : hours < 10 ? 'Great Start!' : hours < 30 ? 'Making Progress!' : 'Almost There!'}
                    </Text>
                    <Text style={styles.progressDesc}>
                        {hours === 0
                            ? 'No worries - everyone starts at zero. We\'ll guide you through every step.'
                            : `You've logged ${hours} hours. Only ${Math.max(0, 40 - hours)} more to reach the FAA minimum for PPL!`
                        }
                    </Text>

                    {/* Visual progress bar */}
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(100, (hours / 40) * 100)}%` }]} />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>{hours} hrs logged</Text>
                        <Text style={styles.progressLabel}>40 hrs minimum</Text>
                    </View>
                </View>

                {/* Note */}
                <View style={styles.note}>
                    <Text style={styles.noteText}>
                        📋 Based on FAR 61.109, you need at least 40 hours of flight time for your Private Pilot License.
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
        paddingBottom: 32,
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
    // Input
    inputSection: {
        marginBottom: 32,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: colors.border,
    },
    input: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.text,
        minWidth: 100,
        textAlign: 'center',
    },
    inputSuffix: {
        fontSize: 24,
        color: colors.textSecondary,
        marginLeft: 12,
    },
    inputHint: {
        fontSize: 14,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: 12,
    },
    // Progress info
    progressInfo: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    progressDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    progressLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    // Note
    note: {
        backgroundColor: colors.secondaryLight + '15',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    noteText: {
        fontSize: 13,
        color: colors.secondary,
        lineHeight: 20,
    },
    // Footer
    footer: {
        marginTop: 'auto',
    },
});
