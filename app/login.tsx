import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
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

import { sendForgotPasswordEmail } from '../src/firebase/authService';
import { evaluateAchievements } from '../src/firebase/achievementService';
import {
  getGoogleWebClientId,
  isGoogleAuthConfigured,
  signInWithDevGoogleAccount,
  signInWithGoogleCredential,
} from '../src/firebase/googleAuthservices';
import { loginUser } from '../src/firebase/loginService';
import { updateDailyStreak } from '../src/firebase/streakService';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
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
            Alert.alert('Welcome!', 'Signed in with Google successfully.');
            router.replace('/dashboard');
          } else {
            Alert.alert('Authentication Error', res.error || 'Failed to complete Google Sign-In.');
          }
        });
      }
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    setIsAuthenticating(true);
    const result = await loginUser(email.trim(), password);

    if (!result.success) {
      setIsAuthenticating(false);
      Alert.alert('Login Error', result.error);
      return;
    }

    const streakResult = await updateDailyStreak(result.user!.uid);

    if (!streakResult.success) {
      setIsAuthenticating(false);
      Alert.alert('Streak Error', streakResult.error);
      return;
    }

    await evaluateAchievements(result.user!.uid);
    setIsAuthenticating(false);
    router.replace('/dashboard');
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
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#06B6D4" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>AntiDopX</Text>
        <Text style={styles.subtitle}>Sign in to your athlete account</Text>

        <TextInput
          placeholder="Email address"
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
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={handleForgotPassword}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isAuthenticating && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isAuthenticating}
          activeOpacity={0.8}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

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
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/athlete-register')}
        >
          <Text style={styles.signupText}>
            Don&apos;t have an athlete account?{' '}
            <Text style={styles.signupHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    padding: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    color: '#06B6D4',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#0F172A',
    color: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#06B6D4',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#06B6D4',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  orText: {
    color: '#64748B',
    marginHorizontal: 12,
    fontWeight: '600',
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  signupHighlight: {
    color: '#06B6D4',
    fontWeight: '700',
  },
});
