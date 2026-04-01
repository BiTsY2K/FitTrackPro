import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/common/BrandLogo';
import GlowButton from '@/components/common/GlowButton';
import { SectionLabel } from '@/components/common/SectionLabel';
import { globalStyles } from '@/globalStyles';
import { RootStackParamList } from '@/navigation/RootNavigation';
import { colors, rounded, spacing, typography } from '@/themes';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: '⚡', title: 'Smart Workouts', desc: 'AI-powered plans tailored to you', accent: colors.accent.green },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time body & performance data', accent: colors.accent.blue },
  { icon: '🔥', title: 'Streak System', desc: 'Stay consistent, earn rewards', accent: colors.accent.orange },
  { icon: '🧬', title: 'Recovery Intel', desc: 'Sleep, HRV & readiness scores', accent: colors.accent.purple },
];

const AVATARS = ['👨‍💪', '👩‍🏋️', '🧗', '🏃'];

// ── Landing Sreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const ring1Rot = useRef(new Animated.Value(0)).current;
  const ring2Rot = useRef(new Animated.Value(0)).current;
  const ring3Rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in hero content //
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    // Pulse glow badge //
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();

    // Spinning rings //
    const spinRing = (anim: Animated.Value, duration: number) =>
      Animated.loop(Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true })).start();

    spinRing(ring1Rot, 20000);
    spinRing(ring2Rot, 28000);
    spinRing(ring3Rot, 36000);
  }, []);

  const spin1 = ring1Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = ring2Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin3 = ring3Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[globalStyles.safe, styles.alignItemsCenter]}>
      <LinearGradient colors={[colors.surface.base, colors.surface.page]}>
        {/* ── Decorative Rings ── */}
        <Animated.View style={[styles.ring, styles.ring1, { transform: [{ rotate: spin1 }] }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ rotate: spin2 }] }]} />
        <Animated.View style={[styles.ring, styles.ring3, { transform: [{ rotate: spin3 }] }]} />

        {/* ── Glow blob ── */}
        <View style={[globalStyles.glowAmbientBlobTR, styles.glowBlob]} />

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
          {/* ── Hero Section ── */}
          <View style={[styles.hero]}>
            {/* Brand Logo */}
            <BrandLogo
              containerStyle={styles.logoRow}
              badgeStyle={styles.logoBadge}
              iconStyle={styles.logoIcon}
              textStyle={styles.logoText}
            />

            {/* Rating badge */}
            <View style={styles.ratingBadge}>
              <View style={styles.ratingTitle}>
                <Text style={styles.ratingScore}>4.9</Text>
                <Text style={styles.ratingStar}>★</Text>
              </View>
              <Text style={styles.ratingSubTitle}>500K+ Users</Text>
            </View>

            {/* Hero Content */}
            <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Animated.View style={[styles.heroBadge, { opacity: pulseAnim }]}>
                <Text style={styles.heroBadgeText}>#1 FITNESS APP 2025</Text>
              </Animated.View>

              <View style={styles.heroTitleContainer}>
                <Text style={styles.heroTitle}>TRAIN</Text>
                <Text style={[styles.heroTitle, styles.heroTitleAccent]}>SMARTER.</Text>
                <Text style={styles.heroTitle}>GET RESULTS.</Text>
              </View>

              <Text style={styles.heroSubtitle}>
                Your intelligent training companion.{'\n'}Science-backed workouts, real-time analytics, unstoppable progress.
              </Text>

              <GlowButton
                label="Start Free — No Credit Card"
                onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}
                style={styles.ctaBtn}
              />

              {/* Sign In */}
              <View style={styles.signInLinkContainer}>
                <Text style={styles.signInLinkContainerText}>Already a member?{'  '}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'SignIn' })}>
                  <Text style={styles.signInLinkAccent}>Sign In →</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* ── Features ── */}
          <View style={styles.featuresSection}>
            <SectionLabel>WHY FITTRACK PRO</SectionLabel>

            <View style={styles.featuresGrid}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureCard}>
                  <View style={[styles.featureTopBar, { backgroundColor: f.accent }]} />
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>

            {/* Social Proof */}
            <View style={styles.socialProof}>
              <View style={styles.avatarRow}>
                {AVATARS.map((a, i) =>
                  /* prettier-ignore */
                  <View key={i} style={[styles.avatar, i > 0 && styles.avatarLeftMargin, 
                    { backgroundColor: `hsl(${i * 60 + 140}, 50%, 30%)` }]}> 
                      <Text style={styles.avatarEmoji}>{a}</Text>
                  </View>,
                )}
              </View>
              <View>
                <Text style={styles.socialTitle}>Join 500,000+ athletes</Text>
                <Text style={styles.socialSub}>transforming their bodies daily</Text>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  alignItemsCenter: { alignItems: 'center' },
  hero: { minHeight: 520 },
  glowBlob: { top: -60, left: -60, width: 280, height: 280, borderRadius: rounded.full },

  ring: { position: 'absolute', borderColor: colors.border.brand, borderRadius: 999, borderWidth: 1 },
  ring1: { width: 280, height: 280, opacity: 0.3, top: '5%', right: -84 },
  ring2: { width: 220, height: 220, opacity: 0.4, top: '10%', right: -66 },
  ring3: { width: 160, height: 160, opacity: 0.5, top: '15%', right: -48 },

  logoRow: { position: 'absolute', top: spacing[7], left: 0 },
  logoBadge: { width: 34, height: 34, borderRadius: rounded.md + 2 },
  logoIcon: { fontSize: typography.size.lg },
  logoText: { fontSize: typography.size['2xl'] },

  ratingBadge: {
    position: 'absolute',
    top: spacing['3xl'],
    right: 0,
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface.glass,
    padding: spacing[4] - 2,
    alignItems: 'center',
  },

  ratingTitle: { flexDirection: 'row', alignItems: 'baseline', gap: spacing['0.5'] },
  ratingScore: { color: colors.accent.green, fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  ratingStar: { color: colors.accent.green, fontSize: typography.size.sm },
  ratingSubTitle: { color: colors.content.tertiary, fontSize: typography.size.xs, marginTop: spacing['0.5'] },

  heroContent: { marginTop: 160 },
  heroBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: rounded['2xl'] - 4,
    borderColor: 'rgba(0,255,135,0.25)',
    backgroundColor: 'rgba(0,255,135,0.12)',
    paddingHorizontal: spacing[4] - 2,
    paddingVertical: spacing[1],
    marginBottom: spacing.md + 2,
  },
  heroBadgeText: { color: colors.accent.green, fontSize: typography.size.xs, fontWeight: typography.weight.bold, letterSpacing: 1.5 },
  heroTitleContainer: { marginBottom: spacing[4] },
  heroTitle: { color: colors.content.primary, fontSize: typography.size['5xl'], fontWeight: '900', lineHeight: 46, letterSpacing: -1 },
  heroTitleAccent: { color: colors.accent.green },
  heroSubtitle: { color: colors.content.tertiary, fontSize: typography.size.md - 1, lineHeight: 24, marginBottom: spacing[7] },

  ctaBtn: { marginBottom: spacing.md },
  signInLinkContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signInLinkContainerText: { color: colors.content.tertiary },
  signInLinkAccent: { color: colors.accent.green, fontWeight: typography.weight.bold, fontSize: typography.size.sm },

  // Features
  featuresSection: { paddingTop: spacing[8], backgroundColor: 'transparent' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] + 2, marginBottom: spacing[5] },
  featureCard: {
    borderWidth: 1,
    borderRadius: rounded['2xl'] - 4,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface.raised,
    // Formula: (width - PADDING - GAP * (COLUMNS - 1)) / COLUMNS
    width: (width - 2 * globalStyles.content.paddingHorizontal - (spacing[3] + 2) * (2 - 1)) / 2,
    padding: spacing.md + 2,
    overflow: 'hidden',
  },
  featureTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.9,
    borderTopLeftRadius: rounded['2xl'] - 4,
    borderTopRightRadius: rounded['2xl'] - 4,
  },
  featureIcon: { fontSize: typography.size['3xl'] - 2, marginBottom: spacing[3] - 2 },
  featureTitle: {
    color: colors.content.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
    marginBottom: spacing[1],
  },
  featureDesc: { color: colors.content.tertiary, fontSize: typography.size.xs, lineHeight: 18 },

  socialProof: {
    borderWidth: 1,
    borderRadius: rounded['2xl'] - 4,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface.raised,
    padding: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing[3] - 2,
  },

  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderWidth: rounded.xs - 2, borderRadius: rounded.full, 
    borderColor: colors.surface.raised, alignItems: 'center', justifyContent: 'center' }, // prettier-ignore
  avatarLeftMargin: { marginLeft: -(spacing[3] - 2) },
  avatarEmoji: { fontSize: typography.size.md },

  socialTitle: { color: colors.content.primary, fontWeight: typography.weight.bold, fontSize: typography.size.sm },
  socialSub: { color: colors.content.tertiary, fontSize: typography.size.xs, marginTop: spacing['0.5'] },
});
