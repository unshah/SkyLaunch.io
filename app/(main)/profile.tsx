import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, profile, updateProfile } = useAuthStore();
    const [editingAirport, setEditingAirport] = useState(false);
    const [airportValue, setAirportValue] = useState(profile?.home_airport || '');
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(profile?.full_name || '');
    const [saving, setSaving] = useState(false);

    const handleSaveAirport = async () => {
        setSaving(true);
        const { error } = await updateProfile({ home_airport: airportValue.toUpperCase() });
        setSaving(false);
        if (error) {
            Platform.OS === 'web'
                ? window.alert('Failed to save')
                : Alert.alert('Error', 'Failed to save');
        } else {
            setEditingAirport(false);
        }
    };

    const handleSaveName = async () => {
        if (!nameValue.trim()) return;
        setSaving(true);
        const { error } = await updateProfile({ full_name: nameValue.trim() });
        setSaving(false);
        if (error) {
            Platform.OS === 'web'
                ? window.alert('Failed to save')
                : Alert.alert('Error', 'Failed to save');
        } else {
            setEditingName(false);
        }
    };

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
                    <Text style={styles.name}>{profile?.full_name || 'Pilot'}</Text>
                    <Text style={styles.role}>
                        {profile?.role === 'cfi' ? '👨‍✈️ Certified Flight Instructor' : '🎓 Student Pilot'}
                    </Text>
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
                        {editingName ? (
                            <View style={styles.editRow}>
                                <TextInput
                                    style={[styles.editInput, styles.nameInput]}
                                    value={nameValue}
                                    onChangeText={setNameValue}
                                    placeholder="Your name"
                                    placeholderTextColor={colors.textTertiary}
                                    autoCapitalize="words"
                                />
                                <TouchableOpacity onPress={handleSaveName} disabled={saving || !nameValue.trim()}>
                                    <Text style={styles.saveBtn}>{saving ? '...' : 'Save'}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => {
                                setNameValue(profile?.full_name || '');
                                setEditingName(true);
                            }}>
                                <Text style={[styles.infoValue, styles.editableValue]}>
                                    {profile?.full_name || 'Tap to set'} ✏️
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Home Airport</Text>
                        {editingAirport ? (
                            <View style={styles.editRow}>
                                <TextInput
                                    style={styles.editInput}
                                    value={airportValue}
                                    onChangeText={setAirportValue}
                                    placeholder="KJFK"
                                    placeholderTextColor={colors.textTertiary}
                                    autoCapitalize="characters"
                                    maxLength={4}
                                />
                                <TouchableOpacity onPress={handleSaveAirport} disabled={saving}>
                                    <Text style={styles.saveBtn}>{saving ? '...' : 'Save'}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingAirport(true)}>
                                <Text style={[styles.infoValue, styles.editableValue]}>
                                    {profile?.home_airport || 'Tap to set'} ✏️
                                </Text>
                            </TouchableOpacity>
                        )}
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
                        <Text style={styles.currentBadge}>Current</Text>
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
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editInput: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        width: 70,
        textAlign: 'center',
    },
    saveBtn: {
        color: colors.secondary,
        fontWeight: '600',
        fontSize: 14,
    },
    editableValue: {
        color: colors.secondary,
    },
    nameInput: {
        width: 150,
        textAlign: 'left',
    },
});
