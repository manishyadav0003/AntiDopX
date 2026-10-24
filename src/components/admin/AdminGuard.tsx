import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { verifyAdminAuthorization, type AdminAuthCheckResult } from '../../services/adminAuthService';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authResult, setAuthResult] = useState<AdminAuthCheckResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      setChecking(true);
      const res = await verifyAdminAuthorization();
      if (isMounted) {
        setAuthResult(res);
        setChecking(false);
      }
    };

    void check();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Verifying Administrator Credentials...</Text>
        <Text style={styles.loadingSubtext}>Enforcing server-side authorization</Text>
      </View>
    );
  }

  if (!authResult || !authResult.isAuthorized) {
    return (
      <View style={styles.deniedContainer}>
        <View style={styles.iconCircle}>
          <Feather name="shield-off" size={48} color="#EF4444" />
        </View>

        <Text style={styles.deniedTitle}>Administrative Access Restricted</Text>
        <Text style={styles.deniedSubtitle}>
          {authResult?.error || 'This terminal is restricted strictly to designated AntiDopX administrators.'}
        </Text>

        <View style={styles.securityBox}>
          <MaterialCommunityIcons name="security" size={18} color="#64748B" />
          <Text style={styles.securityText}>
            Authorization verified via Firebase Security Rules &amp; Designated Admin Policy. Client-side bypass attempts are blocked.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.replace('/role-selection')}
        >
          <Feather name="arrow-left" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionButtonText}>Return to Clean Sport Portal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/login')}
        >
          <Feather name="log-in" size={18} color="#0EA5E9" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>Sign In with Admin Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
  },
  loadingSubtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
  deniedContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#7F1D1D20',
    borderWidth: 1,
    borderColor: '#EF444450',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  deniedTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  deniedSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 28,
    gap: 10,
  },
  securityText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0EA5E950',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
  },
});
