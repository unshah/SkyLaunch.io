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
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, profile, updateProfile, deleteAccount } = useAuthStore();
    const [editingAirport, setEditingAirport] = useState(false);
    const [airportValue, setAirportValue] = useState(profile?.home_airport || '');
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(profile?.full_name || '');
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [resettingPassword, setResettingPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

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
            // The user will be automatically redirected to login page after signout
        }
    };

    const handleResetPassword = () => {
        if (!user?.email) return;

        const sendResetEmail = async () => {
            setResettingPassword(true);
            const { error } = await supabase.auth.resetPasswordForEmail(user.email!);
            setResettingPassword(false);

            if (error) {
                Platform.OS === 'web'
                    ? window.alert('Failed to send reset email: ' + error.message)
                    : Alert.alert('Error', 'Failed to send reset email: ' + error.message);
            } else {
                setResetEmailSent(true);
                Platform.OS === 'web'
                    ? window.alert('Password reset email sent! Check your inbox.')
                    : Alert.alert('Success', 'Password reset email sent! Check your inbox.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Send password reset email to ${user.email}?`)) {
                sendResetEmail();
            }
        } else {
            Alert.alert(
                'Reset Password',
                `Send password reset email to ${user.email}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send', onPress: sendResetEmail },
                ]
            );
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

                {/* Security Section */}
                <Text style={styles.sectionTitle}>Security</Text>
                <Card variant="outlined" style={styles.securityCard}>
                    <View style={styles.securityRow}>
                        <View style={styles.securityInfo}>
                            <Text style={styles.securityLabel}>Password</Text>
                            <Text style={styles.securityDesc}>Send a password reset link to your email</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.resetBtn,
                                (resettingPassword || resetEmailSent) && styles.resetBtnDisabled
                            ]}
                            onPress={handleResetPassword}
                            disabled={resettingPassword || resetEmailSent}
                        >
                            {resettingPassword ? (
                                <ActivityIndicator color={colors.secondary} size="small" />
                            ) : (
                                <Text style={[
                                    styles.resetBtnText,
                                    resetEmailSent && styles.resetBtnTextSent
                                ]}>
                                    {resetEmailSent ? '✓ Email Sent' : 'Reset'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
    nameInput: {
        width: 150,
        textAlign: 'left',
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
    // Security styles
    securityCard: {
        marginBottom: 24,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    securityInfo: {
        flex: 1,
        marginRight: 16,
    },
    securityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    securityDesc: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    resetBtn: {
        backgroundColor: colors.secondary + '15',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    resetBtnDisabled: {
        backgroundColor: colors.success + '15',
    },
    resetBtnText: {
        color: colors.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
    resetBtnTextSent: {
        color: colors.success,
    },
});
