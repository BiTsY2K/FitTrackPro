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
import { validateEmail } from '@/utils/security';
import InputField from '@/components/common/InputField';
import GlowButton from '@/components/common/GlowButton';

type SignInScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: { navigation: SignInScreenNavigationProp }) {
  const { signIn, loading, error, clearError } = useAuth();

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

  // Real-time email validation
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
    console.log('User Sign In Credentials: Email: ', email, 'Password: ', password);
    if (!isFormValid) return;

    try {
      await signIn(email, password); // Navigation handled by AuthContext
      navigation.navigate('EmailVerification', { email: email }); // Show email verification screen
    } catch (error) {
      // Error displayed via context
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Glow blob */}
          <View style={styles.glowBlobBL} />
          <View style={styles.glowBlobTR} />

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
            <View style={styles.iconBadge}>
              <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.iconGradient}>
                <Text style={styles.iconEmoji}>⚡</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Ready to crush today's workout?</Text>

            {/* Form */}
            <View style={styles.form}>
              <InputField
                inputRef={emailRef}
                icon="mail-outline"
                placeholder="Email address"
                keyboardType="email-address"
                value={email}
                onChangeText={handleEmailChange}
                autoFocus
                error={emailError}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <InputField
                inputRef={passwordRef}
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                onSubmitEditing={() => handleUserSignIn()}
              />

              <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <GlowButton label="Sign In" onPress={handleUserSignIn} style={styles.submitBtn} />

              {/* Biometric toggle */}
              <TouchableOpacity
                onPress={() => setBiometricActive(!biometricActive)}
                style={[styles.biometricBtn, biometricActive && styles.biometricBtnActive]}
              >
                <Text style={styles.biometricIcon}>👆</Text>
                <Text style={[styles.biometricLabel, biometricActive && styles.biometricLabelActive]}>
                  {biometricActive ? 'Touch ID Active' : 'Use Touch ID / Face ID'}
                </Text>
              </TouchableOpacity>

              <Divider label="or continue with" />

              <View style={styles.socialRow}>
                <SocialButton icon="logo-google" label="Google" onPress={() => {}} />
                <SocialButton icon="logo-apple" label="Apple" onPress={() => {}} />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.footerLink}>Create Account →</Text>
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

  glowBlobBL: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124,58,237,0.06)',
  },
  glowBlobTR: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
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
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginBottom: 36,
  },
  form: {},
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    marginBottom: 14,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  biometricBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(0,255,135,0.08)',
  },
  biometricIcon: { fontSize: 22 },
  biometricLabel: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  biometricLabelActive: {
    color: COLORS.accent,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
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
});
