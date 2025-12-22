import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    Platform,
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
    const { profile, signOut } = useAuthStore();

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

                {/* App Section */}
                <Text style={styles.sectionTitle}>App</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>🔔 Notifications</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>🎨 Appearance</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <Text style={styles.menuText}>📅 Calendar Sync</Text>
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
});
