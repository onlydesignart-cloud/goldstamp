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

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; phone: string; email?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');

  // Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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

    if (mode === 'REGISTER' && (!name.trim() || name.trim().length < 2)) {
      setError('Please enter your full name');
      return;
    }

    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
      setResendTimer(45);
    }, 600);
  };

  const handleVerifyOtp = () => {
    setError(null);
    if (otp.trim().length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: name.trim() || 'Customer',
        phone: phone.trim(),
        email: `${phone.trim()}@goldstamp.app`,
      });
    }, 500);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: 'Arjun Mehta',
        phone: '9876543210',
        email: 'arjun.mehta@gmail.com',
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
            {/* 2-Segment Switcher (Sign In <-> Register) */}
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

            {/* Error Banner */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Step 1: Phone / Name Input */}
            {step === 'PHONE' ? (
              <View style={styles.formSection}>
                {mode === 'REGISTER' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      placeholder="e.g. Arjun Mehta"
                      placeholderTextColor="#94A3B8"
                      value={name}
                      onChangeText={setName}
                      style={styles.textInput}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
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

                {/* Primary CTA Button - One Word */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Sending...' : mode === 'LOGIN' ? 'Continue' : 'Join'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* 1-Tap Google Sign-In - One Word */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.googleBtnText}>Google</Text>
                </TouchableOpacity>
              </View>
            ) : (
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

                {/* Single Word Submit */}
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
    borderRadius: 6,
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
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
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
  primaryBtn: {
    backgroundColor: '#000000',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
