import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useScheduleStore } from '../../stores/scheduleStore';
import type { DayOfWeek, TimeSlot } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
    { label: 'Morning (6-9)', start: '06:00', end: '09:00' },
    { label: 'Mid-Morning (9-12)', start: '09:00', end: '12:00' },
    { label: 'Afternoon (12-3)', start: '12:00', end: '15:00' },
    { label: 'Late Afternoon (3-6)', start: '15:00', end: '18:00' },
    { label: 'Evening (6-9)', start: '18:00', end: '21:00' },
];

export default function CFIAvailabilityScreen() {
    const router = useRouter();
    const { cfiAvailability, fetchCFIAvailability, saveCFIAvailability, isLoading } = useScheduleStore();

    // Grid state: [dayIndex][slotIndex] = true/false
    const [selected, setSelected] = useState<boolean[][]>(
        DAYS.map(() => TIME_SLOTS.map(() => false))
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCFIAvailability();
    }, []);

    // Initialize grid from stored availability
    useEffect(() => {
        if (cfiAvailability.length > 0) {
            const newSelected = DAYS.map(() => TIME_SLOTS.map(() => false));

            cfiAvailability.forEach(slot => {
                const slotIndex = TIME_SLOTS.findIndex(
                    ts => ts.start === slot.start_time && ts.end === slot.end_time
                );
                if (slotIndex >= 0) {
                    newSelected[slot.day_of_week][slotIndex] = true;
                }
            });

            setSelected(newSelected);
        }
    }, [cfiAvailability]);

    const toggleSlot = (dayIndex: number, slotIndex: number) => {
        setSelected(prev => {
            const newSelected = prev.map(row => [...row]);
            newSelected[dayIndex][slotIndex] = !newSelected[dayIndex][slotIndex];
            return newSelected;
        });
    };

    const handleSave = async () => {
        setSaving(true);

        // Convert grid to TimeSlot array
        const slots: TimeSlot[] = [];
        selected.forEach((daySlots, dayIndex) => {
            daySlots.forEach((isSelected, slotIndex) => {
                if (isSelected) {
                    slots.push({
                        dayOfWeek: dayIndex as DayOfWeek,
                        startTime: TIME_SLOTS[slotIndex].start,
                        endTime: TIME_SLOTS[slotIndex].end,
                    });
                }
            });
        });

        const { error } = await saveCFIAvailability(slots);
        setSaving(false);

        if (error) {
            const errorMessage = error.message || 'Failed to save availability';
            Platform.OS === 'web'
                ? window.alert(errorMessage)
                : Alert.alert('Error', errorMessage);
        } else {
            Platform.OS === 'web'
                ? window.alert('Availability saved!')
                : Alert.alert('Success', 'Availability saved!');
            router.back();
        }
    };

    const selectedCount = selected.flat().filter(Boolean).length;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>👨‍✈️ CFI Availability</Text>
                    <Text style={styles.subtitle}>
                        Set times when you can teach ({selectedCount} slots selected)
                    </Text>
                </View>

                {/* Info Card */}
                <Card variant="outlined" style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        💡 Your students will see these time slots when scheduling sessions with you.
                    </Text>
                </Card>

                {/* Time Slot Legend */}
                <View style={styles.legend}>
                    <View style={[styles.legendBox, styles.legendSelected]} />
                    <Text style={styles.legendText}>Available to teach</Text>
                    <View style={[styles.legendBox, styles.legendUnselected]} />
                    <Text style={styles.legendText}>Not available</Text>
                </View>

                {/* Availability Grid */}
                <Card variant="outlined" style={styles.gridCard}>
                    {/* Day Headers */}
                    <View style={styles.dayHeader}>
                        <View style={styles.timeLabel} />
                        {DAYS.map((day, i) => (
                            <View key={i} style={styles.dayCell}>
                                <Text style={styles.dayText}>{day}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Time Rows */}
                    {TIME_SLOTS.map((slot, slotIndex) => (
                        <View key={slotIndex} style={styles.timeRow}>
                            <View style={styles.timeLabel}>
                                <Text style={styles.timeLabelText}>{slot.label}</Text>
                            </View>
                            {DAYS.map((_, dayIndex) => (
                                <TouchableOpacity
                                    key={dayIndex}
                                    style={[
                                        styles.slotCell,
                                        selected[dayIndex][slotIndex] && styles.slotSelected,
                                    ]}
                                    onPress={() => toggleSlot(dayIndex, slotIndex)}
                                >
                                    {selected[dayIndex][slotIndex] && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </Card>

                {/* Save Button */}
                <Button
                    title={saving ? 'Saving...' : 'Save Availability'}
                    onPress={handleSave}
                    disabled={saving}
                    style={styles.saveBtn}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 20,
    },
    backBtn: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
    },
    infoCard: {
        marginBottom: 16,
        backgroundColor: colors.secondaryLight + '15',
    },
    infoText: {
        fontSize: 13,
        color: colors.secondary,
        lineHeight: 20,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    legendBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
    },
    legendSelected: {
        backgroundColor: colors.success,
    },
    legendUnselected: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    legendText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginRight: 16,
    },
    gridCard: {
        marginBottom: 24,
        padding: 0,
        overflow: 'hidden',
    },
    dayHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dayCell: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    timeRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    timeLabel: {
        width: 90,
        paddingVertical: 12,
        paddingHorizontal: 8,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    timeLabelText: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    slotCell: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.border,
        backgroundColor: colors.surface,
    },
    slotSelected: {
        backgroundColor: colors.success,
    },
    checkmark: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    saveBtn: {
        marginTop: 8,
    },
});
