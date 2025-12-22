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
import { PPL_REQUIREMENTS } from '../../constants/trainingData';

export default function FAARequirementsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📋 FAA Requirements</Text>
                <Text style={styles.subtitle}>Private Pilot License (PPL)</Text>

                {/* Overview */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Aeronautical Experience</Text>
                    <Text style={styles.cardText}>
                        Per FAR 61.109, to become a Private Pilot, you must log:
                    </Text>
                    <View style={styles.reqList}>
                        <View style={styles.reqItem}>
                            <Text style={styles.reqValue}>{PPL_REQUIREMENTS.totalHours}h</Text>
                            <Text style={styles.reqLabel}>Total Flight Time</Text>
                        </View>
                        <View style={styles.reqItem}>
                            <Text style={styles.reqValue}>{PPL_REQUIREMENTS.soloHours}h</Text>
                            <Text style={styles.reqLabel}>Solo Flight</Text>
                        </View>
                        <View style={styles.reqItem}>
                            <Text style={styles.reqValue}>{PPL_REQUIREMENTS.nightHours}h</Text>
                            <Text style={styles.reqLabel}>Night Flight</Text>
                        </View>
                        <View style={styles.reqItem}>
                            <Text style={styles.reqValue}>{PPL_REQUIREMENTS.crossCountryHours}h</Text>
                            <Text style={styles.reqLabel}>Cross-Country</Text>
                        </View>
                    </View>
                </Card>

                {/* Eligibility */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Eligibility (FAR 61.103)</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Be at least 17 years old</Text>
                        <Text style={styles.bullet}>• Read, speak, write, and understand English</Text>
                        <Text style={styles.bullet}>• Hold at least a 3rd Class Medical Certificate</Text>
                        <Text style={styles.bullet}>• Pass the FAA Knowledge Test</Text>
                        <Text style={styles.bullet}>• Pass the Practical Test (Checkride)</Text>
                    </View>
                </Card>

                {/* Training Requirements */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Training Requirements</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• 20 hours with a certified instructor</Text>
                        <Text style={styles.bullet}>• 3 hours night flight with 10 takeoffs/landings</Text>
                        <Text style={styles.bullet}>• 3 hours instrument training</Text>
                        <Text style={styles.bullet}>• 3 hours flight test preparation</Text>
                        <Text style={styles.bullet}>• 10 hours solo including 5 hours cross-country</Text>
                        <Text style={styles.bullet}>• One 150nm cross-country with 3 landings</Text>
                    </View>
                </Card>

                {/* Knowledge Test */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Knowledge Test Topics</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Applicable regulations (Part 61, 91)</Text>
                        <Text style={styles.bullet}>• Airspace, ATC procedures</Text>
                        <Text style={styles.bullet}>• Meteorology and weather reports</Text>
                        <Text style={styles.bullet}>• Aircraft performance and systems</Text>
                        <Text style={styles.bullet}>• Navigation and flight planning</Text>
                        <Text style={styles.bullet}>• Aeronautical decision making</Text>
                        <Text style={styles.bullet}>• Aeromedical factors</Text>
                    </View>
                </Card>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>
                    This information is for reference only. Always consult current FAA regulations
                    and your certified flight instructor for the most accurate requirements.
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
    reqList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    reqItem: {
        width: '47%',
        backgroundColor: colors.secondary + '10',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    reqValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.secondary,
    },
    reqLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    bulletList: {
        gap: 8,
    },
    bullet: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    disclaimer: {
        fontSize: 12,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: 24,
        fontStyle: 'italic',
    },
});
