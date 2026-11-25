import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || scanning) return;
    setScanned(true);
    setScanning(true);

    try {
      let cleanToken = (data || '').trim();
      const mUrl = cleanToken.match(/[?&]token=([a-zA-Z0-9_-]+)/);
      if (mUrl && mUrl[1]) {
        cleanToken = mUrl[1];
      }

      const res = await CustomerApi.scanQr(cleanToken);
      setScanResult(res);
      setResultModalVisible(true);
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'Unable to verify QR token.',
      });
      setResultModalVisible(true);
    } finally {
      setScanning(false);
    }
  };

  const handleDone = () => {
    setResultModalVisible(false);
    setScanned(false);
    onScanComplete();
  };

  const handleGoToRewards = () => {
    setResultModalVisible(false);
    setScanned(false);
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

      {/* Real Live Camera View or Permission Prompt */}
      {!permission ? (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionSub}>Initializing camera...</Text>
        </View>
      ) : !permission.granted ? (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSub}>
            Please grant camera permission to scan merchant counter QR codes and collect stamps.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />

          {/* Viewfinder Reticle Overlay Frame */}
          <View style={styles.viewport}>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Align the merchant's screen QR code inside the box
              </Text>
            </View>

            <View style={styles.reticle}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              <View style={styles.laserLine} />

              <Text style={styles.reticleCenterText}>
                {scanning ? 'Verifying...' : 'Ready'}
              </Text>
            </View>

            <View style={styles.securityPill}>
              <Text style={styles.securityText}>Dynamic Anti-Fraud Protection</Text>
            </View>
          </View>
        </View>
      )}

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

            <Text style={styles.modalVenue}>{scanResult?.businessName || 'Merchant Venue'}</Text>

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
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  permissionBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  instructionBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '85%',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  reticle: {
    width: width * 0.72,
    height: width * 0.72,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#10B981',
    opacity: 0.8,
  },
  reticleCenterText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  securityPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  securityText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
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
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
  },
  modalStampPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalStampPillText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  modalProgressText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  voucherUnlockedCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  voucherUnlockedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  voucherUnlockedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 4,
  },
  voucherUnlockedHint: {
    fontSize: 10,
    color: '#92400E',
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
  },
  modalPrimaryBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
