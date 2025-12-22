import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Platform,
    Alert,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useFlightLogStore } from '../../stores/flightLogStore';
import { useAuthStore } from '../../stores/authStore';
import type { FlightConditions } from '../../types';

// Cross-platform alert helper
const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

const CONDITIONS: { value: FlightConditions; label: string; emoji: string }[] = [
    { value: 'vfr', label: 'VFR', emoji: '☀️' },
    { value: 'ifr', label: 'IFR', emoji: '☁️' },
    { value: 'night', label: 'Night', emoji: '🌙' },
];

export default function LogFlightScreen() {
    const router = useRouter();
    const { addFlightLog } = useFlightLogStore();
    const { profile } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [flightDate, setFlightDate] = useState(new Date().toISOString().split('T')[0]);
    const [departureAirport, setDepartureAirport] = useState(profile?.home_airport || '');
    const [arrivalAirport, setArrivalAirport] = useState('');
    const [durationHours, setDurationHours] = useState('');
    const [instructorName, setInstructorName] = useState('');
    const [aircraftType, setAircraftType] = useState('');
    const [aircraftRegistration, setAircraftRegistration] = useState('');
    const [conditions, setConditions] = useState<FlightConditions>('vfr');
    const [isSolo, setIsSolo] = useState(false);
    const [isCrossCountry, setIsCrossCountry] = useState(false);
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        // Validation
        if (!departureAirport) {
            showAlert('Error', 'Please enter a departure airport');
            return;
        }
        if (!durationHours || parseFloat(durationHours) <= 0) {
            showAlert('Error', 'Please enter flight duration');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await addFlightLog({
                flight_date: flightDate,
                departure_airport: departureAirport.toUpperCase(),
                arrival_airport: arrivalAirport.toUpperCase() || departureAirport.toUpperCase(),
                duration_hours: parseFloat(durationHours),
                instructor_name: instructorName || null,
                aircraft_type: aircraftType || null,
                aircraft_registration: aircraftRegistration.toUpperCase() || null,
                conditions,
                is_solo: isSolo,
                is_cross_country: isCrossCountry,
                notes: notes || null,
            } as any);

            if (error) {
                showAlert('Error', error.message);
            } else {
                router.back();
            }
        } catch (error: any) {
            showAlert('Error', error.message || 'Failed to log flight');
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
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Log Flight</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Date */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Flight Date</Text>
                            <TextInput
                                style={styles.input}
                                value={flightDate}
                                onChangeText={setFlightDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>

                        {/* Airports */}
                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>Departure</Text>
                                <TextInput
                                    style={styles.input}
                                    value={departureAirport}
                                    onChangeText={(t) => setDepartureAirport(t.toUpperCase())}
                                    placeholder="ICAO"
                                    placeholderTextColor={colors.textTertiary}
                                    autoCapitalize="characters"
                                    maxLength={4}
                                />
                            </View>
                            <Text style={styles.arrow}>→</Text>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>Arrival</Text>
                                <TextInput
                                    style={styles.input}
                                    value={arrivalAirport}
                                    onChangeText={(t) => setArrivalAirport(t.toUpperCase())}
                                    placeholder="Same"
                                    placeholderTextColor={colors.textTertiary}
                                    autoCapitalize="characters"
                                    maxLength={4}
                                />
                            </View>
                        </View>

                        {/* Duration */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Duration (hours)</Text>
                            <TextInput
                                style={styles.input}
                                value={durationHours}
                                onChangeText={setDurationHours}
                                placeholder="1.5"
                                placeholderTextColor={colors.textTertiary}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Aircraft */}
                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>Aircraft Type</Text>
                                <TextInput
                                    style={styles.input}
                                    value={aircraftType}
                                    onChangeText={setAircraftType}
                                    placeholder="C172"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>
                            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                                <Text style={styles.label}>Registration</Text>
                                <TextInput
                                    style={styles.input}
                                    value={aircraftRegistration}
                                    onChangeText={(t) => setAircraftRegistration(t.toUpperCase())}
                                    placeholder="N12345"
                                    placeholderTextColor={colors.textTertiary}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        {/* Instructor */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Instructor Name (optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={instructorName}
                                onChangeText={setInstructorName}
                                placeholder="CFI Name"
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>

                        {/* Conditions */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Flight Conditions</Text>
                            <View style={styles.conditionsRow}>
                                {CONDITIONS.map((cond) => (
                                    <TouchableOpacity
                                        key={cond.value}
                                        style={[
                                            styles.conditionBtn,
                                            conditions === cond.value && styles.conditionBtnActive,
                                        ]}
                                        onPress={() => setConditions(cond.value)}
                                    >
                                        <Text style={styles.conditionEmoji}>{cond.emoji}</Text>
                                        <Text style={[
                                            styles.conditionLabel,
                                            conditions === cond.value && styles.conditionLabelActive,
                                        ]}>
                                            {cond.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Checkboxes */}
                        <View style={styles.checkboxRow}>
                            <TouchableOpacity
                                style={[styles.checkbox, isSolo && styles.checkboxActive]}
                                onPress={() => setIsSolo(!isSolo)}
                            >
                                <Text style={styles.checkboxIcon}>{isSolo ? '✓' : ''}</Text>
                                <Text style={styles.checkboxLabel}>Solo Flight</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.checkbox, isCrossCountry && styles.checkboxActive]}
                                onPress={() => setIsCrossCountry(!isCrossCountry)}
                            >
                                <Text style={styles.checkboxIcon}>{isCrossCountry ? '✓' : ''}</Text>
                                <Text style={styles.checkboxLabel}>Cross-Country</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Notes */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Notes (optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Flight notes, lessons learned..."
                                placeholderTextColor={colors.textTertiary}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <Button
                        title="Save Flight"
                        onPress={handleSubmit}
                        loading={isLoading}
                        size="large"
                    />
                </ScrollView>
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
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
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
    form: {
        marginBottom: 24,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.text,
    },
    textarea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    arrow: {
        fontSize: 20,
        color: colors.textSecondary,
        marginHorizontal: 12,
        marginBottom: 20,
    },
    conditionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    conditionBtn: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    conditionBtnActive: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '10',
    },
    conditionEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    conditionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    conditionLabelActive: {
        color: colors.secondary,
    },
    checkboxRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    checkbox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: colors.border,
    },
    checkboxActive: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '10',
    },
    checkboxIcon: {
        width: 20,
        height: 20,
        fontSize: 16,
        fontWeight: '700',
        color: colors.secondary,
        textAlign: 'center',
        marginRight: 8,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
});
