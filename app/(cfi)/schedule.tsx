import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Card } from '../../components/ui';
import { colors } from '../../constants/Colors';

export default function CFIScheduleScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>📅 Schedule</Text>
                <Text style={styles.subtitle}>Upcoming lessons with students</Text>

                <Card variant="outlined" style={styles.card}>
                    <Text style={styles.emoji}>🚧</Text>
                    <Text style={styles.text}>Coming Soon</Text>
                    <Text style={styles.subtext}>
                        Schedule management will be available in a future update
                    </Text>
                </Card>
            </View>
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
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        marginBottom: 24,
    },
    card: {
        alignItems: 'center',
        padding: 40,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    text: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
