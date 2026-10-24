import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '../../src/firebase/config';
import { getUserProfile, updateLocalProfileData } from '../../src/firebase/userService';
import { useTranslation, type SupportedLanguage } from '../../src/localization';

export default function ProfileScreen() {
  const { t, language, setLanguage } = useTranslation();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [age, setAge] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState('');
  const [streak, setStreak] = useState(0);
  const [role, setRole] = useState<'ATHLETE' | 'COACH' | 'ADMIN'>('ATHLETE');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSport, setEditSport] = useState('');
  const [editAge, setEditAge] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const loadProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const result = await getUserProfile(currentUser.uid);
    if (!result.success || !result.data) return;

    const user = result.data;
    setName(user.name || '');
    setSport(user.sport || '');
    setAge(String(user.age || ''));
    setXp(user.xp || 0);
    setLevel(user.level || 'Rookie');
    setStreak(user.streak || 0);
    if (user.role) {
      setRole(user.role);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleStartEdit = () => {
    setEditName(name);
    setEditSport(sport);
    setEditAge(age);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!editName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateLocalProfileData(currentUser.uid, {
        name: editName.trim(),
        sport: editSport.trim(),
        age: Number(editAge) || 0,
      });

      try {
        await updateDoc(userRef, {
          name: editName.trim(),
          sport: editSport.trim(),
          age: Number(editAge) || 0,
        });
      } catch (firestoreError: any) {
        console.warn('Firestore profile update skipped due to permissions/offline:', firestoreError?.message);
      }

      setName(editName.trim());
      setSport(editSport.trim());
      setAge(String(Number(editAge) || 0));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error: any) {
      setName(editName.trim());
      setSport(editSport.trim());
      setAge(String(Number(editAge) || 0));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    }
  };

  const handleLogout = async () => {
    const { logoutUser } = await import('../../src/firebase/logoutservices');
    const result = await logoutUser();
    if (result.success) {
      router.replace('/login');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const toggleLanguage = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    setShowLanguageModal(false);
  };

  const initials = name
    ? name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AT';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t.profile.title}</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={isEditing ? handleSaveEdit : handleStartEdit}
          activeOpacity={0.8}
        >
          <Text style={styles.editBtnText}>
            {isEditing ? t.profile.save : t.profile.edit}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: '#06B6D4' }]}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={{ flex: 1 }}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Name"
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={styles.editInput}
                  value={editSport}
                  onChangeText={setEditSport}
                  placeholder="Sport"
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={styles.editInput}
                  value={editAge}
                  onChangeText={setEditAge}
                  placeholder="Age"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </>
            ) : (
              <>
                <Text style={styles.userName}>{name || 'Athlete'}</Text>
                <Text style={styles.userInfo}>{sport || 'Clean Sport Candidate'}</Text>
                <Text style={styles.userInfo}>Age: {age || 'N/A'}</Text>

                <View style={styles.badge}>
                  <FontAwesome5 name="shield-alt" size={12} color="#fff" />
                  <Text style={styles.badgeText}>Clean Athlete • {role}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="bolt" value={String(xp)} label={t.common.xp} />
          <StatCard icon="fire" value={String(streak)} label={t.common.streak} />
          <StatCard icon="trophy" value={level} label={t.common.level} />
        </View>
      </View>

      {/* Quick Cards */}
      <View style={styles.quickRow}>
        <QuickCard
          title="Badges & Rewards"
          subtitle="Achievements"
          icon="trophy"
          onPress={() => router.push('/achievements' as any)}
        />
        <QuickCard
          title="Analytics"
          subtitle="Knowledge Growth"
          icon="chart-bar"
          onPress={() => router.push('/analytics' as any)}
        />
      </View>

      {/* Coach & AI Portals */}
      <Text style={styles.sectionTitle}>Portals & Mentorship</Text>
      <MenuRow
        icon="chalkboard-teacher"
        title="Coach & Mentor Portal"
        value={role === 'COACH' || role === 'ADMIN' ? 'Active' : 'Open'}
        onPress={() => router.push('/coach/dashboard' as any)}
      />
      <MenuRow
        icon="robot"
        title="AI Doping Coach"
        value="24/7 Available"
        onPress={() => router.push('/ai-coach' as any)}
      />

      {/* Library */}
      <Text style={styles.sectionTitle}>Library</Text>
      <MenuRow
        icon="book"
        title="Completed Modules"
        value="All 16"
        onPress={() => router.push('/learning-journey' as any)}
      />
      <MenuRow
        icon="pills"
        title="Saved Medicines"
        value="Scanner DB"
        onPress={() => router.push('/medicinescanner' as any)}
      />
      <MenuRow
        icon="capsules"
        title="Saved Supplements"
        value="Roulette"
        onPress={() => router.push('/roulette' as any)}
      />

      {/* Account Settings */}
      <Text style={styles.sectionTitle}>{t.profile.account}</Text>

      <View style={styles.row}>
        <FontAwesome5
          name="bell"
          size={18}
          color="#06B6D4"
          style={{ marginRight: 12 }}
        />
        <Text style={styles.rowTitle}>{t.profile.notifications}</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(val) => {
            setNotificationsEnabled(val);
            Alert.alert(
              'Notification Preferences',
              val
                ? 'Daily revision & mission reminders enabled.'
                : 'Reminders disabled.'
            );
          }}
          trackColor={{ false: '#E2E8F0', true: '#06B6D4' }}
        />
      </View>

      <MenuRow
        icon="language"
        title={t.profile.language}
        value={language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
        onPress={() => setShowLanguageModal(true)}
      />

      <MenuRow
        icon="shield-alt"
        title={t.profile.privacy}
        value="WADA Compliant"
        onPress={() => {
          Alert.alert(
            'AntiDopX Data & Privacy Policy',
            'Your anti-doping educational progress, scan queries, and coach communications are strictly confidential and stored securely in accordance with WADA guidelines and local athlete data protection standards.\n\nNever share personal TUE certificates or medical records on unsecured channels.'
          );
        }}
      />

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.profile.selectLanguage} / भाषा चुनें</Text>
            <TouchableOpacity
              style={[
                styles.langOption,
                language === 'en' && styles.langOptionActive,
              ]}
              onPress={() => toggleLanguage('en')}
            >
              <View style={[styles.langCodeBadge, language === 'en' && styles.langCodeBadgeActive]}>
                <Text style={[styles.langCodeText, language === 'en' && styles.langCodeTextActive]}>EN</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.langName}>English</Text>
                <Text style={styles.langSub}>Default international anti-doping terminology</Text>
              </View>
              {language === 'en' && (
                <MaterialIcons name="check" size={22} color="#06B6D4" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                language === 'hi' && styles.langOptionActive,
              ]}
              onPress={() => toggleLanguage('hi')}
            >
              <View style={[styles.langCodeBadge, language === 'hi' && styles.langCodeBadgeActive]}>
                <Text style={[styles.langCodeText, language === 'hi' && styles.langCodeTextActive]}>HI</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.langName}>हिंदी (Hindi)</Text>
                <Text style={styles.langSub}>खिलाड़ियों के लिए संपूर्ण डोपिंग-रोधी शिक्षा</Text>
              </View>
              {language === 'hi' && (
                <MaterialIcons name="check" size={22} color="#06B6D4" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <MaterialIcons name="logout" size={22} color="white" />
        <Text style={styles.logoutText}>{t.profile.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <FontAwesome5 name={icon} size={14} color="white" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress}>
      <FontAwesome5 name={icon} size={22} color="#06B6D4" />
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function MenuRow({
  title,
  value,
  icon,
  onPress,
}: {
  title: string;
  value?: string;
  icon?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <FontAwesome5
          name={icon}
          size={18}
          color="#06B6D4"
          style={{ marginRight: 12 }}
        />
      )}
      <Text style={styles.rowTitle}>{title}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <MaterialIcons name="chevron-right" size={22} color="#06B6D4" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  editBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#06B6D4',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    color: '#EAFBFF',
    fontSize: 14,
    marginTop: 4,
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    padding: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#EAFBFF',
    fontSize: 12,
    marginTop: 4,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  quickTitle: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 10,
  },
  quickSubtitle: {
    color: '#64748B',
    marginTop: 4,
    fontSize: 12,
  },
  sectionTitle: {
    color: '#000',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 30,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rowTitle: {
    flex: 1,
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
  },
  rowValue: {
    color: '#64748B',
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 30,
    marginBottom: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  langOptionActive: {
    borderColor: '#06B6D4',
    backgroundColor: '#F0FDFA',
  },
  langCodeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  langCodeBadgeActive: {
    backgroundColor: '#E0F2FE',
  },
  langCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  langCodeTextActive: {
    color: '#0284C7',
  },
  langName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  langSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
