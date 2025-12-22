import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Alert,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { supabase, TABLES } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

// Cross-platform alert helper
const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export default function AirportScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user, fetchProfile } = useAuthStore();
    const [airport, setAirport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        console.log('handleComplete called');
        console.log('Airport:', airport);
        console.log('User:', user);
        console.log('Params:', params);

        if (!airport || airport.length < 3) {
            showAlert('Error', 'Please enter a valid ICAO airport code (e.g., KFFZ)');
            return;
        }

        if (!user) {
            showAlert('Error', 'Not authenticated. Please log in again.');
            return;
        }

        setIsLoading(true);
        try {
            // Check if Supabase session is valid
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            console.log('Supabase session:', sessionData?.session ? 'Active' : 'No session', sessionError);

            if (!sessionData?.session) {
                showAlert('Error', 'Your session has expired. Please log in again.');
                setIsLoading(false);
                return;
            }

            console.log('Upserting profile...');
            const profileData = {
                id: user.id,
                training_goal: params.goal as string,
                weekly_hours: parseInt(params.weeklyHours as string) || 10,
                schedule_intensity: params.intensity as string,
                current_flight_hours: parseFloat(params.currentHours as string) || 0,
                home_airport: airport.toUpperCase(),
            };
            console.log('Profile data:', profileData);

            const { error, data } = await supabase.from(TABLES.PROFILES).upsert(profileData).select();
            console.log('Upsert result:', { error, data });

            if (error) throw error;

            console.log('Fetching profile...');
            await fetchProfile();
            console.log('Profile fetched, navigation should happen automatically');
            // Navigation will be handled by root layout
        } catch (error: any) {
            console.error('Error saving profile:', error);
            showAlert('Error', error.message || 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Progress indicator */}
                <View style={styles.progress}>
                    <View style={[styles.progressDot, styles.progressComplete]} />
                    <View style={[styles.progressDot, styles.progressComplete]} />
                    <View style={[styles.progressDot, styles.progressComplete]} />
                    <View style={[styles.progressDot, styles.progressActive]} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Home airport</Text>
                    <Text style={styles.subtitle}>
                        We'll use this for weather updates and scheduling
                    </Text>
                </View>

                {/* Airport input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>ICAO Code</Text>
                    <TextInput
                        style={styles.input}
                        value={airport}
                        onChangeText={(text) => setAirport(text.toUpperCase())}
                        placeholder="KFFZ"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="characters"
                        maxLength={4}
                    />
                    <Text style={styles.inputHint}>
                        Enter the 4-letter ICAO code for your training airport
                    </Text>
                </View>

                {/* Examples */}
                <View style={styles.examples}>
                    <Text style={styles.examplesTitle}>Common examples:</Text>
                    <View style={styles.exampleGrid}>
                        <View style={styles.exampleItem}>
                            <Text style={styles.exampleCode}>KFFZ</Text>
                            <Text style={styles.exampleName}>Mesa, AZ</Text>
                        </View>
                        <View style={styles.exampleItem}>
                            <Text style={styles.exampleCode}>KDVT</Text>
                            <Text style={styles.exampleName}>Phoenix, AZ</Text>
                        </View>
                        <View style={styles.exampleItem}>
                            <Text style={styles.exampleCode}>KSMO</Text>
                            <Text style={styles.exampleName}>Santa Monica, CA</Text>
                        </View>
                        <View style={styles.exampleItem}>
                            <Text style={styles.exampleCode}>KGAI</Text>
                            <Text style={styles.exampleName}>Gaithersburg, MD</Text>
                        </View>
                    </View>
                </View>

                {/* Weather preview */}
                {airport.length >= 3 && (
                    <View style={styles.weatherPreview}>
                        <Text style={styles.weatherTitle}>🌤️ Weather at {airport}</Text>
                        <Text style={styles.weatherText}>
                            Live METAR data will appear on your dashboard
                        </Text>
                    </View>
                )}

                {/* Complete button */}
                <View style={styles.footer}>
                    <Button
                        title="Complete Setup"
                        onPress={handleComplete}
                        loading={isLoading}
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
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        letterSpacing: 4,
        borderWidth: 2,
        borderColor: colors.border,
    },
    inputHint: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
    },
    // Examples
    examples: {
        marginBottom: 24,
    },
    examplesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
    },
    exampleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    exampleItem: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    exampleCode: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.secondary,
    },
    exampleName: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    // Weather preview
    weatherPreview: {
        backgroundColor: colors.secondaryLight + '15',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    weatherTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.secondary,
        marginBottom: 4,
    },
    weatherText: {
        fontSize: 14,
        color: colors.secondary,
    },
    // Footer
    footer: {
        marginTop: 'auto',
    },
});
