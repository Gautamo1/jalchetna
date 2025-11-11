import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function TabsIndex() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    async function checkUserRole() {
      if (hasRedirected.current) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        hasRedirected.current = true;
        router.replace('/(auth)/login');
        return;
      }

      const role = user.user_metadata?.role;
      console.log('User role detected:', role);

      hasRedirected.current = true;

      // Redirect based on role
      if (role === 'govt') {
        // @ts-ignore
        router.replace('/(tabs)/(gov)');
      } else if (role === 'ngo') {
        // @ts-ignore
        router.replace('/(tabs)/(ngo)');
      } else if (role === 'researcher') {
        // @ts-ignore
        router.replace('/(tabs)/(researcher)');
      } else {
        // Default to govt if no role found
        // @ts-ignore
        router.replace('/(tabs)/(gov)');
      }
    }

    checkUserRole();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0891B2" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
