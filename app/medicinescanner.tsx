import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppBadge } from '../src/components/common/AppBadge';
import { AppButton } from '../src/components/common/AppButton';
import { FeedbackCard } from '../src/components/common/FeedbackCard';
import { auth } from '../src/firebase/config';
import {
  saveMedicineScan,
  scanMedicineBarcode,
  searchMedicines,
  type MedicineLookupResult,
  type MedicineStatus,
} from '../src/firebase/medicineScannerService';
import { useTranslation } from '../src/localization';
import type { AntiDopingStatus } from '../src/types/medicine';

const SAMPLE_MEDS = ['Paracetamol', 'Dolo 650', 'Ventolin', 'Brufen', 'Sudafed', 'Clenbuterol'];

export default function ScannerScreen() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<MedicineLookupResult | null>(null);
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [lastVerified, setLastVerified] = useState<string>('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Animated laser line for scanner reticle
  const laserTranslateY = useSharedValue(0);

  useEffect(() => {
    laserTranslateY.value = withRepeat(
      withTiming(200, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [laserTranslateY]);

  const laserStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: laserTranslateY.value }],
    };
  });

  const mapWadaStatus = (status: AntiDopingStatus): MedicineStatus => {
    switch (status) {
      case 'ALLOWED':
        return 'Allowed';
      case 'USE_WITH_CAUTION':
        return 'Use With Caution';
      case 'PROHIBITED':
        return 'Prohibited';
      default:
        return 'Unknown';
    }
  };

  const handleBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);

    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setSearching(true);
    setError('');
    setSelectedResult(null);

    const scanRes = await scanMedicineBarcode(data);
    setSearching(false);
    setShowCamera(false);

    if (!scanRes.success) {
      setError(scanRes.error);
      return;
    }

    const res = scanRes.data;
    setSelectedResult({
      drugName: res.title,
      status: mapWadaStatus(res.status),
      guidance: res.guidance,
      activeIngredients: res.activeIngredients,
      disclaimer: res.disclaimer,
      source: res.source,
      lastVerified: res.lastVerified,
    });
    setActiveIngredients(res.activeIngredients);
    setDisclaimer(res.disclaimer);
    setSource(res.source || 'AntiDopX Reference Database');
    setLastVerified(res.lastVerified || '2026-01-01');
  }, [scanned]);

  const handleSearch = useCallback(async (textToSearch?: string) => {
    const searchText = (textToSearch !== undefined ? textToSearch : query).trim();
    if (searchText.length < 2) {
      Alert.alert(t.common.error, t.scanner.searchPlaceholder);
      return;
    }

    setSearching(true);
    setError('');
    setSelectedResult(null);
    setSaveSuccess(false);

    const searchRes = await searchMedicines(searchText);
    setSearching(false);

    if (!searchRes.success) {
      setError(searchRes.error);
      return;
    }

    if (searchRes.data.length === 0) {
      setSelectedResult({
        drugName: searchText,
        status: 'Unknown',
        guidance: t.scanner.notFoundDesc,
      });
      setActiveIngredients([]);
      setDisclaimer(t.scanner.disclaimer);
      setSource('Not Found in Verified Database');
      setLastVerified('Unverified');
      return;
    }

    const first = searchRes.data[0];
    setSelectedResult({
      drugName: first.title,
      status: mapWadaStatus(first.status),
      guidance: first.guidance,
      activeIngredients: first.activeIngredients,
      disclaimer: first.disclaimer,
      source: first.source,
      lastVerified: first.lastVerified,
    });
    setActiveIngredients(first.activeIngredients);
    setDisclaimer(first.disclaimer);
    setSource(first.source || 'WADA / Global DRO Reference');
    setLastVerified(first.lastVerified || '2026-01-01');
  }, [query, t]);

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !selectedResult) {
      Alert.alert(t.common.error, 'Sign in to save medicines to your library.');
      return;
    }

    setIsSaving(true);
    const saveRes = await saveMedicineScan(currentUser.uid, selectedResult);
    setIsSaving(false);

    if (!saveRes.success) {
      Alert.alert(t.common.error, saveRes.error);
      return;
    }

    if (saveRes.data.duplicate) {
      Alert.alert(t.scanner.alreadySaved, 'This item is already stored in your athlete medicine library.');
      return;
    }

    setSaveSuccess(true);
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    Alert.alert(
      t.common.saved,
      saveRes.data.xpAwarded > 0
        ? `${t.scanner.saveSuccess} (+${saveRes.data.xpAwarded} XP awarded!)`
        : t.scanner.saveSuccess
    );
  };

  const getBadgeVariant = (status: MedicineStatus): 'allowed' | 'caution' | 'prohibited' | 'unknown' => {
    switch (status) {
      case 'Allowed':
        return 'allowed';
      case 'Use With Caution':
        return 'caution';
      case 'Prohibited':
        return 'prohibited';
      default:
        return 'unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t.scanner.title}</Text>

        <TouchableOpacity
          onPress={() => router.push('/ai-coach' as any)}
          style={styles.aiButton}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#06B6D4" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Scanner Window / Camera */}
        <View style={styles.scannerWrapper}>
          {showCamera ? (
            <View style={styles.cameraBox}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: [
                    'qr',
                    'ean13',
                    'ean8',
                    'upc_a',
                    'upc_e',
                    'code128',
                    'code39',
                  ],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
              {/* Overlay target frame */}
              <View style={styles.reticleFrame}>
                <Animated.View style={[styles.laserLine, laserStyle]} />
              </View>

              <TouchableOpacity
                style={styles.closeCameraButton}
                onPress={() => {
                  setShowCamera(false);
                  setScanned(false);
                }}
              >
                <Text style={styles.closeCameraText}>{t.scanner.closeCamera}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.scannerPlaceholder}
              activeOpacity={0.85}
              onPress={async () => {
                if (!permission?.granted) {
                  const res = await requestPermission();
                  if (!res.granted) {
                    Alert.alert('Permission Denied', 'Camera access is required to scan medicine barcodes.');
                    return;
                  }
                }
                setScanned(false);
                setShowCamera(true);
              }}
            >
              <View style={styles.scannerIconCircle}>
                <MaterialCommunityIcons name="barcode-scan" size={48} color="#06B6D4" />
              </View>
              <Text style={styles.scannerPlaceholderTitle}>{t.scanner.openCamera}</Text>
              <Text style={styles.scannerPlaceholderSubtitle}>{t.scanner.instructions}</Text>
            </TouchableOpacity>
          )}

          {searching ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#06B6D4" size="small" />
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : null}
        </View>

        {/* Manual Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionLabel}>{t.scanner.manualSearch}</Text>
          <View style={styles.searchInputRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={t.scanner.searchPlaceholder}
              placeholderTextColor="#64748B"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
            />
            {query ? (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setQuery('')}
              >
                <Feather name="x" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          <AppButton
            title={t.scanner.checkMedicine}
            onPress={() => handleSearch()}
            loading={searching}
            style={{ marginTop: 10 }}
          />

          {/* Quick sample chips */}
          <View style={styles.chipsRow}>
            {SAMPLE_MEDS.map((med) => (
              <TouchableOpacity
                key={med}
                style={styles.chip}
                onPress={() => {
                  setQuery(med);
                  void handleSearch(med);
                }}
              >
                <Text style={styles.chipText}>{med}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <FeedbackCard
            type="error"
            title={t.common.error}
            description={error}
            actionLabel={t.common.retry}
            onAction={() => handleSearch()}
          />
        ) : null}

        {/* Verification Result Card */}
        {selectedResult ? (
          <View style={styles.resultCard}>
            <View style={styles.resultTopRow}>
              <AppBadge
                label={selectedResult.status.toUpperCase()}
                variant={getBadgeVariant(selectedResult.status)}
              />
              {source ? (
                <Text style={styles.sourceText} numberOfLines={1}>
                  {source}
                </Text>
              ) : null}
            </View>

            <Text style={styles.resultMedicineName}>
              {selectedResult.drugName}
            </Text>

            {/* Active Ingredients List */}
            {activeIngredients.length > 0 ? (
              <View style={styles.ingredientsBox}>
                <Text style={styles.ingredientsHeader}>
                  {t.scanner.activeIngredients}:
                </Text>
                {activeIngredients.map((item, index) => (
                  <Text key={`${item}-${index}`} style={styles.ingredientItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* Official Guidance */}
            <View style={styles.guidanceBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Feather name="file-text" size={14} color="#0284C7" style={{ marginRight: 6 }} />
                <Text style={styles.guidanceTitle}>Anti-Doping Assessment:</Text>
              </View>
              <Text style={styles.guidanceText}>{selectedResult.guidance}</Text>
            </View>

            {/* Safety Disclaimer */}
            <View style={styles.disclaimerBox}>
              <MaterialIcons name="shield" size={18} color="#D97706" style={{ marginTop: 2 }} />
              <Text style={styles.disclaimerText}>
                {disclaimer || t.scanner.disclaimer}
              </Text>
            </View>

            {lastVerified ? (
              <Text style={styles.verifiedDate}>
                {t.scanner.lastVerified}: {lastVerified}
              </Text>
            ) : null}

            {/* Actions: Save to Library & Ask AI Coach */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.saveBtn, saveSuccess && styles.savedBtn]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {saveSuccess ? t.common.saved : t.scanner.saveToLibrary}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.askAiBtn}
                onPress={() => {
                  router.push({
                    pathname: '/ai-coach',
                    params: {
                      initialQuestion: `Can you explain the anti-doping status and risks of ${selectedResult.drugName}?`,
                    },
                  } as any);
                }}
              >
                <MaterialCommunityIcons name="robot" size={18} color="#06B6D4" />
                <Text style={styles.askAiBtnText}>{t.dashboard.askAi}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Global Reference Info Card */}
        <View style={styles.infoCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Feather name="shield" size={16} color="#0284C7" style={{ marginRight: 6 }} />
            <Text style={styles.infoTitle}>Official Reference Resources</Text>
          </View>
          <Text style={styles.infoText}>
            AntiDopX cross-references active ingredients against the World Anti-Doping Agency (WADA) International Standard Prohibited List and National Anti-Doping Organization guidelines.
          </Text>
          <Text style={styles.infoSubtext}>
            Always verify prescription formulations with Global DRO (globaldro.com) or certified sports medical doctors before high-stakes competitions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  scannerWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraBox: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  reticleFrame: {
    position: 'absolute',
    top: 35,
    left: '15%',
    width: '70%',
    height: 210,
    borderWidth: 2,
    borderColor: '#06B6D4',
    borderRadius: 16,
    overflow: 'hidden',
  },
  laserLine: {
    height: 3,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  closeCameraButton: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeCameraText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scannerPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(6,182,212,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scannerPlaceholderTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  scannerPlaceholderSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    color: '#06B6D4',
    fontWeight: '600',
    fontSize: 14,
  },
  searchSection: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  searchInputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  clearBtn: {
    position: 'absolute',
    right: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    marginBottom: 20,
  },
  resultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceText: {
    color: '#94A3B8',
    fontSize: 11,
    maxWidth: '50%',
  },
  resultMedicineName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  ingredientsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  ingredientsHeader: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  ingredientItem: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
  },
  guidanceBox: {
    marginBottom: 14,
  },
  guidanceTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  guidanceText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(217,119,6,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.3)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  disclaimerText: {
    color: '#FDE68A',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  verifiedDate: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBtn: {
    backgroundColor: '#10B981',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  askAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#06B6D4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  askAiBtnText: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  infoSubtext: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
});
