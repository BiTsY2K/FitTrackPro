import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import { SectionLabel } from '@/components/common/SectionLabel';
import { Divider, SocialButton } from '@/components/common/SharedComponents';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { globalStyles } from '@/globalStyles';
import { AuthStackParamList } from '@/navigation/AuthNavigation';
import { GOAL_OPTIONS } from '@/screens/onboarding/GoalSelectionScreen';
import { colors, rounded, spacing, typography } from '@/themes';
import { GoalType } from '@/types/onboarding.types';
import { validateEmail, validatePasswordStrength } from '@/utils/security';

const { width } = Dimensions.get('window');

// ── SignUp Sreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: { navigation: SignUpScreenNavigationProp }) {
  const headerHeight = useHeaderHeight();

  const { signUp, loading } = useAuth();

  const nameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [goal, setGoal] = useState<GoalType | null>('gain_muscle');
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
      await signUp(email, password, name); // Navigation handled by AuthContext
      // navigation.navigate('EmailVerification', { email: email }); // Show email verification screen
    } catch (error) { console.error('Handle_User_SignUp. Error: ', error) } // prettier-ignore
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
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* ── Header ── */}
          <View style={globalStyles.header}>
            <View style={styles.iconBadge}>
              <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.iconGradient}>
                <Text style={styles.iconEmoji}>⚡</Text>
              </LinearGradient>
            </View>

            {/* <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>✦ FREE FOREVER PLAN INCLUDED</Text>
          </View> */}

            <Text style={globalStyles.title}>Create Account</Text>
            <Text style={globalStyles.subtitle}>
              Set your goals. Track your progress. Become your best.{'\n'}Join 500K+ athletes already tracking their gains
            </Text>

            {/* Progress bar */}
            <View style={styles.progressRow}>
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={[
                    styles.progressBar,
                    i === 0 ? styles.flex_x2 : styles.flex_x1,
                    i === 0 ? styles.progressBarActive : styles.progressBarInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>
            <InputField
              inputRef={nameRef}
              testID="signup-user-name-input"
              leftIcon={<MaterialIcons name="person-outline" color={colors.content.tertiary} size={24} />}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoFocus
              error={''}
              keyboardType="default"
              textContentType="name"
              editable={!loading}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <InputField
              inputRef={emailRef}
              testID="signup-email-input"
              leftIcon={<MaterialCommunityIcons name="email-outline" color={colors.content.tertiary} size={24} />}
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
              testID="signup-password-input"
              leftIcon={<MaterialCommunityIcons name="lock-outline" color={colors.content.tertiary} size={24} />}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              editable={!loading}
            />

            <InputField
              inputRef={confirmPasswordRef}
              testID="signup-confirm-password-input"
              leftIcon={<MaterialCommunityIcons name="checkbox-marked-circle-outline" color={colors.content.tertiary} size={24} />}
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
            <SectionLabel>PRIMARY FITNESS GOAL</SectionLabel>
            <View style={styles.goalGrid}>
              {GOAL_OPTIONS.map(g => {
                const isSelected = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGoal(g.id)}
                    style={[styles.goalCard, isSelected && styles.goalCardActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.goalText, isSelected && styles.goalTextActive]}>{`${g.iconEmoji}  ${g.title}`}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button label="Create My Account" onPress={handleSignUp} style={styles.submitBtn} loading={loading} disabled={loading} />
          </View>

          <Text style={styles.legal}>
            By signing up you agree to our{'  '}
            <Text style={styles.legalLink}>Terms</Text>
            {'  '}&{'  '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>

          <Divider label="or sign up with" />

          <View style={styles.socialRow}>
            <SocialButton icon={'logo-google'} label="Google" onPress={() => {}} />
            <SocialButton icon={'logo-apple'} label="Apple" onPress={() => {}} />
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?{'  '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.footerLink}>Sign In →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: rounded.xl2 - 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  iconBadge: { marginBottom: spacing[6] },
  iconEmoji: { fontSize: typography.size.xl3 },

  flex_x1: { flex: 1 },
  flex_x2: { flex: 2 },
  progressRow: { flexDirection: 'row', gap: spacing.xs1, marginTop: spacing.md },
  progressBar: { height: spacing.xs1, borderRadius: rounded.full },
  progressBarActive: { backgroundColor: colors.accent.green },
  progressBarInactive: { backgroundColor: colors.border.default },

  form: {},
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing[3], marginBottom: spacing[6] },
  goalCard: {
    // Formula: (width - PADDING - GAP * (COLUMNS - 1)) / COLUMNS
    width: (width - 2 * globalStyles.content.paddingHorizontal - spacing[3] * (2 - 1)) / 2,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing['3.5'],

    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
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
  goalText: { color: colors.content.secondary, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },
  goalTextActive: { color: colors.accent.green },
  submitBtn: { marginBottom: spacing['3.5'] },

  legal: { textAlign: 'center', color: colors.content.tertiary, fontSize: typography.size.xs, lineHeight: 18 },
  legalLink: { color: colors.accent.green, fontWeight: typography.weight.semibold },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing[3] },

  footer: { flexDirection: 'row', justifyContent: 'center', marginVertical: spacing[8] },
  footerText: { color: colors.content.tertiary, fontSize: typography.size.sm },
  footerLink: { color: colors.accent.green, fontWeight: typography.weight.bold, fontSize: typography.size.sm },

  // ── Strength meter ── //
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs1, marginBottom: spacing.xs },
  strengthBar: { flex: 1, height: spacing[1], borderRadius: rounded.full },
  strengthLabel: { minWidth: spacing[12], fontSize: typography.size.xs, fontWeight: typography.weight.bold, textAlign: 'right' },

  // ── Password rules ── //
  rulesCard: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ruleDot: { color: colors.content.tertiary, fontSize: typography.size.xs + 1, fontWeight: typography.weight.bold, width: spacing.xs },
  ruleDotMet: { color: colors.accent.green },
  ruleText: { color: colors.content.tertiary, fontSize: typography.size.xs + 1 },
  ruleTextMet: { color: colors.content.primary },
});
