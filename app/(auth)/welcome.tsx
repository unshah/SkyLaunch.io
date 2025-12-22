import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[colors.primary, colors.primaryLight, colors.secondary]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Background decoration */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />

                <SafeAreaView style={styles.content}>
                    {/* Logo & Branding */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>✈️</Text>
                        </View>
                        <Text style={styles.appName}>SkyLaunch</Text>
                        <Text style={styles.tagline}>Your Flight Path, Optimized</Text>
                    </View>

                    {/* Features */}
                    <View style={styles.features}>
                        <FeatureItem
                            emoji="🎯"
                            title="AI-Powered Scheduling"
                            description="Smart training plans based on FAA requirements"
                        />
                        <FeatureItem
                            emoji="🌤️"
                            title="Weather Integrated"
                            description="Real-time METAR data for flight planning"
                        />
                        <FeatureItem
                            emoji="📊"
                            title="Progress Tracking"
                            description="Track hours, milestones, and costs"
                        />
                    </View>

                    {/* CTA Buttons */}
                    <View style={styles.cta}>
                        <Button
                            title="Get Started"
                            onPress={() => router.push('/(auth)/signup')}
                            variant="outline"
                            size="large"
                            style={styles.primaryButton}
                            textStyle={styles.primaryButtonText}
                        />
                        <Button
                            title="I Already Have an Account"
                            onPress={() => router.push('/(auth)/login')}
                            variant="ghost"
                            size="large"
                            style={styles.secondaryButton}
                            textStyle={styles.secondaryButtonText}
                        />
                    </View>

                    {/* Trust indicator */}
                    <View style={styles.trust}>
                        <Text style={styles.trustText}>
                            Built by pilots, for pilots 🛩️
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

function FeatureItem({ emoji, title, description }: {
    emoji: string;
    title: string;
    description: string;
}) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>{emoji}</Text>
            <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: width * 0.2,
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingBottom: 32,
    },
    // Decorative elements
    decorCircle1: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: -width * 0.3,
        right: -width * 0.2,
    },
    decorCircle2: {
        position: 'absolute',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        bottom: height * 0.15,
        left: -width * 0.3,
    },
    // Header
    header: {
        alignItems: 'center',
        marginTop: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logoEmoji: {
        fontSize: 40,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.textInverse,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        fontWeight: '500',
    },
    // Features
    features: {
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 16,
    },
    featureEmoji: {
        fontSize: 28,
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textInverse,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    // CTA
    cta: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: colors.textInverse,
    },
    primaryButtonText: {
        color: colors.primary,
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        color: colors.textInverse,
    },
    // Trust
    trust: {
        alignItems: 'center',
    },
    trustText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
    },
});
