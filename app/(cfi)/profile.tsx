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
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function CFIProfileScreen() {
    const router = useRouter();
    const { user, profile, cfiProfile, updateProfile, deleteAccount } = useAuthStore();
    const [editingAirport, setEditingAirport] = useState(false);
    const [airportValue, setAirportValue] = useState(profile?.home_airport || '');
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setDeleting(true);
        const { error } = await deleteAccount();
        setDeleting(false);

        if (error) {
            Platform.OS === 'web'
                ? window.alert('Failed to delete account: ' + error.message)
                : Alert.alert('Error', 'Failed to delete account: ' + error.message);
        } else {
            setShowDeleteModal(false);
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
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ratings</Text>
                        <Text style={styles.infoValue}>{cfiProfile?.ratings?.join(', ') || 'CFI'}</Text>
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
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Invite Code</Text>
                        <Text style={[styles.infoValue, { color: colors.secondary, fontWeight: '700' }]}>
                            {cfiProfile?.invite_code || 'Generate from Students tab'}
                        </Text>
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

                {/* Danger Zone */}
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <Card variant="outlined" style={styles.dangerCard}>
                    <View style={styles.dangerContent}>
                        <View style={styles.dangerInfo}>
                            <Text style={styles.dangerTitle}>Delete Account</Text>
                            <Text style={styles.dangerDesc}>
                                Permanently delete your account and all associated data
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>⚠️ Delete Account</Text>
                        <Text style={styles.modalMessage}>
                            This action is permanent and cannot be undone. All your data including:
                        </Text>
                        <View style={styles.modalList}>
                            <Text style={styles.modalListItem}>• Flight logs</Text>
                            <Text style={styles.modalListItem}>• Training progress</Text>
                            <Text style={styles.modalListItem}>• Profile information</Text>
                            <Text style={styles.modalListItem}>• CFI profile and student connections</Text>
                        </View>
                        <Text style={styles.modalMessage}>
                            will be permanently deleted.
                        </Text>
                        <Text style={styles.modalConfirmLabel}>
                            Type <Text style={styles.modalConfirmKeyword}>DELETE</Text> to confirm:
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={deleteConfirmText}
                            onChangeText={setDeleteConfirmText}
                            placeholder="Type DELETE"
                            placeholderTextColor={colors.textTertiary}
                            autoCapitalize="characters"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalDeleteBtn,
                                    (deleteConfirmText !== 'DELETE' || deleting) && styles.modalDeleteBtnDisabled
                                ]}
                                onPress={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.modalDeleteText}>Delete Account</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    // Danger Zone styles
    dangerCard: {
        marginBottom: 24,
        borderColor: colors.danger + '40',
    },
    dangerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dangerInfo: {
        flex: 1,
        marginRight: 16,
    },
    dangerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.danger,
        marginBottom: 4,
    },
    dangerDesc: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    deleteBtn: {
        backgroundColor: colors.danger,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    deleteBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.danger,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    modalList: {
        marginBottom: 8,
        paddingLeft: 8,
    },
    modalListItem: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    modalConfirmLabel: {
        fontSize: 14,
        color: colors.text,
        marginTop: 12,
        marginBottom: 8,
    },
    modalConfirmKeyword: {
        fontWeight: '700',
        color: colors.danger,
    },
    modalInput: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    modalDeleteBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDeleteBtnDisabled: {
        backgroundColor: colors.border,
    },
    modalDeleteText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
