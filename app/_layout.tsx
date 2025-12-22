import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/Colors';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, profile, isLoading, isOnboarded } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inCFI = segments[0] === '(cfi)';
    const inMain = segments[0] === '(main)';

    if (!user && !inAuthGroup) {
      // Not signed in, redirect to welcome
      router.replace('/(auth)/welcome');
    } else if (user && !isOnboarded && !inOnboarding) {
      // Signed in but not onboarded
      router.replace('/onboarding/goal');
    } else if (user && isOnboarded && (inAuthGroup || inOnboarding)) {
      // Signed in and onboarded, redirect based on role
      if (profile?.role === 'cfi') {
        router.replace('/(cfi)/students');
      } else {
        router.replace('/(main)/dashboard');
      }
    }
    // Allow navigation between (main) and (cfi) for role switching
  }, [user, profile, isLoading, isOnboarded, segments]);

  // Custom theme with aviation colors
  const SkyLaunchLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.secondary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  const SkyLaunchDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.secondaryLight,
      background: '#0F172A',
      card: '#1E293B',
      text: '#F8FAFC',
      border: '#475569',
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? SkyLaunchDarkTheme : SkyLaunchLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(cfi)" />
      </Stack>
    </ThemeProvider>
  );
}

