import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  const pathname = usePathname();

  const tabs = [
    { label: 'Overview', route: '/admin/dashboard', icon: 'view-dashboard-outline' },
    { label: 'Users', route: '/admin/users', icon: 'account-group-outline' },
    { label: 'Curriculum', route: '/admin/modules', icon: 'book-open-outline' },
    { label: 'Medicines', route: '/admin/medicines', icon: 'pill' },
    { label: 'Audit Log', route: '/admin/audit', icon: 'shield-check-outline' },
    { label: 'Settings', route: '/admin/settings', icon: 'cog-outline' },
  ];

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View style={styles.titleArea}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/role-selection')}
          >
            <Feather name="arrow-left" size={20} color="#F8FAFC" />
          </TouchableOpacity>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.adminBadge}>
                <Feather name="shield" size={11} color="#0EA5E9" style={{ marginRight: 4 }} />
                <Text style={styles.adminBadgeText}>ADMIN CONTROL</Text>
              </View>
              <View style={styles.securePill}>
                <View style={styles.greenDot} />
                <Text style={styles.secureText}>RESTRICTED</Text>
              </View>
            </View>
            <Text style={styles.titleText}>{title}</Text>
            {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
          </View>
        </View>

        {rightAction ? <View>{rightAction}</View> : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.route;
          return (
            <TouchableOpacity
              key={tab.route}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                if (!isActive) {
                  router.push(tab.route as any);
                }
              }}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={16}
                color={isActive ? '#0EA5E9' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E915',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0EA5E940',
  },
  adminBadgeText: {
    color: '#0EA5E9',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  secureText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabButtonActive: {
    backgroundColor: '#0EA5E915',
    borderColor: '#0EA5E960',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
});
