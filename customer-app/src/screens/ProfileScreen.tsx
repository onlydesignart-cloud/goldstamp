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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { WalletIcon } from '../components/Icons';
import { CustomerApi } from '../services/api';
import { validateProfileForm } from '../utils/validation';

interface ProfileScreenProps {
  user?: { name: string; phone: string; email?: string; whatsapp?: string } | null;
  onProfileUpdate?: (updated: { name: string; phone: string; email?: string; whatsapp?: string }) => void;
  onSignOut?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onProfileUpdate, onSignOut }) => {
  const activeUser = user || CustomerApi.getCurrentCustomer();

  const [whatsappSync, setWhatsappSync] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activeUser.name || '');
  const [editEmail, setEditEmail] = useState(activeUser.email || '');
  const [editWhatsapp, setEditWhatsapp] = useState((activeUser as any).whatsapp || activeUser.phone || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartEdit = () => {
    setEditName(activeUser.name || '');
    setEditEmail(activeUser.email || '');
    setEditWhatsapp((activeUser as any).whatsapp || activeUser.phone || '');
    setFormError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setFormError(null);
    const validation = validateProfileForm({
      fullName: editName,
      email: editEmail,
      whatsapp: editWhatsapp,
    });

    if (!validation.isValid) {
      setFormError(validation.error || 'Please check your profile details.');
      return;
    }

    setSaving(true);
    try {
      await CustomerApi.updateProfile({
        name: validation.clean.name,
        email: validation.clean.email,
        phone: activeUser.phone,
        whatsapp: validation.clean.whatsapp || activeUser.phone,
      });

      if (onProfileUpdate) {
        onProfileUpdate({
          name: validation.clean.name,
          email: validation.clean.email,
          phone: activeUser.phone,
          whatsapp: validation.clean.whatsapp || activeUser.phone,
        });
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
          {saveSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>✓ Profile updated successfully!</Text>
            </View>
          )}

          {!isEditing ? (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(activeUser.name || 'C').substring(0, 1).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{activeUser.name || 'Customer'}</Text>
              <Text style={styles.userEmail}>{activeUser.email || 'No email added'}</Text>

              {/* Linked WhatsApp Chip */}
              <View style={styles.whatsappChip}>
                <Text style={styles.whatsappText}>
                  📱 WhatsApp: +91 {(activeUser as any).whatsapp || activeUser.phone} (Verified)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={handleStartEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.editProfileBtnText}>✎ Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Edit Profile Form */
            <View style={styles.editFormWrap}>
              <View style={styles.editFormHeader}>
                <Text style={styles.editFormTitle}>Edit Your Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelLink}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {formError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WhatsApp Number</Text>
                <TextInput
                  placeholder="10-digit WhatsApp number"
                  placeholderTextColor="#94A3B8"
                  value={editWhatsapp}
                  onChangeText={setEditWhatsapp}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.textInput}
                />
                <View style={styles.whatsappNoteBox}>
                  <Text style={styles.whatsappNoteText}>
                    📱 Get live stamp &amp; reward updates on WhatsApp
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  successBanner: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
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
    marginBottom: 14,
  },
  whatsappText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  editProfileBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Edit Form Styles
  editFormWrap: {
    width: '100%',
    gap: 12,
  },
  editFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  editFormTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cancelLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  requiredStar: {
    color: '#DC2626',
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  whatsappNoteBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  whatsappNoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  saveBtn: {
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
