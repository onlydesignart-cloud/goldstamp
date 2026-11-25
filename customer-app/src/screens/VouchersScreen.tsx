import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { RewardVoucher } from '../types';
import { CustomerApi } from '../services/api';
import { RewardsIcon, CloseIcon } from '../components/Icons';

export const VouchersScreen: React.FC = () => {
  const [vouchers, setVouchers] = useState<RewardVoucher[]>([]);
  const [tab, setTab] = useState<'AVAILABLE' | 'REDEEMED'>('AVAILABLE');
  const [selectedVoucher, setSelectedVoucher] = useState<RewardVoucher | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const loadVouchers = async () => {
    const list = await CustomerApi.getVouchers();
    setVouchers(list);
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const filtered = vouchers.filter((v) => v.status === tab);

  const handleOpenRedeem = (voucher: RewardVoucher) => {
    setSelectedVoucher(voucher);
    setModalVisible(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedVoucher) return;
    setRedeeming(true);
    await CustomerApi.redeemVoucher(selectedVoucher.id);
    await loadVouchers();
    setRedeeming(false);
    setModalVisible(false);
    setTab('REDEEMED');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Centered Brand Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Segmented Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'AVAILABLE' && styles.tabBtnActive]}
          onPress={() => setTab('AVAILABLE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, tab === 'AVAILABLE' && styles.tabBtnTextActive]}>
            Active ({vouchers.filter((v) => v.status === 'AVAILABLE').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'REDEEMED' && styles.tabBtnActive]}
          onPress={() => setTab('REDEEMED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, tab === 'REDEEMED' && styles.tabBtnTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length > 0 ? (
          filtered.map((voucher) => (
            <View key={voucher.id} style={[styles.voucherCard, Shadows.card]}>
              <View style={styles.cardTop}>
                <View style={styles.venueRow}>
                  <Text style={styles.venueName}>{voucher.businessName}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      voucher.status === 'AVAILABLE' ? styles.statusPillActive : styles.statusPillRedeemed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        voucher.status === 'AVAILABLE' ? styles.statusTextActive : styles.statusTextRedeemed,
                      ]}
                    >
                      {voucher.status === 'AVAILABLE' ? 'Active' : 'Redeemed'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.voucherTitle}>{voucher.title}</Text>
                <Text style={styles.voucherDesc}>{voucher.description}</Text>
              </View>

              {/* Voucher Code Strip */}
              <View style={styles.cardBottom}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>CODE</Text>
                  <Text style={styles.codeText}>{voucher.code}</Text>
                </View>

                {voucher.status === 'AVAILABLE' ? (
                  <TouchableOpacity
                    style={styles.redeemBtn}
                    onPress={() => handleOpenRedeem(voucher)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.redeemBtnText}>Redeem</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.redeemedDateText}>
                    Claimed {new Date(voucher.redeemedAt || voucher.unlockedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {tab === 'AVAILABLE' ? 'No Active Rewards' : 'No Redeemed History'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tab === 'AVAILABLE'
                ? 'Check in at your favorite venues to complete stamp milestones.'
                : 'Your claimed rewards will appear here once redeemed.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* COUNTER REDEMPTION MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.card]}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalGiftCircle}>
                <RewardsIcon size={22} color="#000000" strokeWidth={2} />
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <CloseIcon size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Redeem Reward</Text>
            <Text style={styles.modalVenue}>{selectedVoucher?.businessName}</Text>
            <Text style={styles.modalRewardText}>{selectedVoucher?.title}</Text>

            {/* Big Single-Use Code */}
            <View style={styles.bigCodeCard}>
              <Text style={styles.bigCodeLabel}>SHOW CODE TO STAFF</Text>
              <Text style={styles.bigCode}>{selectedVoucher?.code}</Text>
              <Text style={styles.bigCodeSub}>Single-use verification token</Text>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmRedeemBtn}
                onPress={handleConfirmRedeem}
                disabled={redeeming}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmRedeemBtnText}>
                  {redeeming ? 'Claiming...' : 'Redeem'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    height: 32,
    width: 130,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  voucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardTop: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  venueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: '#FEF3C7',
  },
  statusPillRedeemed: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#D97706',
  },
  statusTextRedeemed: {
    color: '#94A3B8',
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  voucherDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  redeemBtn: {
    backgroundColor: '#000000',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  redeemedDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalGiftCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    padding: 8,
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
    marginBottom: 6,
  },
  modalRewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  bigCodeCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  bigCodeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bigCode: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 3,
  },
  bigCodeSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  confirmRedeemBtn: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmRedeemBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
