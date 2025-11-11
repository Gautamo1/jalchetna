import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'User:', session?.user?.email || 'No user');
      setSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('Redirecting to tabs...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        console.log('Redirecting to login...');
        router.replace('/(auth)/login');
      }
    });

    // Listen for app state changes (background/foreground)
    const appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
      console.log('App state changed from', appState.current, 'to', nextAppState);
      
      // When app goes to background or inactive, sign out
      if (
        appState.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        console.log('App going to background, signing out...');
        await supabase.auth.signOut();
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    console.log('Current segment:', segments[0], 'Has session:', !!session);

    if (session && inAuthGroup) {
      // Redirect to tabs if logged in but on auth screen
      console.log('User logged in, redirecting to tabs...');
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // Redirect to login if not logged in and not on auth screen
      console.log('No session, redirecting to login...');
      router.replace('/(auth)/login');
    }
  }, [session, segments, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#319795" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
});
