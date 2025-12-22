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

export default function CFISettingsScreen() {
    const router = useRouter();
    const { profile, cfiProfile, signOut } = useAuthStore();

    const handleSignOut = () => {
        showConfirm('Sign Out', 'Are you sure you want to sign out?', signOut);
    };

    const handleSwitchToStudent = () => {
        router.replace('/(main)/dashboard');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>⚙️ CFI Settings</Text>

                {/* Account */}
                <Text style={styles.sectionTitle}>Account</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => router.push('/(cfi)/profile')}
                    >
                        <Text style={styles.menuText}>👤 My Profile</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* CFI Info */}
                <Text style={styles.sectionTitle}>CFI Info</Text>
                <Card variant="outlined" style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <Text style={styles.profileLabel}>Certificate #</Text>
                        <Text style={styles.profileValue}>
                            {cfiProfile?.certificate_number || 'Not set'}
                        </Text>
                    </View>
                    <View style={styles.profileRow}>
                        <Text style={styles.profileLabel}>Ratings</Text>
                        <Text style={styles.profileValue}>
                            {cfiProfile?.ratings?.join(', ') || 'CFI'}
                        </Text>
                    </View>
                    <View style={styles.profileRow}>
                        <Text style={styles.profileLabel}>Invite Code</Text>
                        <Text style={styles.profileValue}>
                            {cfiProfile?.invite_code || 'Generate from Students tab'}
                        </Text>
                    </View>
                    <View style={[styles.profileRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.profileLabel}>Home Airport</Text>
                        <Text style={styles.profileValue}>
                            {profile?.home_airport || 'Not set'}
                        </Text>
                    </View>
                </Card>

                {/* App */}
                <Text style={styles.sectionTitle}>App</Text>
                <Card variant="outlined" style={styles.menuCard}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <Text style={styles.menuText}>🔔 Notifications</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* Sign Out */}
                <Button
                    title="Sign Out"
                    variant="outline"
                    onPress={handleSignOut}
                    style={styles.signOutBtn}
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
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    profileCard: {
        marginBottom: 24,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
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
    menuCard: {
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuText: {
        fontSize: 16,
        color: colors.text,
    },
    menuArrow: {
        fontSize: 18,
        color: colors.textSecondary,
    },
    signOutBtn: {
        marginTop: 20,
    },
});
