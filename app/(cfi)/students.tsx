import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Card } from '../../components/ui';
import { colors } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { useCFIStore } from '../../stores/cfiStore';
import type { StudentCFILink } from '../../types';

export default function StudentsScreen() {
    const router = useRouter();
    const { cfiProfile } = useAuthStore();
    const { students, fetchStudents, generateInviteCode, isLoading } = useCFIStore();
    const [refreshing, setRefreshing] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(cfiProfile?.invite_code || null);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchStudents();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudents();
        setRefreshing(false);
    };

    const handleGenerateCode = async () => {
        const code = await generateInviteCode();
        if (code) {
            setInviteCode(code);
        }
    };

    const getStatusColor = (student: StudentCFILink) => {
        const profile = student.student;
        if (!profile) return colors.textSecondary;

        // Simple status calculation - could be enhanced
        const hours = profile.current_flight_hours || 0;
        if (hours >= 30) return colors.success;
        if (hours >= 15) return colors.warning;
        return colors.textSecondary;
    };

    const filteredStudents = students.filter(s =>
        s.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>👨‍✈️ My Students</Text>
                    <Text style={styles.subtitle}>{students.length} active students</Text>
                </View>

                {/* Invite Code Card */}
                <Card variant="elevated" style={styles.inviteCard}>
                    <Text style={styles.inviteLabel}>Student Invite Code</Text>
                    {inviteCode ? (
                        <View style={styles.codeRow}>
                            <Text style={styles.inviteCode}>{inviteCode}</Text>
                            <TouchableOpacity
                                style={styles.regenerateBtn}
                                onPress={handleGenerateCode}
                            >
                                <Text style={styles.regenerateText}>🔄 New</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.generateBtn}
                            onPress={handleGenerateCode}
                        >
                            <Text style={styles.generateBtnText}>Generate Invite Code</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.inviteHint}>
                        Share this code with students to connect
                    </Text>
                </Card>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                    <Card variant="outlined" style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>👥</Text>
                        <Text style={styles.emptyTitle}>No Students Yet</Text>
                        <Text style={styles.emptyText}>
                            Share your invite code with students to get started
                        </Text>
                    </Card>
                ) : (
                    filteredStudents.map((link) => {
                        const student = link.student;
                        if (!student) return null;

                        return (
                            <TouchableOpacity
                                key={link.id}
                                onPress={() => router.push({
                                    pathname: '/(cfi)/student-detail',
                                    params: { studentId: student.id, studentName: student.full_name }
                                })}
                            >
                                <Card variant="outlined" style={styles.studentCard}>
                                    <View style={styles.studentRow}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(link) }]} />
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>
                                                {student.full_name || 'Unknown'}
                                            </Text>
                                            <Text style={styles.studentHours}>
                                                {student.current_flight_hours || 0} hours • {student.home_airport || 'No airport'}
                                            </Text>
                                        </View>
                                        <Text style={styles.arrow}>→</Text>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        );
                    })
                )}
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
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    // Invite Card
    inviteCard: {
        marginBottom: 20,
        alignItems: 'center',
    },
    inviteLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    inviteCode: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.secondary,
        letterSpacing: 4,
    },
    regenerateBtn: {
        padding: 8,
    },
    regenerateText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    generateBtn: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    generateBtnText: {
        color: 'white',
        fontWeight: '600',
    },
    inviteHint: {
        fontSize: 12,
        color: colors.textTertiary,
        marginTop: 8,
    },
    // Search
    searchContainer: {
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    // Empty State
    emptyCard: {
        alignItems: 'center',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Student Card
    studentCard: {
        marginBottom: 12,
    },
    studentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    studentHours: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    arrow: {
        fontSize: 18,
        color: colors.textSecondary,
    },
});
