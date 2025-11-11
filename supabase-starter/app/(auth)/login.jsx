import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Link, useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ngo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    
    try {
      if (!email.trim()) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }
      
      if (!password) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      console.log('Attempting login for:', email.trim().toLowerCase());

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        Alert.alert(
          'Login Failed',
          error.message === 'Invalid login credentials' 
            ? 'Incorrect email or password. Please try again.' 
            : error.message,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Success - check if user's role matches selected role
      if (data?.user) {
        console.log('Login successful! User:', data.user.email);
        console.log('User metadata:', data.user.user_metadata);
        
        const userRole = data.user.user_metadata?.role;
        console.log('User registered role:', userRole, 'Selected role:', selectedRole);
        
        // Validate role matches
        if (!userRole) {
          const errorMsg = 'User role not found. Please contact support.';
          setError(errorMsg);
          Alert.alert(
            'Role Error',
            errorMsg,
            [{ text: 'OK' }]
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        if (userRole !== selectedRole) {
          const roleNames = {
            'govt': 'Government Admin',
            'ngo': 'NGO/Field Worker',
            'researcher': 'Researcher'
          };
          const errorMsg = `You are registered as ${roleNames[userRole]}. Please select the correct role.`;
          setError(errorMsg);
          Alert.alert(
            'Wrong Role Selected',
            errorMsg,
            [{ text: 'OK' }]
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        // Update last selected role
        await supabase.auth.updateUser({
          data: { last_selected_role: selectedRole }
        });
        
        // Redirect based on role
        console.log('Redirecting to appropriate dashboard for role:', userRole);
        setTimeout(() => {
          // Just redirect to tabs, index will handle role-based routing
          router.replace('/(tabs)');
          setLoading(false);
        }, 500);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      Alert.alert(
        'Error',
        errorMsg,
        [{ text: 'OK' }]
      );
      console.error('Login exception:', err);
      setLoading(false);
    }
  }

  const roles = [
    { id: 'govt', label: 'Govt. Admin', icon: '🏛️' },
    { id: 'ngo', label: 'NGO / Field Worker', icon: '👥' },
    { id: 'researcher', label: 'Researcher', icon: '🔬' }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>💧</Text>
          </View>
          <Text style={styles.title}>JalChetna</Text>
          <Text style={styles.subtitle}>Real-time groundwater intelligence</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="your@example.com"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="········"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupPrompt}>
            <Text style={styles.promptText}>Don't have an account? </Text>
            <Link href="/signup" style={styles.link}>
              Sign up
            </Link>
          </View>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>Select Your Role</Text>
          <View style={styles.roleContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <Text style={[
                  styles.roleLabel,
                  selectedRole === role.id && styles.roleLabelSelected
                ]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our{' '}
            <Text style={styles.disclaimerLink}>Terms of Service</Text>
            {'\n'}and <Text style={styles.disclaimerLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4299E1',
    fontWeight: '500',
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    color: '#2D3748',
  },
  error: {
    color: '#E53E3E',
    fontSize: 14,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#319795',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0AEC0',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  promptText: {
    color: '#718096',
    fontSize: 14,
  },
  link: {
    color: '#319795',
    fontSize: 14,
    fontWeight: '600',
  },
  roleSection: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleCardSelected: {
    borderColor: '#319795',
    backgroundColor: '#E6FFFA',
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  roleLabelSelected: {
    color: '#319795',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
  disclaimerLink: {
    color: '#319795',
    fontWeight: '600',
  },
});
