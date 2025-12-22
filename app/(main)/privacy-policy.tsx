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

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const lastUpdated = 'December 22, 2024';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📜 Privacy Policy</Text>
                <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>

                {/* Introduction */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Introduction</Text>
                    <Text style={styles.cardText}>
                        SkyLaunch ("we", "our", or "us") is committed to protecting your privacy.
                        This policy explains how we collect, use, and safeguard your information
                        when you use our mobile application.
                    </Text>
                </Card>

                {/* Data Collection */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Information We Collect</Text>
                    <Text style={styles.sectionSubtitle}>Account Information</Text>
                    <Text style={styles.cardText}>
                        • Email address for authentication{'\n'}
                        • Training preferences and goals{'\n'}
                        • Home airport location (ICAO code only)
                    </Text>

                    <Text style={styles.sectionSubtitle}>Training Data</Text>
                    <Text style={styles.cardText}>
                        • Flight log entries you create{'\n'}
                        • Task completion progress{'\n'}
                        • Training hours and milestones
                    </Text>
                </Card>

                {/* Data Usage */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>How We Use Your Data</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Provide personalized training recommendations</Text>
                        <Text style={styles.bullet}>• Track your progress toward pilot certification</Text>
                        <Text style={styles.bullet}>• Display weather information for your home airport</Text>
                        <Text style={styles.bullet}>• Improve our services and user experience</Text>
                    </View>
                </Card>

                {/* Data Storage */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Data Storage & Security</Text>
                    <Text style={styles.cardText}>
                        Your data is stored securely using Supabase, a trusted cloud database provider.
                        We implement row-level security (RLS) to ensure only you can access your data.
                        All data transmission is encrypted using HTTPS/TLS.
                    </Text>
                </Card>

                {/* Data Sharing */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Data Sharing</Text>
                    <Text style={styles.cardText}>
                        We do NOT sell, rent, or share your personal information with third parties
                        for marketing purposes. Your flight logs and training data are private and
                        only accessible by you.
                    </Text>
                </Card>

                {/* Your Rights */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Your Rights</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Access your data at any time through the app</Text>
                        <Text style={styles.bullet}>• Update or correct your information</Text>
                        <Text style={styles.bullet}>• Delete your account and all associated data</Text>
                        <Text style={styles.bullet}>• Export your flight logs</Text>
                    </View>
                </Card>

                {/* Contact */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Contact Us</Text>
                    <Text style={styles.cardText}>
                        If you have questions about this Privacy Policy or your data,
                        please contact us at:{'\n\n'}
                        📧 privacy@skylaunch.io
                    </Text>
                </Card>

                {/* Footer */}
                <Text style={styles.footer}>
                    By using SkyLaunch, you agree to this Privacy Policy.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    backText: {
        fontSize: 16,
        color: colors.secondary,
        fontWeight: '600',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    lastUpdated: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        marginBottom: 24,
    },
    card: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.secondary,
        marginTop: 8,
        marginBottom: 6,
    },
    cardText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    bulletList: {
        gap: 8,
    },
    bullet: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    footer: {
        fontSize: 12,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: 24,
        fontStyle: 'italic',
    },
});
