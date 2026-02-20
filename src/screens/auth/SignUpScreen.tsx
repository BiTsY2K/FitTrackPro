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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigation';
import InputField from '@/components/common/InputField';
import GlowButton from '@/components/common/GlowButton';
import { COLORS } from '@/constants/theme';
import { Divider, SocialButton } from '@/components/common/SharedComponents';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const GOALS = [
  { id: 'lose', label: '🔥 Lose Weight' },
  { id: 'build', label: '💪 Build Muscle' },
  { id: 'endure', label: '🏃 Endurance' },
  { id: 'flex', label: '🧘 Flexibility' },
];

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [goal, setGoal] = useState<string | null>(null);

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
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Glow blobs */}
          <View style={styles.glowBlobTR} />
          <View style={styles.glowBlobBL} />

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

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
                  style={[
                    styles.progressBar,
                    { flex: i === 0 ? 2 : 1 },
                    i === 0 ? styles.progressBarActive : styles.progressBarInactive,
                  ]}
                />
              ))}
            </View>

            {/* Form */}
            <InputField
              id="name"
              icon="person-outline"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
            />
            <InputField
              id="email"
              icon="mail-outline"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <InputField
              id="pswd"
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <InputField
              id="cnfrmpswd"
              icon="lock-closed-outline"
              placeholder="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

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
                    <Text style={[styles.goalText, isSelected && styles.goalTextActive]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <GlowButton label="Create My Account 🚀" onPress={() => {}} style={styles.submitBtn} />

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
    padding: 28,
    paddingBottom: 48,
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
  backBtn: {
    marginTop: 24,
    marginBottom: 24,
  },
  backText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
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
    backgroundColor: 'rgba(0,255,135,0.1)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
});
