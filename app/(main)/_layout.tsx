import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '../../constants/Colors';

export default function MainLayout() {
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
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="flight-logs"
                options={{
                    title: 'Flights',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="plane" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="check-square-o" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="line-chart" size={size} color={color} />
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
            {/* Hidden screens (accessible via navigation) */}
            <Tabs.Screen
                name="log-flight"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    href: null, // Hide schedule for now
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    href: null, // Profile screen
                }}
            />
            <Tabs.Screen
                name="faa-requirements"
                options={{
                    href: null, // About screen
                }}
            />
            <Tabs.Screen
                name="help-support"
                options={{
                    href: null, // About screen
                }}
            />
            <Tabs.Screen
                name="privacy-policy"
                options={{
                    href: null, // About screen
                }}
            />
            <Tabs.Screen
                name="availability"
                options={{
                    href: null, // Availability screen
                }}
            />
        </Tabs>
    );
}
