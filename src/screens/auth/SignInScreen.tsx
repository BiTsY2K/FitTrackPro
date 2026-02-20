import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigation';
import { COLORS } from '@/constants/theme';
import { Divider, SocialButton } from '@/components/common/SharedComponents';
import InputField from '@/components/common/InputField';
import GlowButton from '@/components/common/GlowButton';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricActive, setBiometricActive] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Glow blob */}
          <View style={styles.glowBlobBL} />
          <View style={styles.glowBlobTR} />

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⚡</Text>
            </LinearGradient>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Ready to crush today's workout?</Text>

            {/* Form */}
            <View style={styles.form}>
              <InputField
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <InputField
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <GlowButton label="Sign In" onPress={() => {}} style={styles.submitBtn} />

              {/* Biometric toggle */}
              <TouchableOpacity
                onPress={() => setBiometricActive(!biometricActive)}
                style={[styles.biometricBtn, biometricActive && styles.biometricBtnActive]}
              >
                <Text style={styles.biometricIcon}>👆</Text>
                <Text
                  style={[styles.biometricLabel, biometricActive && styles.biometricLabelActive]}
                >
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
    padding: 28,
    paddingBottom: 48,
  },
  glowBlobBL: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0,255,135,0.05)',
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
  backBtn: {
    marginTop: 24,
    marginBottom: 24,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIcon: { fontSize: 26 },
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
    marginTop: 4,
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
