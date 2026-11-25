import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { CustomerApi } from '../services/api';
import { ScanResult } from '../types';
import { CheckIcon, CloseIcon } from '../components/Icons';

const { width } = Dimensions.get('window');

interface ScanScreenProps {
  onScanComplete: () => void;
  onNavigateToRewards: () => void;
  onClose: () => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ onScanComplete, onNavigateToRewards, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleSimulateScan = async () => {
    setScanning(true);
    const res = await CustomerApi.scanQr('gs_token_artisan_counter_9841');
    setScanning(false);
    setScanResult(res);
    setResultModalVisible(true);
  };

  const handleDone = () => {
    setResultModalVisible(false);
    onScanComplete();
  };

  const handleGoToRewards = () => {
    setResultModalVisible(false);
    onNavigateToRewards();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
          <CloseIcon size={18} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Counter Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Viewport & Scanner Reticle */}
      <View style={styles.viewport}>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            Point camera at the counter display to collect your stamp
          </Text>
        </View>

        {/* Viewfinder Reticle Frame */}
        <View style={styles.reticle}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <View style={styles.laserLine} />

          <Text style={styles.reticleCenterText}>
            {scanning ? 'Verifying...' : 'Align QR Code'}
          </Text>
        </View>

        {/* Anti-Fraud Security Notice */}
        <View style={styles.securityPill}>
          <Text style={styles.securityText}>Dynamic Token Protection</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.scanTriggerBtn}
          onPress={handleSimulateScan}
          disabled={scanning}
          activeOpacity={0.85}
        >
          <Text style={styles.scanTriggerBtnText}>
            {scanning ? 'Validating...' : 'Check-in'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUCCESS / REWARD UNLOCKED MODAL */}
      <Modal visible={resultModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.card]}>
            <View style={styles.modalIconCircle}>
              <CheckIcon size={24} color="#000000" strokeWidth={2.5} />
            </View>

            <Text style={styles.modalTitle}>
              {scanResult?.rewardUnlocked ? 'Reward Unlocked' : 'Stamp Recorded'}
            </Text>

            <Text style={styles.modalVenue}>{scanResult?.businessName}</Text>

            <View style={styles.modalStampPill}>
              <Text style={styles.modalStampPillText}>+1 Stamp Added</Text>
            </View>

            {scanResult?.rewardUnlocked ? (
              <View style={styles.voucherUnlockedCard}>
                <Text style={styles.voucherUnlockedLabel}>REWARD READY</Text>
                <Text style={styles.voucherUnlockedTitle}>{scanResult.rewardTitle}</Text>
                <Text style={styles.voucherUnlockedHint}>
                  Redeem at the counter whenever you are ready.
                </Text>
              </View>
            ) : (
              <Text style={styles.modalProgressText}>
                Balance:{' '}
                <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                  {scanResult?.currentStamps}/{scanResult?.targetStamps} Stamps
                </Text>
              </Text>
            )}

            <View style={styles.modalActions}>
              {scanResult?.rewardUnlocked ? (
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleGoToRewards}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>View</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleDone}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryBtnText}>Done</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalDismissBtn}
                onPress={handleDone}
                activeOpacity={0.7}
              >
                <Text style={styles.modalDismissBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  instructionBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 36,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  reticle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  laserLine: {
    width: '90%',
    height: 1,
    backgroundColor: '#F59E0B',
    position: 'absolute',
  },
  reticleCenterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 60,
  },
  securityPill: {
    marginTop: 36,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  securityText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  scanTriggerBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTriggerBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalVenue: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  modalStampPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  modalStampPillText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  voucherUnlockedCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  voucherUnlockedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  voucherUnlockedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350F',
    marginVertical: 4,
    textAlign: 'center',
  },
  voucherUnlockedHint: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
  },
  modalProgressText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  modalPrimaryBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalDismissBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalDismissBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
