import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { WalletIcon } from '../components/Icons';

interface ProfileScreenProps {
  onSignOut?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSignOut }) => {
  const [whatsappSync, setWhatsappSync] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleAppleWallet = () => {
    Alert.alert(
      'Wallet Integration',
      'Passes can be saved to your device wallet for instant counter access.',
      [{ text: 'OK' }]
    );
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.card]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.userName}>Arjun Mehta</Text>
          <Text style={styles.userEmail}>arjun.mehta@gmail.com</Text>

          {/* Linked WhatsApp Chip */}
          <View style={styles.whatsappChip}>
            <Text style={styles.whatsappText}>+91 98765 43210 (Verified)</Text>
          </View>
        </View>

        {/* Apple / Google Wallet Sync Banner */}
        <TouchableOpacity
          style={[styles.walletSyncBanner, Shadows.card]}
          onPress={handleAppleWallet}
          activeOpacity={0.85}
        >
          <View style={styles.walletIconCircle}>
            <WalletIcon size={20} color="#000000" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletBannerTitle}>Apple & Google Wallet</Text>
            <Text style={styles.walletBannerSub}>
              Access stamp passes with double-click
            </Text>
          </View>
          <Text style={styles.walletArrow}>›</Text>
        </TouchableOpacity>

        {/* Preferences Section */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.prefRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.prefTitle}>WhatsApp Updates</Text>
              <Text style={styles.prefSub}>
                Visit confirmations and milestone vouchers
              </Text>
            </View>
            <Switch
              value={whatsappSync}
              onValueChange={setWhatsappSync}
              trackColor={{ false: '#E2E8F0', true: '#000000' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.prefRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.prefTitle}>Push Notifications</Text>
              <Text style={styles.prefSub}>
                Alerts when 1 stamp away from reward
              </Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: '#E2E8F0', true: '#000000' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Security & App Info */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoVal}>v1.0.0</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token Security</Text>
            <Text style={styles.infoVal}>HMAC Verified</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        {onSignOut && (
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  whatsappChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  whatsappText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  walletSyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  walletBannerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  walletArrow: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  prefSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  signOutBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signOutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
