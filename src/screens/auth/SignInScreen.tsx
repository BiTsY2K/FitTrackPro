import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '@/components/common/Button';
import InputField from '@/components/common/InputField';
import { Divider, SocialButton } from '@/components/common/SharedComponents';
import { useAuth } from '@/contexts/AuthContext';
import { globalStyles } from '@/globalStyles';
import { AuthStackParamList } from '@/navigation/AuthNavigation';
import { colors, rounded, spacing, typography } from '@/themes';
import { validateEmail } from '@/utils/security';

// ── SignIn Sreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type SignInScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: { navigation: SignInScreenNavigationProp }) {
  const headerHeight = useHeaderHeight();
  const { signIn, signInWithGoogle, loading, clearError } = useAuth();

  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [biometricActive, setBiometricActive] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Entrance animation //
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Real-time email validation //
  const handleEmailChange = (text: string) => {
    setEmail(text);
    clearError();

    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
      setIsFormValid(false);
    } else {
      setEmailError('');
      setIsFormValid(!!text && !!password);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    clearError();
    setIsFormValid(!!email && !!text && !emailError);
  };

  const handleUserSignIn = async () => {
    if (!isFormValid) return;
    try {
      await signIn(email, password); // Navigation handled by AuthContext
    } catch (error) { console.error('Handle_User_SignIn. Error: ', error) } // prettier-ignore
  };

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
              <LinearGradient colors={[colors.accent.green, colors.accent.purple]} style={styles.iconGradient}>
                <Text style={styles.iconEmoji}>⚡</Text>
              </LinearGradient>
            </View>

            {/* Heading */}
            <Text style={globalStyles.title}>Welcome Back</Text>
            <Text style={globalStyles.subtitle}>
              Ready to crush today's workout?{'\n'}Let’s pick up where you left off and hit your goals today.
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
              inputRef={emailRef}
              testID="signin-email-input"
              leftIcon={<MaterialCommunityIcons name="email-outline" color={colors.content.tertiary} size={24} />}
              placeholder="Email address"
              value={email}
              onChangeText={handleEmailChange}
              autoFocus
              error={emailError}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <InputField
              inputRef={passwordRef}
              testID="signin-password-input"
              leftIcon={<MaterialCommunityIcons name="lock-outline" color={colors.content.tertiary} size={24} />}
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              editable={!loading}
              onSubmitEditing={() => handleUserSignIn()}
            />

            <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword', { email: email })}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In CTA */}
            <Button label="Sign In" onPress={handleUserSignIn} style={styles.submitBtn} disabled={loading} loading={loading} />

            {/* Biometric toggle */}
            <TouchableOpacity
              onPress={() => setBiometricActive(!biometricActive)}
              style={[styles.biometricBtn, biometricActive && styles.biometricBtnActive]}
            >
              <MaterialCommunityIcons name="line-scan" color={colors.content.secondary} size={24} />
              <Text style={[styles.biometricLabel, biometricActive && styles.biometricLabelActive]}>
                {biometricActive ? 'Touch ID Active' : 'Use Touch ID / Face ID'}
              </Text>
            </TouchableOpacity>

            <Divider label="or continue with" />

            <View style={styles.socialRow}>
              <SocialButton icon="logo-google" label="Google" onPress={signInWithGoogle} />
              <SocialButton icon="logo-apple" label="Apple" onPress={() => {}} />
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?{'  '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Create Account →</Text>
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
  forgotRow: { alignSelf: 'flex-end', marginBottom: spacing[6], marginTop: -spacing[2] },
  forgotText: { color: colors.accent.green, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  submitBtn: { marginBottom: spacing[3] + 2 },

  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing[3] + 2,
    borderWidth: 1,
    borderRadius: rounded.lg + 2,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
  },
  biometricBtnActive: { borderColor: colors.accent.green, backgroundColor: 'rgba(0,255,135,0.08)' },
  biometricLabel: { color: colors.content.secondary, fontWeight: typography.weight.semibold, fontSize: typography.size.sm },
  biometricLabelActive: { color: colors.accent.green },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing[3] },

  footer: { flexDirection: 'row', justifyContent: 'center', marginVertical: spacing[8] },
  footerText: { color: colors.content.tertiary, fontSize: typography.size.sm },
  footerLink: { color: colors.accent.green, fontWeight: typography.weight.bold, fontSize: typography.size.sm },
});
