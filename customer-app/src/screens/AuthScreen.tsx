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
import { Shadows } from '../theme/colors';
import { CustomerApi } from '../services/api';
import { validateProfileForm } from '../utils/validation';

interface AuthScreenProps {
  onLoginSuccess: (user: { id?: string; name: string; phone: string; email?: string; whatsapp?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
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

  const handleLogin = async () => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await CustomerApi.loginWithEmail(cleanEmail, password);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleRegisterStart = async () => {
    setError(null);

    const validation = validateProfileForm({
      fullName: name,
      email,
      whatsapp: phone,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Please check your details.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp / Mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const exists = await CustomerApi.checkEmailExists(validation.clean.email);
      if (exists) {
        setLoading(false);
        setError('An account with this email is already registered. Please Sign In.');
        return;
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const otpRes = await CustomerApi.sendEmailOtp(
        validation.clean.email,
        validation.clean.name,
        code
      );

      setLoading(false);
      if (!otpRes.success) {
        setError(otpRes.error || 'Failed to send verification code to email.');
        return;
      }

      setSentOtp(code);
      setOtp('');
      setResendTimer(45);
      setStep('OTP');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setError(null);
    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const otpRes = await CustomerApi.sendEmailOtp(email.trim().toLowerCase(), name.trim(), code);
    setLoading(false);
    if (otpRes.success) {
      setSentOtp(code);
      setResendTimer(45);
    } else {
      setError(otpRes.error || 'Failed to resend code.');
    }
  };

  const handleVerifyEmailOtp = async () => {
    setError(null);
    if (otp.trim().length !== 4) {
      setError('Please enter the 4-digit verification code sent to your email.');
      return;
    }

    if (otp.trim() !== sentOtp) {
      setError('Incorrect verification code. Please check your email inbox.');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const regRes = await CustomerApi.registerWithEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      whatsapp: cleanPhone,
      password,
    });
    setLoading(false);

    if (regRes.success && regRes.user) {
      onLoginSuccess(regRes.user);
    } else {
      setError(regRes.error || 'Could not complete registration.');
    }
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
            {/* 2-Segment Switcher */}
            {step === 'FORM' && (
              <View style={styles.tabSwitcher}>
                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'LOGIN' && styles.tabBtnActive]}
                  onPress={() => {
                    setMode('LOGIN');
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

            {step === 'FORM' ? (
              mode === 'LOGIN' ? (
                /* SIGN IN FORM (Email + Password) */
                <View style={styles.formSection}>
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
                    <Text style={styles.inputLabel}>
                      Password <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View style={styles.passwordRow}>
                      <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor="#94A3B8"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={[styles.textInput, { flex: 1 }]}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeBtnText}>
                          {showPassword ? 'Hide' : 'Show'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>
                      {loading ? 'Signing In...' : 'Sign In to Wallet'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* REGISTER FORM (Full Name, Email, WhatsApp, Password) */
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Full Name <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      placeholder="e.g. Rohan Sharma"
                      placeholderTextColor="#94A3B8"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      style={styles.textInput}
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
                    <Text style={styles.inputLabel}>
                      WhatsApp Number <Text style={styles.requiredStar}>*</Text>
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
                    <View style={styles.whatsappNoteBox}>
                      <Text style={styles.whatsappNoteText}>
                        📱 Get live stamp &amp; reward updates on WhatsApp
                      </Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Create Password <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View style={styles.passwordRow}>
                      <TextInput
                        placeholder="Min. 6 characters"
                        placeholderTextColor="#94A3B8"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={[styles.textInput, { flex: 1 }]}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeBtnText}>
                          {showPassword ? 'Hide' : 'Show'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleRegisterStart}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>
                      {loading ? 'Sending Verification Code...' : 'Register & Verify Email'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              /* STEP 2: GENUINE EMAIL OTP VERIFICATION */
              <View style={styles.otpSection}>
                <View style={styles.otpHeader}>
                  <Text style={styles.otpHeaderTitle}>Verify Your Email</Text>
                  <Text style={styles.otpHeaderSub}>
                    We sent a 4-digit code to {email.trim().toLowerCase()}
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
                  onPress={handleVerifyEmailOtp}
                  disabled={loading || otp.length !== 4}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? 'Creating Account...' : 'Verify & Open Wallet'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.otpFooter}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimerText}>
                      Resend in {resendTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                      <Text style={styles.resendBtnText}>Resend Code</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setStep('FORM');
                      setOtp('');
                      setError(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changePhoneText}>Edit Details</Text>
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
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 22,
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
    maxWidth: 390,
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
    marginBottom: 18,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eyeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
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
    textAlign: 'center',
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
