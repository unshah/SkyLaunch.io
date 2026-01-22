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
import { useAuthStore } from '../../stores/authStore';
import { supabase, getPasswordResetRedirectUrl } from '../../lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Platform.OS === 'web'
                ? window.alert('Please enter your email address first')
                : Alert.alert('Email Required', 'Please enter your email address first');
            return;
        }

        const sendResetEmail = async () => {
            setResettingPassword(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: getPasswordResetRedirectUrl(),
            });
            setResettingPassword(false);

            if (error) {
                Platform.OS === 'web'
                    ? window.alert('Failed to send reset email: ' + error.message)
                    : Alert.alert('Error', 'Failed to send reset email: ' + error.message);
            } else {
                Platform.OS === 'web'
                    ? window.alert('Password reset email sent! Check your inbox.')
                    : Alert.alert('Success', 'Password reset email sent! Check your inbox.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Send password reset email to ${email.trim()}?`)) {
                sendResetEmail();
            }
        } else {
            Alert.alert(
                'Reset Password',
                `Send password reset email to ${email.trim()}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send', onPress: sendResetEmail },
                ]
            );
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const { error } = await signIn(email, password);
        if (error) {
            Alert.alert('Login Failed', error.message);
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
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Log in to continue your training journey
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="pilot@example.com"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor={colors.textTertiary}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={handleForgotPassword}
                            disabled={resettingPassword}
                        >
                            <Text style={styles.forgotPasswordText}>
                                {resettingPassword ? 'Sending...' : 'Forgot password?'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Button
                            title="Log In"
                            onPress={handleLogin}
                            loading={isLoading}
                            size="large"
                            style={styles.button}
                        />

                        <View style={styles.signupPrompt}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingTop: 16,
        justifyContent: 'space-between',
        paddingBottom: 32,
    },
    // Header
    header: {
        marginTop: 8,
    },
    backButton: {
        marginBottom: 24,
    },
    backText: {
        color: colors.secondary,
        fontSize: 16,
        fontWeight: '600',
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
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
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
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: colors.secondary,
        fontSize: 14,
        fontWeight: '500',
    },
    // Actions
    actions: {
        gap: 20,
    },
    button: {
        width: '100%',
    },
    signupPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    signupLink: {
        color: colors.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
});
