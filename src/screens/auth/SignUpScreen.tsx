import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, 
  KeyboardAvoidingView, Platform, TextInput
} from 'react-native'; // prettier-ignore
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '@/navigation/AuthNavigation';
import { COLORS } from '@/constants/theme';
import { Divider, SocialButton } from '@/components/common/SharedComponents';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail, validatePasswordStrength } from '@/utils/security';
import InputField from '@/components/common/InputField';
import GlowButton from '@/components/common/GlowButton';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

const GOALS = [
  { id: 'lose', label: '🔥 Lose Weight' },
  { id: 'build', label: '💪 Build Muscle' },
  { id: 'endure', label: '🏃 Endurance' },
  { id: 'flex', label: '🧘 Flexibility' },
];

export default function SignUpScreen({ navigation }: { navigation: SignUpScreenNavigationProp }) {
  const { signUp, loading, clearError } = useAuth();

  const nameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [goal, setGoal] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateForm = (n: string, e: string, p: string, cp: string) => {
    if (e && !validateEmail(e)) {
      setEmailError('Please enter a valid email address');
    } else { setEmailError('') } // prettier-ignore

    const passwordValidation = validatePasswordStrength(p);
    const isValid = n.length >= 2 && validateEmail(e) && passwordValidation.isValid && p === cp;
    setIsFormValid(isValid);
  };

  const handleSignUp = async () => {
    validateForm(name, email, password, confirmPassword);
    if (!isFormValid) return;

    try {
      await signUp(email, password, name);
      // navigation.navigate('EmailVerification', { email: email }); // Show email verification screen
    } catch (error) {
      // Error displayed via context
    }
  };

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

  const strength = getStrength(password) || 0;
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', COLORS.SEMANTIC.error, '#FF9500', '#FFD700', COLORS.accent];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
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
            {/* Header */}
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>✦ FREE FOREVER PLAN INCLUDED</Text>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join 500K+ athletes already tracking their gains</Text>

            {/* Progress bar */}
            <View style={styles.progressRow}>
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={[styles.progressBar, { flex: i === 0 ? 2 : 1 }, i === 0 ? styles.progressBarActive : styles.progressBarInactive]}
                />
              ))}
            </View>

            {/* Form */}
            <InputField
              inputRef={nameRef}
              id="name"
              icon="person-outline"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              textContentType="name"
              editable={!loading}
            />
            <InputField
              inputRef={emailRef}
              id="email"
              icon="mail-outline"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              error={emailError}
              editable={!loading}
            />
            <InputField
              inputRef={passwordRef}
              id="password"
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              editable={!loading}
            />

            <InputField
              inputRef={confirmPasswordRef}
              id="confirmPassword"
              icon="lock-closed-outline"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="password"
              editable={!loading}
            />

            {password.length > 0 && (
              <View>
                {/* Strength meter */}
                {strength > 0 && (
                  <View style={styles.strengthRow}>
                    {[1, 2, 3, 4].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: i <= strength ? strengthColors[strength] : COLORS.border,
                          },
                        ]}
                      />
                    ))}
                    <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>{strengthLabels[strength]}</Text>
                  </View>
                )}

                {/* Password rules */}
                <View style={styles.rulesCard}>
                  {[
                    { rule: 'At least 8 characters', met: password.length >= 8 },
                    { rule: 'One uppercase letter', met: /[A-Z]/.test(password) },
                    { rule: 'One number', met: /[0-9]/.test(password) },
                    {
                      rule: 'Passwords match',
                      met: confirmPassword && password === confirmPassword,
                    },
                  ].map((r, i) => (
                    <View key={i} style={styles.ruleRow}>
                      <Text style={[styles.ruleDot, r.met && styles.ruleDotMet]}>{r.met ? '✓' : '○'}</Text>
                      <Text style={[styles.ruleText, r.met && styles.ruleTextMet]}>{r.rule}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Goal Selector */}
            <Text style={styles.goalLabel}>PRIMARY FITNESS GOAL</Text>
            <View style={styles.goalGrid}>
              {GOALS.map(g => {
                const isSelected = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGoal(g.id)}
                    style={[styles.goalCard, isSelected && styles.goalCardActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.goalText, isSelected && styles.goalTextActive]}>{g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <GlowButton label="Create My Account" onPress={handleSignUp} style={styles.submitBtn} loading={loading} disabled={loading} />

            <Text style={styles.legal}>
              By signing up you agree to our <Text style={styles.legalLink}>Terms</Text> &{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Text>

            <Divider label="or sign up with" />

            <View style={styles.socialRow}>
              <SocialButton icon={'logo-google'} label="Google" onPress={() => {}} />
              <SocialButton icon={'logo-apple'} label="Apple" onPress={() => {}} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.footerLink}>Sign In →</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,255,135,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
  },
  freeBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 28,
  },
  progressBar: {
    height: 4,
    borderRadius: 4,
  },
  progressBarActive: {
    backgroundColor: COLORS.accent,
  },
  progressBarInactive: {
    backgroundColor: COLORS.border,
  },
  goalLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 4,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  goalCard: {
    width: '47%',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
  },
  goalCardActive: {
    borderColor: COLORS.accent,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { backgroundColor: `${COLORS.accent}14` },
      default: { backgroundColor: `${COLORS.accent}14` },
    }),
    elevation: 6,
  },
  goalText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  goalTextActive: {
    color: COLORS.accent,
  },
  submitBtn: {
    marginBottom: 16,
  },
  legal: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  legalLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'center',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 14,
  },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
    marginBottom: 14,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    width: 44,
    textAlign: 'right',
  },

  // Password rules (step 3)
  rulesCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleDot: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', width: 16 },
  ruleDotMet: { color: COLORS.accent },
  ruleText: { color: COLORS.textMuted, fontSize: 13 },
  ruleTextMet: { color: COLORS.text },
});
