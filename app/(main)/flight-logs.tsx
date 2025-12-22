import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FlightLogCard, Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useFlightLogStore } from '../../stores/flightLogStore';
import { PPL_REQUIREMENTS } from '../../constants/trainingData';

// Cross-platform alert helper
const showAlert = (title: string, message: string, buttons?: Array<{ text: string; onPress?: () => void; style?: string }>) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 1) {
            if (window.confirm(`${title}\n\n${message}`)) {
                buttons.find(b => b.style === 'destructive')?.onPress?.();
            }
        } else {
            window.alert(`${title}\n\n${message}`);
            buttons?.[0]?.onPress?.();
        }
    } else {
        Alert.alert(title, message, buttons as any);
    }
};

export default function FlightLogsScreen() {
    const router = useRouter();
    const { flightLogs, isLoading, totalHours, soloHours, crossCountryHours, nightHours, fetchFlightLogs, deleteFlightLog } = useFlightLogStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchFlightLogs();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFlightLogs();
        setRefreshing(false);
    };

    const handleDelete = (id: string) => {
        showAlert(
            'Delete Flight',
            'Are you sure you want to delete this flight log?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteFlightLog(id) },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Flight Log</Text>
                    <Text style={styles.subtitle}>Track your flight hours</Text>
                </View>

                {/* Stats Summary */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{totalHours}</Text>
                        <Text style={styles.statLabel}>Total Hours</Text>
                        <Text style={styles.statTarget}>of {PPL_REQUIREMENTS.totalHours}h</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{soloHours}</Text>
                        <Text style={styles.statLabel}>Solo Hours</Text>
                        <Text style={styles.statTarget}>of {PPL_REQUIREMENTS.soloHours}h</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{crossCountryHours}</Text>
                        <Text style={styles.statLabel}>Cross-Country</Text>
                        <Text style={styles.statTarget}>of {PPL_REQUIREMENTS.crossCountryHours}h</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{nightHours}</Text>
                        <Text style={styles.statLabel}>Night Hours</Text>
                        <Text style={styles.statTarget}>of {PPL_REQUIREMENTS.nightHours}h</Text>
                    </View>
                </View>

                {/* Add Flight Button */}
                <Button
                    title="+ Log New Flight"
                    onPress={() => router.push('/(main)/log-flight')}
                    size="large"
                    style={styles.addButton}
                />

                {/* Flight Logs List */}
                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Recent Flights</Text>

                    {flightLogs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>✈️</Text>
                            <Text style={styles.emptyTitle}>No flights logged yet</Text>
                            <Text style={styles.emptyText}>
                                Start tracking your training by logging your first flight
                            </Text>
                        </View>
                    ) : (
                        flightLogs.map((log: any) => (
                            <FlightLogCard
                                key={log.id}
                                id={log.id}
                                flightDate={log.flight_date}
                                departureAirport={log.departure_airport}
                                arrivalAirport={log.arrival_airport}
                                durationHours={parseFloat(log.duration_hours)}
                                instructorName={log.instructor_name}
                                aircraftType={log.aircraft_type}
                                aircraftRegistration={log.aircraft_registration}
                                conditions={log.conditions || 'vfr'}
                                isSolo={log.is_solo}
                                isCrossCountry={log.is_cross_country}
                                notes={log.notes}
                                onDelete={() => handleDelete(log.id)}
                            />
                        ))
                    )}
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
        paddingBottom: 100,
    },
    header: {
        marginBottom: 20,
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
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    statTarget: {
        fontSize: 11,
        color: colors.textTertiary,
        marginTop: 2,
    },
    addButton: {
        marginBottom: 24,
    },
    listSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
