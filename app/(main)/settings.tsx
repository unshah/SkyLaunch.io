import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

// Cross-platform alert helper
const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
    } else {
        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: onConfirm },
        ]);
    }
};

export default function SettingsScreen() {
    const router = useRouter();
    const { profile, signOut, updateProfile } = useAuthStore();

    // Local state for preferences
    const [maxSessions, setMaxSessions] = useState(profile?.max_sessions_per_day || 1);
    const [sessionDuration, setSessionDuration] = useState(profile?.session_duration || 2);
    const [saving, setSaving] = useState(false);

    // Sync with profile on load
    useEffect(() => {
        if (profile) {
            setMaxSessions(profile.max_sessions_per_day || 1);
            setSessionDuration(profile.session_duration || 2);
        }
    }, [profile]);

    const handleUpdateMaxSessions = async (delta: number) => {
        const newValue = Math.max(1, Math.min(4, maxSessions + delta));
        if (newValue === maxSessions) return;

        setMaxSessions(newValue);
        setSaving(true);
        await updateProfile({ max_sessions_per_day: newValue });
        setSaving(false);
    };

    const handleUpdateDuration = async (delta: number) => {
        const newValue = Math.max(1, Math.min(4, sessionDuration + delta));
        if (newValue === sessionDuration) return;

        setSessionDuration(newValue);
        setSaving(true);
        await updateProfile({ session_duration: newValue });
        setSaving(false);
    };

    const handleSignOut = () => {
        showConfirm(
            'Sign Out',
            'Are you sure you want to sign out?',
            signOut
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>⚙️ Settings</Text>
                </View>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => router.push('/(main)/profile')}
                    >
                        <Text style={styles.menuText}>👤 My Profile</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* Training Section */}
                <Text style={styles.sectionTitle}>Training</Text>
                <Card variant="outlined" style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <Text style={styles.profileLabel}>Training Goal</Text>
                        <Text style={styles.profileValue}>
                            {profile?.training_goal === 'private' ? 'Private Pilot (PPL)' : profile?.training_goal}
                        </Text>
                    </View>
                    <View style={styles.profileRow}>
                        <Text style={styles.profileLabel}>Home Airport</Text>
                        <Text style={styles.profileValue}>{profile?.home_airport || 'Not set'}</Text>
                    </View>
                    <View style={styles.profileRow}>
                        <Text style={styles.profileLabel}>Weekly Hours</Text>
                        <Text style={styles.profileValue}>{profile?.weekly_hours || 10}h/week</Text>
                    </View>
                    <View style={[styles.profileRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.profileLabel}>Training Pace</Text>
                        <Text style={styles.profileValue}>
                            {profile?.schedule_intensity ? profile.schedule_intensity.charAt(0).toUpperCase() + profile.schedule_intensity.slice(1) : 'Balanced'}
                        </Text>
                    </View>
                </Card>

                {/* Scheduling Section */}
                <Text style={styles.sectionTitle}>Scheduling</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(main)/schedule')}
                    >
                        <Text style={styles.menuText}>📅 My Training Schedule</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => router.push('/(main)/availability')}
                    >
                        <Text style={styles.menuText}>⏰ Set Availability</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* Schedule Preferences */}
                <Text style={styles.sectionTitle}>Schedule Preferences</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <View style={styles.preferenceRow}>
                        <View style={styles.preferenceInfo}>
                            <Text style={styles.preferenceLabel}>Max Sessions/Day</Text>
                            <Text style={styles.preferenceDesc}>Limit training fatigue (1-4)</Text>
                        </View>
                        <View style={styles.stepperContainer}>
                            <TouchableOpacity
                                style={[styles.stepperBtn, maxSessions <= 1 && styles.stepperBtnDisabled]}
                                onPress={() => handleUpdateMaxSessions(-1)}
                                disabled={maxSessions <= 1 || saving}
                            >
                                <Text style={styles.stepperText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.stepperValue}>
                                <Text style={styles.stepperNumber}>{maxSessions}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.stepperBtn, maxSessions >= 4 && styles.stepperBtnDisabled]}
                                onPress={() => handleUpdateMaxSessions(1)}
                                disabled={maxSessions >= 4 || saving}
                            >
                                <Text style={styles.stepperText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.preferenceRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.preferenceInfo}>
                            <Text style={styles.preferenceLabel}>Session Duration</Text>
                            <Text style={styles.preferenceDesc}>Hours per session (1-4)</Text>
                        </View>
                        <View style={styles.stepperContainer}>
                            <TouchableOpacity
                                style={[styles.stepperBtn, sessionDuration <= 1 && styles.stepperBtnDisabled]}
                                onPress={() => handleUpdateDuration(-1)}
                                disabled={sessionDuration <= 1 || saving}
                            >
                                <Text style={styles.stepperText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.stepperValue}>
                                <Text style={styles.stepperNumber}>{sessionDuration}h</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.stepperBtn, sessionDuration >= 4 && styles.stepperBtnDisabled]}
                                onPress={() => handleUpdateDuration(1)}
                                disabled={sessionDuration >= 4 || saving}
                            >
                                <Text style={styles.stepperText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>

                {/* App Section */}
                <Text style={styles.sectionTitle}>App</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>🔔 Notifications</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <Text style={styles.menuText}>🎨 Appearance</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(main)/faa-requirements')}>
                        <Text style={styles.menuText}>📋 FAA Requirements</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(main)/help-support')}>
                        <Text style={styles.menuText}>❓ Help & Support</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://skylaunch.io/feedback.html')}>
                        <Text style={styles.menuText}>💬 Give Feedback</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/(main)/privacy-policy')}>
                        <Text style={styles.menuText}>📜 Privacy Policy</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* Version */}
                <Text style={styles.version}>SkyLaunch v1.0.0</Text>

                {/* Sign Out */}
                <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    size="large"
                    style={styles.signOutButton}
                />
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
    // Section
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
        marginTop: 8,
    },
    // Profile
    profileCard: {
        marginBottom: 16,
        padding: 0,
        overflow: 'hidden',
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    profileLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    profileValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    // Menu
    menuCard: {
        marginBottom: 16,
        padding: 0,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuText: {
        fontSize: 16,
        color: colors.text,
    },
    menuArrow: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    // Version
    version: {
        fontSize: 12,
        color: colors.textTertiary,
        textAlign: 'center',
        marginVertical: 20,
    },
    // Sign Out
    signOutButton: {
        borderColor: colors.danger,
    },
    // Preference styles
    preferenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    preferenceInfo: {
        flex: 1,
    },
    preferenceLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    preferenceDesc: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    preferenceValue: {
        backgroundColor: colors.secondary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    preferenceNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.secondary,
    },
    // Stepper styles
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepperBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperBtnDisabled: {
        backgroundColor: colors.border,
    },
    stepperText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },
    stepperValue: {
        minWidth: 45,
        alignItems: 'center',
        backgroundColor: colors.secondary + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    stepperNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.secondary,
    },
});
