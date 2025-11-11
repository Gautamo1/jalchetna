import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Link, useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ngo');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError('');
    setLoading(true);
    
    try {
      // Validation
      if (!fullName.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      
      if (!phoneNumber.trim()) {
        setError('Please enter your phone number');
        setLoading(false);
        return;
      }
      
      if (!email.trim()) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }
      
      if (!password) {
        setError('Please enter a password');
        setLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: phoneNumber.trim(),
            role: selectedRole
          }
        }
      });
      
      if (error) {
        setError(error.message);
        Alert.alert(
          'Signup Failed',
          error.message,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      // Success!
      if (data?.user) {
        // Get first name for personalized greeting
        const firstName = fullName.trim().split(' ')[0];
        
        Alert.alert(
          `Welcome to JalChetna, ${firstName}! 🎉`, 
          `Your account has been created successfully!\n\nWe've sent a verification email to ${email}. Please check your inbox and verify your account to get started.`,
          [
            {
              text: 'Continue to Login',
              onPress: () => {
                // Small delay for better UX
                setTimeout(() => {
                  router.replace('/login');
                }, 300);
              }
            }
          ]
        );
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      Alert.alert(
        'Error',
        errorMsg,
        [{ text: 'OK' }]
      );
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  }

  const roles = [
    { id: 'govt', label: 'Govt Admin', icon: '🏛️' },
    { id: 'ngo', label: 'NGO / Field Worker', icon: '👥' },
    { id: 'researcher', label: 'Researcher / Academic', icon: '🔬' }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>💧</Text>
          </View>
          <Text style={styles.title}>Create Your JalChetna Account</Text>
          <Text style={styles.subtitle}>Enter your details to get started.</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            placeholderTextColor="#A0AEC0"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Enter your phone number"
            placeholderTextColor="#A0AEC0"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter your email address"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Create Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter a password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm your password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
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
        </View>

        <TouchableOpacity 
          style={[styles.signupButton, loading && styles.signupButtonDisabled]} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginPrompt}>
          <Text style={styles.promptText}>Already have an account? </Text>
          <Link href="/login" style={styles.link}>
            Log in
          </Link>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '400',
  },
  form: {
    marginBottom: 24,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#2D3748',
  },
  eyeIcon: {
    padding: 10,
  },
  eyeText: {
    fontSize: 20,
  },
  error: {
    color: '#E53E3E',
    fontSize: 14,
    marginBottom: 12,
  },
  roleSection: {
    marginBottom: 24,
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
    fontSize: 11,
    color: '#4A5568',
    textAlign: 'center',
    fontWeight: '500',
  },
  roleLabelSelected: {
    color: '#319795',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#319795',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    backgroundColor: '#A0AEC0',
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
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
});
