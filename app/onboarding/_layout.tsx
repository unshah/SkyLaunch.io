import { Stack } from 'expo-router';
import { colors } from '../../constants/Colors';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.secondary,
                headerTitleStyle: { fontWeight: '600' },
                headerBackTitle: 'Back',
            }}
        >
            <Stack.Screen name="goal" options={{ title: 'Training Goal' }} />
            <Stack.Screen name="availability" options={{ title: 'Availability' }} />
            <Stack.Screen name="experience" options={{ title: 'Experience' }} />
            <Stack.Screen name="airport" options={{ title: 'Home Airport' }} />
        </Stack>
    );
}
