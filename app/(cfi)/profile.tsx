import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function CFIProfileScreen() {
    const router = useRouter();
    const { user, profile, cfiProfile } = useAuthStore();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>My Profile</Text>
                </View>

                {/* Avatar/Name */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name?.charAt(0)?.toUpperCase() || '👤'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{profile?.full_name || 'Instructor'}</Text>
                    <Text style={styles.role}>👨‍✈️ Certified Flight Instructor</Text>
                </View>

                {/* Account Info */}
                <Text style={styles.sectionTitle}>Account</Text>
                <Card variant="outlined" style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{profile?.full_name || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Certificate #</Text>
                        <Text style={styles.infoValue}>{cfiProfile?.certificate_number || 'Not set'}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString()
                                : 'Unknown'}
                        </Text>
                    </View>
                </Card>

                {/* Switch View */}
                <Text style={styles.sectionTitle}>View Mode</Text>
                <Card variant="outlined" style={styles.switchCard}>
                    <TouchableOpacity
                        style={styles.switchOption}
                        onPress={() => router.replace('/(main)/dashboard')}
                    >
                        <Text style={styles.switchEmoji}>🎓</Text>
                        <View style={styles.switchInfo}>
                            <Text style={styles.switchTitle}>Student View</Text>
                            <Text style={styles.switchDesc}>Track your training progress</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.switchOption, { borderBottomWidth: 0 }]}
                        onPress={() => router.replace('/(cfi)/students')}
                    >
                        <Text style={styles.switchEmoji}>👨‍✈️</Text>
                        <View style={styles.switchInfo}>
                            <Text style={styles.switchTitle}>CFI View</Text>
                            <Text style={styles.switchDesc}>Manage and grade students</Text>
                        </View>
                        <Text style={styles.currentBadge}>Current</Text>
                    </TouchableOpacity>
                </Card>
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
    header: {
        marginBottom: 24,
    },
    backBtn: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.secondary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.secondary,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
    },
    role: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoCard: {
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    switchCard: {
        marginBottom: 24,
    },
    switchOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    switchEmoji: {
        fontSize: 28,
        marginRight: 16,
    },
    switchInfo: {
        flex: 1,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    switchDesc: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    currentBadge: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
        backgroundColor: colors.secondary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
});
