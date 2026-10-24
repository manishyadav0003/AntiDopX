import { FontAwesome5 } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { registerUser, sendForgotPasswordEmail } from '../src/firebase/authService';
import {
  getGoogleWebClientId,
  isGoogleAuthConfigured,
  signInWithDevGoogleAccount,
  signInWithGoogleCredential,
} from '../src/firebase/googleAuthservices';
import { loginUser } from '../src/firebase/loginService';
import { updateDailyStreak } from '../src/firebase/streakService';

WebBrowser.maybeCompleteAuthSession();

export default function AthleteRegisterScreen() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const configuredClientId = getGoogleWebClientId();
  const fallbackClientId = 'antidopx-client.apps.googleusercontent.com';
  const effectiveClientId = configuredClientId || fallbackClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: effectiveClientId,
    webClientId: effectiveClientId,
    androidClientId: effectiveClientId,
    iosClientId: effectiveClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        signInWithGoogleCredential(idToken).then((res) => {
          setIsAuthenticating(false);
          if (res.success) {
            Alert.alert('Success', 'Signed in with Google successfully!');
            router.replace('/dashboard');
          } else {
            Alert.alert('Authentication Error', res.error || 'Failed to complete Google Sign-In.');
          }
        });
      }
    }
  }, [response, router]);

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    setIsAuthenticating(true);

    if (isLogin) {
      const result = await loginUser(email.trim(), password);

      if (!result.success) {
        setIsAuthenticating(false);
        Alert.alert('Login Failed', result.error);
        return;
      }

      await updateDailyStreak(result.user!.uid);
      setIsAuthenticating(false);
      router.replace('/dashboard');
    } else {
      const result = await registerUser(email.trim(), password);
      setIsAuthenticating(false);

      if (!result.success) {
        Alert.alert('Registration Failed', result.error);
        return;
      }

      router.push('/onboarding');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Forgot Password',
        'Please enter your registered email address in the email field above, then tap "Forgot password?".'
      );
      return;
    }

    setIsAuthenticating(true);
    const result = await sendForgotPasswordEmail(email.trim());
    setIsAuthenticating(false);

    if (result.success) {
      Alert.alert('Reset Link Sent', result.message);
    } else {
      Alert.alert('Password Reset Failed', result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleAuthConfigured()) {
      try {
        await promptAsync();
      } catch (err: any) {
        Alert.alert(
          'Google Sign-In Error',
          err?.message || 'Could not launch Google authentication window.'
        );
      }
    } else {
      Alert.alert(
        'Google Sign-In',
        'Google OAuth Client ID is not yet configured in app.json for production.\n\nWould you like to sign in using the AntiDopX Demo Google Athlete account to test the application?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In as Google Athlete',
            onPress: async () => {
              setIsAuthenticating(true);
              const res = await signInWithDevGoogleAccount();
              setIsAuthenticating(false);
              if (res.success) {
                Alert.alert('Welcome', 'Signed in as Google Athlete test account.');
                router.replace('/dashboard');
              } else {
                Alert.alert('Authentication Error', res.error);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome, Athlete</Text>
        <Text style={styles.subtitle}>Start your clean sport journey</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.activeText]}>
              Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.activeText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="athlete@email.com"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {isLogin && (
          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isAuthenticating && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={isAuthenticating}
          activeOpacity={0.8}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isLogin ? 'Login' : 'Start Your Clean Sport Journey'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>OR</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={isAuthenticating}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="google"
            size={18}
            color="#EA4335"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          By continuing you agree to our Anti-Doping Code of Conduct and Terms.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#06B6D4',
    paddingTop: 60,
  },
  back: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 20,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#E2E8F0',
    marginTop: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    minHeight: 700,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF5F8',
    borderRadius: 40,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    color: '#64748B',
    fontWeight: '600',
  },
  activeText: {
    color: '#000',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    marginBottom: 16,
    color: '#0F172A',
  },
  forgot: {
    alignSelf: 'flex-end',
    color: '#00BCEB',
    marginBottom: 20,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#06B6D4',
    padding: 18,
    borderRadius: 35,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  or: {
    textAlign: 'center',
    marginVertical: 24,
    color: '#64748B',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 35,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 24,
    fontSize: 13,
  },
});