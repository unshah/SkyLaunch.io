import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Linking from 'expo-linking';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            console.log('AuthCallback: Starting auth handling');

            try {
                if (Platform.OS === 'web') {
                    // On web, Supabase sends tokens in the URL hash fragment
                    // e.g., http://localhost:8081/auth/callback#access_token=...&refresh_token=...
                    const hash = window.location.hash;
                    console.log('AuthCallback: URL hash:', hash);

                    if (hash && hash.length > 1) {
                        // Parse the hash fragment
                        const params = new URLSearchParams(hash.substring(1));
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');
                        const type = params.get('type');

                        console.log('AuthCallback: Found tokens:', {
                            hasAccessToken: !!access_token,
                            hasRefreshToken: !!refresh_token,
                            type
                        });

                        if (access_token && refresh_token) {
                            const { error } = await supabase.auth.setSession({
                                access_token,
                                refresh_token,
                            });

                            if (error) {
                                console.error('AuthCallback: Error setting session:', error);
                                router.replace('/(auth)/login');
                                return;
                            }

                            console.log('AuthCallback: Session set successfully');
                            // Clear the hash from URL
                            window.history.replaceState(null, '', window.location.pathname);
                            // Navigate to main app - root layout will handle routing based on onboarding status
                            router.replace('/');
                            return;
                        }
                    }

                    // No hash tokens, check for existing session
                    const { data: { session } } = await supabase.auth.getSession();
                    console.log('AuthCallback: Existing session:', !!session);

                    if (session) {
                        router.replace('/');
                    } else {
                        router.replace('/(auth)/login');
                    }
                } else {
                    // Native app - handle deep links
                    const initialUrl = await Linking.getInitialURL();
                    console.log('AuthCallback: Initial URL:', initialUrl);

                    if (initialUrl) {
                        const parsedUrl = Linking.parse(initialUrl);

                        if (parsedUrl.queryParams) {
                            const { access_token, refresh_token } = parsedUrl.queryParams as {
                                access_token?: string;
                                refresh_token?: string;
                            };

                            if (access_token && refresh_token) {
                                const { error } = await supabase.auth.setSession({
                                    access_token,
                                    refresh_token,
                                });

                                if (error) {
                                    console.error('AuthCallback: Error setting session:', error);
                                    router.replace('/(auth)/login');
                                    return;
                                }

                                router.replace('/');
                                return;
                            }
                        }
                    }

                    // Check for existing session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        router.replace('/');
                    } else {
                        router.replace('/(auth)/login');
                    }
                }
            } catch (error) {
                console.error('AuthCallback: Error:', error);
                router.replace('/(auth)/login');
            }
        };

        handleAuth();

        // Listen for URL changes on native
        if (Platform.OS !== 'web') {
            const subscription = Linking.addEventListener('url', async (event) => {
                console.log('AuthCallback: URL event:', event.url);
                const parsedUrl = Linking.parse(event.url);

                if (parsedUrl.queryParams?.access_token && parsedUrl.queryParams?.refresh_token) {
                    await supabase.auth.setSession({
                        access_token: parsedUrl.queryParams.access_token as string,
                        refresh_token: parsedUrl.queryParams.refresh_token as string,
                    });
                    router.replace('/');
                }
            });

            return () => subscription.remove();
        }
    }, [router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.text}>Verifying your email...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#94A3B8',
    },
});

