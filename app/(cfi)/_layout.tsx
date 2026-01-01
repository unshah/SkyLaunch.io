import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '../../constants/Colors';

export default function CFILayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.secondary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingTop: 8,
                    paddingBottom: 24,
                    height: 100,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="students"
                options={{
                    title: 'Students',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="users" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="cog" size={size} color={color} />
                    ),
                }}
            />
            {/* Hidden screens */}
            <Tabs.Screen
                name="student-detail"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="grade-flight"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="profile"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="availability"
                options={{ href: null }}
            />
        </Tabs>
    );
}
