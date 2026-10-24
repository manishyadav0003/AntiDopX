import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Shield } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#06B6D4', '#1178d9']}
      style={styles.container}
    >
      <SafeAreaView style={styles.content}>
        <View style={styles.logoBox}>
          <Shield size={40} color="white" />
        </View>

        <Text style={styles.title}>AntiDopX</Text>

        <Text style={styles.subtitle}>
          Learn. Compete. Stay Clean.
        </Text>

        <Text style={styles.description}>
          The anti-doping playbook for the next generation of athletes.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/athlete-register')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <Text style={styles.skip}>
            Skip to demo →
          </Text>
        </TouchableOpacity>

        {/* <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>  */}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },

  description: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    maxWidth: 320,
  },

  button: {
    marginTop: 50,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
  },

  buttonText: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 18,
  },

  skip: {
    marginTop: 22,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },

  /* dots: {
    flexDirection: 'row',
    marginTop: 30,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 24,
    backgroundColor: '#fff',
  }, */
});