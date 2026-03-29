import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, Vibration } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import { Animated, StyleSheet, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import GlowButton from '@/components/common/GlowButton';
import InputField from '@/components/common/InputField';
import OtpCodeInput from '@/components/common/OtpCodeInput';
import SuccessAnimation from '@/components/common/SuccessAnimation';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { AuthStackParamList } from '@/navigation/AuthNavigation';
import { colors, rounded, spacing, typography } from '@/themes';

// ── Helper: mask email ────────────────────────────────────────────────────────
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local.slice(0, 2) + '****' + local.slice(local.length - 3);
  return `${masked}@${domain}`;
};

// ── Security Badges ───────────────────────────────────────────────────────────────
function SecurityBadges() {
  const badges = [
    { icon: '🔒', label: '256-bit SSL' },
    { icon: '🛡️', label: 'End-to-end' },
    { icon: '⚡', label: 'Instant' },
  ];
  return (
    <View style={badgeStyles.row}>
      {badges.map((b, i) => (
        <View key={i} style={badgeStyles.badge}>
          <Text style={badgeStyles.icon}>{b.icon}</Text>
          <Text style={badgeStyles.label}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[6] },
  badge: { flex: 1, backgroundColor: colors.surface.raised, borderRadius: rounded.lg, borderWidth: 1, 
    borderColor: colors.border.DEFAULT, padding: spacing[3], alignItems: 'center', gap: spacing[2] - 2 }, // prettier-ignore
  icon: { fontSize: typography.size.md },
  label: { color: colors.content.tertiary, fontSize: typography.size['2xs'], fontWeight: typography.weight.bold, letterSpacing: 0.4 },
});

// ── Success Stats ───────────────────────────────────────────────────────────────
function SuccessStats() {
  const stats = [
    { icon: '🛡️', label: 'Secured' },
    { icon: '✨', label: 'Updated' },
    { icon: '⚡', label: 'Ready' },
  ];
  return (
    <View style={statsStyles.successStats}>
      {stats.map((s, i) => (
        <View key={i} style={statsStyles.statChip}>
          <Text style={statsStyles.statIcon}>{s.icon}</Text>
          <Text style={statsStyles.statText}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const statsStyles = StyleSheet.create({
  successStats: { flexDirection: 'row', justifyContent: 'center', gap: spacing[2] + 2, marginVertical: 32 },
  statChip: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: rounded.xl - 2, borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface.raised, padding: spacing[3] + 2, gap: spacing[2] - 2 }, // prettier-ignore
  statIcon: { fontSize: typography.size['2xl'] },
  statText: { color: colors.content.primary, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
});

// ── Main Screen: ForgotPasswordScreen ───────────────────────────────────────────────────────────────
type ForgotPasswordScreenNavigationProp = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation, route }: ForgotPasswordScreenNavigationProp) {
  const headerHeight = useHeaderHeight();
  const { email: param_email } = route.params ?? {};

  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const [step, setStep] = useState<number>(1); // 1 = Email, 2 = OTP, 3 = New Password, 4 = Success

  const [email, setEmail] = useState<string>(param_email || '');
  const [emailError, setEmailError] = useState<string>('');

  const maskedEmail = maskEmail(email);

  const [otp, setOtp] = useState<string>('');
  const [otpVerificationStep, setOtpVerificationStep] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [otpErrorMsg, setOtpErrorMsg] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [resendCount, setResendCount] = useState<number>(0);

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const errorShake = useRef(new Animated.Value(0)).current;
  const successBannerAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation //
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Resend timer countdown //
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [resendTimer, resendCount]);

  // Auto-verify when 6 digits entered //
  useEffect(() => {
    if (otp.length === 6 && otpVerificationStep === 'idle') {
      handleVerify(otp);
    }
  }, [otp]);

  const handleResend = () => {
    setOtp('');
    setOtpErrorMsg('');
    setOtpVerificationStep('idle');
    setResendCount(c => c + 1);
    setResendTimer(60);
  };

  const transitionTo = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setOtpErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      transitionTo(2);
    }, 1200);
  };

  const handleVerify = useCallback((code: string) => {
    setOtpVerificationStep('verifying');
    // Simulate API call — replace with real verification //
    setTimeout(() => {
      if (code === '123456') {
        setOtpVerificationStep('verified');
        Vibration.vibrate(100);
        Animated.spring(successBannerAnim, { toValue: 1, useNativeDriver: true, bounciness: 10 }).start();
        transitionTo(3);
      } else {
        setOtpVerificationStep('error');
        setOtpErrorMsg('Incorrect code. Please try again.');
        setOtp('');

        // Shake animation //
        Animated.sequence([
          Animated.timing(errorShake, { toValue: 8, duration: 80, useNativeDriver: true }),
          Animated.timing(errorShake, { toValue: -8, duration: 80, useNativeDriver: true }),
          Animated.timing(errorShake, { toValue: 6, duration: 80, useNativeDriver: true }),
          Animated.timing(errorShake, { toValue: -6, duration: 80, useNativeDriver: true }),
          Animated.timing(errorShake, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]).start();

        Vibration.vibrate([0, 80, 80, 80]);
        setTimeout(() => setOtpVerificationStep('idle'), 200);
      }
    }, 1200);
  }, []);

  const handlePasswordSubmit = () => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      transitionTo(4);
    }, 1000);
  };

  const stepTitles = {
    1: { icon: '🔑', title: 'Forgot Password?', sub: "No worries — we'll send a reset code to your email." },
    2: { icon: '📩', title: 'Check Your Email', sub: `We sent a 6-digit code to ${maskedEmail || 'your email'}` },
    3: { icon: '🛡️', title: 'New Password', sub: 'Choose a strong password to protect your account.' },
    4: { icon: null, title: 'Password Reset Successfull', sub: "You're all set. Sign in with your new password." },
  };
  const current = stepTitles[step as keyof typeof stepTitles];

  const otpVerified = otpVerificationStep === 'verified';
  const otpVerifying = otpVerificationStep === 'verifying';
  const hasOtpError = otpVerificationStep === 'error' || !!otpErrorMsg;

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Password strength //
  const getStrength = (p: string) => {
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(newPassword) || 0;
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', colors.feedback.error, '#FF9500', '#FFD700', colors.accent.green];

  return (
    <View style={[globalStyles.safe, { paddingTop: headerHeight }]}>
      {/* ── Ambient glow blob ── */}
      <View style={globalStyles.glowAmbientBlobBL} />
      <View style={globalStyles.glowAmbientBlobTR} />

      <KeyboardAwareScrollView
        style={globalStyles.scroll}
        contentContainerStyle={globalStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={20}
      >
        {/* Animated content */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {/* ── Header ── */}
          {step === 4 ? (
            <View style={styles.centerContent}>
              {/* Icon / Success */}
              <SuccessAnimation />

              {/* Heading */}
              <Text style={[globalStyles.title, styles.textCenter]}>{current.title}</Text>
              <Text style={globalStyles.subtitle}>{current.sub}</Text>
            </View>
          ) : (
            <View style={globalStyles.header}>
              <View style={styles.iconBadge}>
                <LinearGradient
                  colors={
                    step === 1
                      ? [colors.accent.green, colors.accent.purple]
                      : step === 2
                        ? [colors.accent.purple, '#3B82F6']
                        : ['#FF6B35', colors.accent.purple]
                  }
                  style={styles.iconGradient}
                >
                  <Text style={styles.iconEmoji}>{current.icon}</Text>
                </LinearGradient>
              </View>

              {/* Heading */}
              <Text style={globalStyles.title}>{current.title}</Text>
              <Text style={globalStyles.subtitle}>{current.sub}</Text>
            </View>
          )}

          {/* ── Step progress ── */}
          {step < 4 && (
            <ProgressBar
              name="Password Reset"
              currentStep={step}
              totalSteps={3}
              stepLabels={['Send Code', 'Verify OTP', 'Reset password']}
            />
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <View>
              <InputField
                inputRef={emailRef}
                icon="mail-outline"
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                onChangeText={(t: string) => {
                  setEmail(t);
                  setEmailError('');
                }}
                autoFocus
                caretHidden={false}
                error={emailError}
                onSubmitEditing={handleEmailSubmit}
              />

              <GlowButton label="Send Reset Code →" onPress={handleEmailSubmit} loading={loading} disabled={!isValidEmail(email)} />

              <View style={styles.tipCard}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>Check your spam folder if you don't see the email within a minute.</Text>
              </View>
            </View>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <Animated.View style={{ transform: [{ translateX: errorShake }] }}>
              <OtpCodeInput
                value={otp}
                onChange={v => {
                  setOtp(v);
                  if (otpErrorMsg) setOtpErrorMsg('');
                }}
                verified={otpVerified}
                hasError={hasOtpError}
              />

              {/* Error */}
              {otpErrorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{otpErrorMsg}</Text>
                </View>
              ) : null}

              {/* Verify CTA */}
              <GlowButton
                label={otpVerifying ? 'Verifying…' : 'Change Password →'}
                onPress={() => handleVerify(otp)}
                disabled={otp.length < 6}
                loading={otpVerifying}
              />

              {/* Resend */}
              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>Didn't receive it?{'  '}</Text>
                {resendTimer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend in <Text style={styles.timerAccent}>{formatTimer(resendTimer)}</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Resend confirmation */}
              {resendCount > 0 && (
                <View style={styles.resendConfirm}>
                  <Text style={styles.resendConfirmIcon}>📨</Text>
                  <Text style={styles.resendConfirmText}>
                    {'New code sent!   '}
                    <Text style={{ color: colors.accent.green }}>({resendCount} sent)</Text>
                    {`\nWe've sent a new code to your email.`}
                  </Text>
                </View>
              )}

              {/* Security badges */}
              <SecurityBadges />

              {/* Email indicator */}
              <View style={styles.emailTag}>
                <Text style={styles.emailTagIcon}>✉️</Text>
                <Text style={styles.emailTagText} numberOfLines={1}>
                  {email}
                </Text>
                <TouchableOpacity onPress={() => transitionTo(1)}>
                  <Text style={styles.emailTagChange}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Help */}
              <View style={styles.helpRow}>
                <Text style={styles.helpText}>Having trouble?{'  '}</Text>
                <TouchableOpacity>
                  <Text style={styles.helpLink}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <View>
              <InputField
                inputRef={passwordRef}
                icon="lock-closed-outline"
                placeholder="New password"
                value={newPassword}
                onChangeText={t => {
                  setNewPassword(t);
                  setPasswordError('');
                }}
                autoFocus
                secureTextEntry
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />

              {/* Strength meter */}
              {newPassword.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: i <= strength ? strengthColors[strength] : colors.border.DEFAULT,
                        },
                      ]}
                    />
                  ))}
                  <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>{strengthLabels[strength]}</Text>
                </View>
              )}

              <View style={{ marginTop: newPassword ? 4 : 0 }}>
                <InputField
                  inputRef={confirmPasswordRef}
                  icon="checkmark-circle-outline"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={t => {
                    setConfirmPassword(t);
                    setPasswordError('');
                  }}
                  secureTextEntry
                  error={passwordError}
                />
              </View>

              {/* Password rules */}
              <View style={styles.rulesCard}>
                {[
                  { rule: 'At least 8 characters', met: newPassword.length >= 8 },
                  { rule: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
                  { rule: 'One number', met: /[0-9]/.test(newPassword) },
                  { rule: 'Passwords match', met: confirmPassword && newPassword === confirmPassword },
                ].map((r, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <Text style={[styles.ruleDot, r.met && styles.ruleDotMet]}>{r.met ? '✓' : '○'}</Text>
                    <Text style={[styles.ruleText, r.met && styles.ruleTextMet]}>{r.rule}</Text>
                  </View>
                ))}
              </View>

              <GlowButton
                label="Reset Password"
                onPress={handlePasswordSubmit}
                loading={loading}
                disabled={!newPassword || !confirmPassword}
              />
            </View>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <View>
              <SuccessStats />
              <GlowButton label="Sign In Now →" onPress={() => navigation?.navigate?.('SignIn')} />
              <TouchableOpacity style={styles.backToHome} onPress={() => navigation?.navigate?.('Landing')}>
                <Text style={styles.backToHomeText}>← Back to Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  centerContent: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },

  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: rounded['2xl'] - 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  iconBadge: { marginBottom: spacing[6] },
  iconEmoji: { fontSize: typography.size['3xl'] },

  // Tip card (step 1) //
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], borderWidth: 1, borderRadius: rounded.xl, 
    borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.raised, marginTop: spacing[5], padding: spacing[4],
  }, // prettier-ignore
  tipIcon: { fontSize: typography.size.md },
  tipText: { flex: 1, color: colors.content.tertiary, fontSize: typography.size.sm - 1, lineHeight: 18 },

  // Resend (step 2) //
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] },
  resendLabel: { color: colors.content.tertiary, fontSize: typography.size.sm - 1 },
  timerText: { color: colors.content.tertiary, fontSize: typography.size.sm - 1 },
  timerAccent: { color: colors.accent.green, fontWeight: typography.weight.bold },
  resendLink: { color: colors.accent.green, fontWeight: typography.weight.bold, fontSize: typography.size.sm - 1 },

  resendConfirmIcon: { fontSize: typography.size.sm },
  resendConfirmText: { color: colors.content.tertiary, fontSize: typography.size.xs, flex: 1 },
  resendConfirm: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.surface.raised,
    borderRadius: rounded.lg, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing[3], marginBottom: spacing[4],
  }, // prettier-ignore

  helpRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing[1] },
  helpText: { color: colors.content.tertiary, fontSize: typography.size.xs },
  helpLink: { color: colors.accent.green, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },

  // Email tag (step 2) //
  emailTag: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] + 2, backgroundColor: colors.surface.raised, 
    borderRadius: rounded.xl - 2, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing[3] + 2, marginBottom: spacing[4]}, // prettier-ignore
  emailTagIcon: { fontSize: 16, color: colors.content.tertiary },
  emailTagText: { flex: 1, color: colors.content.tertiary, fontSize: typography.size.sm - 1 },
  emailTagChange: { color: colors.accent.green, fontSize: typography.size.sm - 1, fontWeight: typography.weight.bold },

  errorBox: { borderWidth: 1, borderRadius: 12, borderColor: 'rgba(255,76,106,0.25)', 
    backgroundColor: 'rgba(255,76,106,0.08)', alignItems: 'center', padding: 12, marginBottom: 14 }, // prettier-ignore
  errorText: { color: COLORS.error, fontSize: typography.size.sm - 1, fontWeight: typography.weight.semibold },

  // Strength meter (step 3) //
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] - 2, marginTop: -spacing[2] - 2, marginBottom: 14 },
  strengthBar: { flex: 1, height: 4, borderRadius: rounded.xs },
  strengthLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.bold, width: 44, textAlign: 'right' },

  // Password rules (step 3) //
  rulesCard: { borderWidth: 1, borderRadius: rounded.xl - 2, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.raised, 
    padding: spacing[4], marginBottom: spacing[6], gap: spacing[2] + 2 }, // prettier-ignore
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] + 2 },
  ruleDot: { color: colors.content.tertiary, fontSize: typography.size.sm - 1, fontWeight: typography.weight.bold, width: 16 },
  ruleDotMet: { color: colors.accent.green },
  ruleText: { color: colors.content.tertiary, fontSize: typography.size.sm - 1 },
  ruleTextMet: { color: colors.content.primary },

  backToHome: { alignItems: 'center', marginTop: spacing[5] },
  backToHomeText: { color: colors.content.tertiary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
});
