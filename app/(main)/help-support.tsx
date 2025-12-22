import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { colors } from '../../constants/Colors';

export default function HelpSupportScreen() {
    const router = useRouter();

    const openEmail = () => {
        Linking.openURL('mailto:support@skylaunch.io?subject=SkyLaunch Support Request');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>❓ Help & Support</Text>
                <Text style={styles.subtitle}>We're here to help you fly!</Text>

                {/* Contact */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>📧 Contact Us</Text>
                    <Text style={styles.cardText}>
                        Have questions, feedback, or need assistance? We'd love to hear from you!
                    </Text>
                    <Button
                        title="Email Support"
                        onPress={openEmail}
                        variant="outline"
                    />
                </Card>

                {/* FAQ */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Frequently Asked Questions</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I log a flight?</Text>
                        <Text style={styles.faqAnswer}>
                            Go to the Flights tab, tap "+ Log New Flight", fill in your flight details, and tap Save.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I track my training progress?</Text>
                        <Text style={styles.faqAnswer}>
                            Use the Tasks tab to mark training items as completed. The Progress tab shows your overall progress toward PPL requirements.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Is my data secure?</Text>
                        <Text style={styles.faqAnswer}>
                            Yes! Your data is stored securely using Supabase with row-level security. Only you can access your data.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Can I use SkyLaunch for ratings beyond PPL?</Text>
                        <Text style={styles.faqAnswer}>
                            Currently, SkyLaunch focuses on Private Pilot training. Instrument and Commercial ratings are coming soon!
                        </Text>
                    </View>

                    <View style={[styles.faqItem, { borderBottomWidth: 0 }]}>
                        <Text style={styles.faqQuestion}>What weather data do you use?</Text>
                        <Text style={styles.faqAnswer}>
                            We fetch live METAR data from AviationWeather.gov to show current conditions at your home airport.
                        </Text>
                    </View>
                </Card>

                {/* Tips */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>💡 Training Tips</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Fly regularly - aim for 2-3 sessions per week</Text>
                        <Text style={styles.bullet}>• Review ground material before each flight</Text>
                        <Text style={styles.bullet}>• Chair fly procedures at home</Text>
                        <Text style={styles.bullet}>• Keep detailed notes after each lesson</Text>
                        <Text style={styles.bullet}>• Study weather patterns at your home airport</Text>
                    </View>
                </Card>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appInfoText}>SkyLaunch v1.0.0</Text>
                    <Text style={styles.appInfoText}>Made with ✈️ for student pilots</Text>
                </View>
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
    subtitle: {
        fontSize: 16,
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
    cardText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: 16,
    },
    faqItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
    },
    faqAnswer: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 21,
    },
    bulletList: {
        gap: 8,
    },
    bullet: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: 24,
    },
    appInfoText: {
        fontSize: 12,
        color: colors.textTertiary,
        marginBottom: 4,
    },
});
