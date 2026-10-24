import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '../src/firebase/config';
import { createUserProfile } from '../src/firebase/firestoreService';

export default function AthleteDetailsScreen() {
  const { sport } = useLocalSearchParams<{
    sport: string;
  }>();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!age.trim()) {
      Alert.alert('Error', 'Please enter your age');
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    setIsSaving(true);

    const result = await createUserProfile(
      currentUser.uid,
      name.trim(),
      currentUser.email || '',
      age.trim(),
      sport || 'Unknown'
    );

    setIsSaving(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
      return;
    }

    router.replace('/dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Athlete Details</Text>
      <Text style={styles.subtitle}>Complete your profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#94A3B8"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#EAFBFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 999,
    marginTop: 20,
  },
  buttonText: {
    color: '#06B6D4',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
});
