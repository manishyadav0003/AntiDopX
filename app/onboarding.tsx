import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <MaterialCommunityIcons name="shield-check" size={54} color="#0284C7" />
      </View>

      <Text style={styles.title}>
        Protect Your Career
      </Text>

      <Text style={styles.subtitle}>
        Many athletes fail doping tests because
        they don{"'"}t know the rules.
      </Text>

      <Text style={styles.description}>
        Learn how to identify banned substances,
        verify medicines, and make safe decisions.
      </Text>

      <TouchableOpacity
  style={styles.button}
  onPress={() => {
    router.push('/role-selection');
  }}
>
        <Text style={styles.buttonText}>
          I{"'"}m Ready
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14C8E8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 46,
  },

  subtitle: {
    color: '#EAFBFF',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 30,
    fontWeight: '500',
  },

  description: {
    color: '#D9F6FC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 26,
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 999,
    minWidth: 220,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonText: {
    color: '#14C8E8',
    fontSize: 18,
    fontWeight: '700',
  },
});
