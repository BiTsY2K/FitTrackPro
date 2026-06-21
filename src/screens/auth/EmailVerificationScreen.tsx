import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
Animated, 
    KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration,
    View, } from 'react-native'; // prettier-ignore
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/common/Button';
import OtpCodeInput from '@/components/common/OtpCodeInput';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth/AuthService';

// ── Types ─────────────────────────────────────────────────────────────────────

// ── Helper: mask email ────────────────────────────────────────────────────────
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local.slice(0, 2) + '****' + local.slice(local.length - 3);
  return `${masked}@${domain}`;
};

// ── Progress Steps Bar ────────────────────────────────────────────────────────────
function ProgressStepsBar({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={stepStyles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < step;
        const active = i === step - 1;
        return <View key={i} style={[stepStyles.bar, done ? stepStyles.done : stepStyles.inactive, active && stepStyles.active]} />;
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 32 },
  bar: { flex: 1, height: 4, borderRadius: 4 },
  inactive: { backgroundColor: COLORS.border },
  done: { backgroundColor: COLORS.accentDim },
  active: { backgroundColor: COLORS.accent, flex: 3 },
});

// ── Security Badges ───────────────────────────────────────────────────────────
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
  row: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  badge: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  icon: { fontSize: 16 },
  label: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
});

// ── Main Screen: EmailVerificationScreen ───────────────────────────────────────────────────────────────
export default function EmailVerificationScreen({ navigation, route }: any) {
  const { user } = useAuth();

  const email = route?.params?.email ?? 'alex.morgan@gmail.com';
  const maskedEmail = maskEmail(email);

  const [otp, setOtp] = useState('');
  const [otpVerificationStep, setOtpVerificationStep] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const errorShake = useRef(new Animated.Value(0)).current;
  const successBannerAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    // Check email verification status every 3 seconds
    const interval = setInterval(async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          navigation.replace('Onboarding');
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendTimer, resendCount]);

  useEffect(() => {
    // Auto-verify when 6 digits entered
    if (otp.length === 6 && otpVerificationStep === 'idle') {
      handleVerify(otp);
    }
  }, [otp]);

  const handleVerify = useCallback((code: string) => {
    setOtpVerificationStep('verifying');
    // Simulate API call — replace with real verification
    setTimeout(() => {
      if (code === '123456') {
        setOtpVerificationStep('verified');
        Vibration.vibrate(100);
        Animated.spring(successBannerAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 10,
        }).start();
      } else {
        setOtpVerificationStep('error');
        setErrorMsg('Incorrect code. Please try again.');
        setOtp('');

        // Shake animation
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

  const handleResend = async () => {
    setOtp('');
    setErrorMsg('');
    setOtpVerificationStep('idle');
    setResendCount(c => c + 1);
    setResendTimer(60);

    try {
      await authService.resendEmailVerification();
    } catch {
      // Ignore //
    }
  };

  const otpVerified = otpVerificationStep === 'verified';
  const otpVerifying = otpVerificationStep === 'verifying';
  const hasOtpError = otpVerificationStep === 'error' || !!errorMsg;

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ambient Glow blobs */}
          <View style={styles.glowBlobTR} />
          <View style={styles.glowBlobBL} />

          {/* Header row */}
          <View style={styles.headerRow}>
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <View style={styles.backCircle}>
                <Text style={styles.backArrow}>←</Text>
                <Text style={styles.backText}>Back</Text>
              </View>
            </TouchableOpacity>

            {/* Logo mark */}
            <View style={styles.logoRow}>
              <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.logoBadge}>
                <Text style={styles.logoIcon}>⚡</Text>
              </LinearGradient>
              <Text style={styles.logoText}>FitTrack PRO</Text>
            </View>
          </View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Progress steps: <ProgressSteps verified={verified} /> */}
            {/* Envelope hero: <EnvelopeHero verified={verified} />*/}

            <View style={styles.iconBadge}>
              <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.iconGradient}>
                <Text style={styles.iconEmoji}>⚡</Text>
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={[styles.title, otpVerified && styles.titleVerified]}>
              {otpVerified ? "You're Verified!" : 'Verify Your Email'}
            </Text>
            {!otpVerified && <Text style={styles.subtitle}>We sent a 6-digit code to {maskedEmail || 'your email'}</Text>}

            {/* Step progress */}
            <ProgressStepsBar step={1} total={1} />

            {/* Success banner */}
            {otpVerified && (
              <Animated.View
                style={[
                  styles.successBanner,
                  {
                    opacity: successBannerAnim,
                    transform: [{ scale: successBannerAnim }],
                  },
                ]}
              >
                <View style={styles.successBannerIcon}>
                  <Text style={{ fontSize: 18 }}>🎉</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.successTitle}>Email Verified Successfully!</Text>
                  <Text style={styles.successSub}>Your account is now active. Welcome to FitTrack PRO.</Text>
                </View>
              </Animated.View>
            )}

            {/* OTP Input */}
            {!otpVerified && (
              <Animated.View style={{ transform: [{ translateX: errorShake }] }}>
                <OtpCodeInput
                  value={otp}
                  onChange={v => {
                    setOtp(v);
                    if (errorMsg) setErrorMsg('');
                  }}
                  verified={otpVerified}
                  hasError={hasOtpError}
                />

                {/* Error */}
                {errorMsg ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠ {errorMsg}</Text>
                  </View>
                ) : null}

                <Button
                  label={otpVerifying ? 'Verifying…' : 'Verify Email →'}
                  onPress={() => handleVerify(otp)}
                  disabled={otp.length < 6}
                  loading={otpVerifying}
                />

                {/* Resend */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendLabel}>Didn't receive it? </Text>
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
                    <Text style={{ fontSize: 14 }}>📨</Text>
                    <Text style={styles.resendConfirmText}>
                      New code sent! <Text style={{ color: COLORS.accent }}>({resendCount} sent)</Text>
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Security badges */}
            <SecurityBadges />

            {/* Post-verify CTAs */}
            {otpVerified && (
              <View>
                <Button label="Start Training Now ⚡" onPress={() => navigation.navigate('Dashboard')} />
                <Button label="Go to Dashboard →" onPress={() => navigation.navigate('Dashboard')} variant="ghost" />
              </View>
            )}

            {/* Help */}
            {!otpVerified && (
              <View style={styles.helpRow}>
                <Text style={styles.helpText}>Having trouble? </Text>
                <TouchableOpacity>
                  <Text style={styles.helpLink}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardAvoidingView: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 52,
    flexGrow: 1,
  },

  glowBlobTR: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0,255,135,0.05)',
  },
  glowBlobBL: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124,58,237,0.06)',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
    marginTop: -14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: COLORS.text, fontSize: 16 },
  backText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28 },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 14 },
  logoText: { color: COLORS.text, fontWeight: '800', fontSize: 14 },

  // Icon badge //
  iconBadge: { marginBottom: 24 },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  iconEmoji: { fontSize: 30 },

  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  titleVerified: { color: COLORS.accent },

  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0,255,135,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  successBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,135,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  successTitle: { color: COLORS.accent, fontWeight: '800', fontSize: 14, marginBottom: 2 },
  successSub: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },

  errorBox: {
    backgroundColor: 'rgba(255,76,106,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,76,106,0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },

  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  resendLabel: { color: COLORS.textMuted, fontSize: 13 },
  timerText: { color: COLORS.textMuted, fontSize: 13 },
  timerAccent: { color: COLORS.accent, fontWeight: '700' },
  resendLink: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },

  resendConfirm: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCard, 
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 16 }, // prettier-ignore
  resendConfirmText: { color: COLORS.textMuted, fontSize: 12, flex: 1 },

  helpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  helpText: { color: COLORS.textMuted, fontSize: 12 },
  helpLink: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
});
