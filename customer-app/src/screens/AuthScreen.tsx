import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { CustomerApi } from '../services/api';
import { validateProfileForm } from '../utils/validation';

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; phone: string; email?: string; whatsapp?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROFILE_SETUP'>('PHONE');

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(45);

  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const handleSendOtp = () => {
    setError(null);
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
      setResendTimer(45);
    }, 500);
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.trim().length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    try {
      // Check if existing profile is already completed in DB
      const existing = await CustomerApi.getProfileByPhone(phone);
      if (existing && mode === 'LOGIN') {
        setLoading(false);
        onLoginSuccess(existing);
        return;
      }

      // Otherwise go to Profile Completion step
      setWhatsapp(phone.replace(/[^0-9]/g, ''));
      setLoading(false);
      setStep('PROFILE_SETUP');
    } catch {
      setWhatsapp(phone.replace(/[^0-9]/g, ''));
      setLoading(false);
      setStep('PROFILE_SETUP');
    }
  };

  const handleCompleteProfile = async () => {
    setError(null);
    const validation = validateProfileForm({
      fullName: name,
      email,
      whatsapp: whatsapp || phone,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Please check your profile details.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      await CustomerApi.updateProfile({
        name: validation.clean.name,
        email: validation.clean.email,
        phone: cleanPhone,
        whatsapp: validation.clean.whatsapp || cleanPhone,
      });

      setLoading(false);
      onLoginSuccess({
        name: validation.clean.name,
        email: validation.clean.email,
        phone: cleanPhone,
        whatsapp: validation.clean.whatsapp || cleanPhone,
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: 'Arjun Mehta',
        phone: '9876543210',
        email: 'arjun.mehta@gmail.com',
        whatsapp: '9876543210',
      });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand Identity */}
          <View style={styles.brandContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandSubtitle}>Customer Loyalty Wallet</Text>
          </View>

          {/* Card Container */}
          <View style={[styles.authCard, Shadows.card]}>
            {/* 2-Segment Switcher (only shown before profile setup) */}
            {step !== 'PROFILE_SETUP' && (
              <View style={styles.tabSwitcher}>
                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'LOGIN' && styles.tabBtnActive]}
                  onPress={() => {
                    setMode('LOGIN');
                    setStep('PHONE');
                    setError(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabBtnText, mode === 'LOGIN' && styles.tabBtnTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'REGISTER' && styles.tabBtnActive]}
                  onPress={() => {
                    setMode('REGISTER');
                    setStep('PHONE');
                    setError(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabBtnText, mode === 'REGISTER' && styles.tabBtnTextActive]}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Banner */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Step 1: Phone Number Input */}
            {step === 'PHONE' ? (
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Mobile Number <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCodeBox}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      placeholder="98765 43210"
                      placeholderTextColor="#94A3B8"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.textInput, { flex: 1 }]}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Sending...' : mode === 'LOGIN' ? 'Continue' : 'Register with OTP'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* 1-Tap Google Sign-In */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.googleBtnText}>Google</Text>
                </TouchableOpacity>
              </View>
            ) : step === 'OTP' ? (
              /* Step 2: OTP Verification */
              <View style={styles.otpSection}>
                <View style={styles.otpHeader}>
                  <Text style={styles.otpHeaderTitle}>Verification Code</Text>
                  <Text style={styles.otpHeaderSub}>
                    Sent to +91 {phone}
                  </Text>
                </View>

                <TextInput
                  placeholder="••••"
                  placeholderTextColor="#CBD5E1"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={styles.otpInput}
                  autoFocus
                />

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleVerifyOtp}
                  disabled={loading || otp.length !== 4}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.otpFooter}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimerText}>
                      Resend in {resendTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.7}>
                      <Text style={styles.resendBtnText}>Resend</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setStep('PHONE');
                      setOtp('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changePhoneText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Step 3: Mandatory Profile Completion */
              <View style={styles.formSection}>
                <View style={styles.profileSetupHeader}>
                  <Text style={styles.profileSetupTitle}>Complete Your Profile</Text>
                  <Text style={styles.profileSetupSub}>
                    Please provide your details to activate your digital stamp wallet.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Full Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="e.g. Rohan Sharma"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    style={styles.textInput}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Email Address <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="rohan@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>WhatsApp Number</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCodeBox}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      placeholder="WhatsApp number"
                      placeholderTextColor="#94A3B8"
                      value={whatsapp}
                      onChangeText={setWhatsapp}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.textInput, { flex: 1 }]}
                    />
                  </View>
                  <View style={styles.whatsappNoteBox}>
                    <Text style={styles.whatsappNoteText}>
                      📱 Get live stamp &amp; reward updates on WhatsApp
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleCompleteProfile}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Saving Profile...' : 'Complete & Open Wallet'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandLogo: {
    width: 170,
    height: 44,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  authCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    gap: 14,
  },
  profileSetupHeader: {
    marginBottom: 4,
  },
  profileSetupTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileSetupSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  inputGroup: {
    gap: 6,
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
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  whatsappNoteBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  whatsappNoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  primaryBtn: {
    backgroundColor: '#000000',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  otpSection: {
    gap: 16,
    alignItems: 'center',
  },
  otpHeader: {
    alignItems: 'center',
    gap: 4,
  },
  otpHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpHeaderSub: {
    fontSize: 12,
    color: '#64748B',
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 8,
  },
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
  },
  resendTimerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
