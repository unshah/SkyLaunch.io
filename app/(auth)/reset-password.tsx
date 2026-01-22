import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        // Validation
        if (!password || !confirmPassword) {
            Platform.OS === 'web'
                ? window.alert('Please fill in all fields')
                : Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Platform.OS === 'web'
                ? window.alert('Password must be at least 6 characters')
                : Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            Platform.OS === 'web'
                ? window.alert('Passwords do not match')
                : Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                throw error;
            }

            Platform.OS === 'web'
                ? window.alert('Password updated successfully!')
                : Alert.alert('Success', 'Password updated successfully!');

            // Navigate to main app
            router.replace('/');
        } catch (error: any) {
            Platform.OS === 'web'
                ? window.alert('Failed to update password: ' + error.message)
                : Alert.alert('Error', 'Failed to update password: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboard}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Set New Password</Text>
                        <Text style={styles.subtitle}>
                            Create a new password for your account. Make sure it's at least 6 characters.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.textTertiary}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.textTertiary}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Button
                            title="Update Password"
                            onPress={handleResetPassword}
                            loading={isLoading}
                            size="large"
                            style={styles.button}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboard: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        justifyContent: 'space-between',
        paddingBottom: 32,
    },
    // Header
    header: {
        marginTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    // Form
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.text,
    },
    eyeButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    eyeIcon: {
        fontSize: 18,
    },
    // Actions
    actions: {
        gap: 20,
    },
    button: {
        width: '100%',
    },
});
