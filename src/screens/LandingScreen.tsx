import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '@/constants/theme';
import GlowButton from '@/components/common/GlowButton';
import { RootStackParamList } from '@/navigation/RootNavigation';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

const FEATURES = [
  {
    icon: '⚡',
    title: 'Smart Workouts',
    desc: 'AI-powered plans tailored to you',
    accent: COLORS.accent,
  },
  {
    icon: '📊',
    title: 'Live Analytics',
    desc: 'Real-time body & performance data',
    accent: COLORS.blue,
  },
  {
    icon: '🔥',
    title: 'Streak System',
    desc: 'Stay consistent, earn rewards',
    accent: COLORS.orange,
  },
  {
    icon: '🧬',
    title: 'Recovery Intel',
    desc: 'Sleep, HRV & readiness scores',
    accent: COLORS.purple,
  },
];

const AVATARS = ['👨‍💪', '👩‍🏋️', '🧗', '🏃'];

export default function LandingScreen({ navigation }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const ring1Rot = useRef(new Animated.Value(0)).current;
  const ring2Rot = useRef(new Animated.Value(0)).current;
  const ring3Rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in hero content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse glow badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();

    // Spinning rings
    const spinRing = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ).start();

    spinRing(ring1Rot, 20000);
    spinRing(ring2Rot, 28000);
    spinRing(ring3Rot, 36000);
  }, []);

  const spin1 = ring1Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = ring2Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin3 = ring3Rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── Hero Section ── */}
        <LinearGradient colors={['#0D1A14', '#0A0A0F']} style={styles.hero}>
          {/* Decorative Rings */}
          <Animated.View style={[styles.ring, styles.ring1, { transform: [{ rotate: spin1 }] }]} />
          <Animated.View style={[styles.ring, styles.ring2, { transform: [{ rotate: spin2 }] }]} />
          <Animated.View style={[styles.ring, styles.ring3, { transform: [{ rotate: spin3 }] }]} />

          {/* Glow blob */}
          <View style={styles.glowBlob} />

          {/* Logo */}
          <View style={styles.logoRow}>
            <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⚡</Text>
            </LinearGradient>
            <Text style={styles.logoText}>FitTrack PRO</Text>
          </View>

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingScore}>4.9★</Text>
            <Text style={styles.ratingSub}>500K+ Users</Text>
          </View>

          {/* Hero Content */}
          <Animated.View
            style={[
              styles.heroContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Animated.View style={[styles.heroBadge, { opacity: pulseAnim }]}>
              <Text style={styles.heroBadgeText}>#1 FITNESS APP 2025</Text>
            </Animated.View>

            <Text style={styles.heroTitle}>
              TRAIN{'\n'}
              <Text style={styles.heroTitleAccent}>SMARTER.</Text>
              {'\n'}GET RESULTS.
            </Text>

            <Text style={styles.heroSubtitle}>
              Your intelligent training companion. Science-backed workouts, real-time analytics,
              unstoppable progress.
            </Text>

            <GlowButton
              label="Start Free — No Credit Card"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.ctaBtn}
            />

            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>
                Already a member?{'  '}
                <Text style={styles.signInLinkAccent}>Sign In →</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        {/* ── Features ── */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>WHY FITTRACK PRO</Text>

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
              {AVATARS.map((a, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatar,
                    {
                      marginLeft: i > 0 ? -10 : 0,
                      backgroundColor: `hsl(${i * 60 + 140}, 50%, 30%)`,
                    },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </View>
              ))}
            </View>
            <View>
              <Text style={styles.socialTitle}>Join 500,000+ athletes</Text>
              <Text style={styles.socialSub}>transforming their bodies daily</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    minHeight: 520,
    paddingTop: 16,
    paddingHorizontal: 28,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  glowBlob: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0,255,135,0.07)',
    // Note: for true radial gradient blobs, use react-native-linear-gradient or Skia
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 280,
    height: 280,
    borderColor: 'rgba(0,255,135,0.07)',
    top: '5%',
    right: -84,
  },
  ring2: {
    width: 220,
    height: 220,
    borderColor: 'rgba(0,255,135,0.1)',
    top: '10%',
    right: -66,
  },
  ring3: {
    width: 160,
    height: 160,
    borderColor: 'rgba(0,255,135,0.14)',
    top: '16%',
    right: -48,
  },
  logoRow: {
    position: 'absolute',
    top: 48,
    left: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 20 },
  logoText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: 'absolute',
    top: 80,
    right: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  ratingScore: {
    color: COLORS.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  ratingSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  heroContent: {
    marginTop: 180,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,255,135,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.25)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 18,
  },
  heroBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: COLORS.accent,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 300,
  },
  ctaBtn: {
    marginBottom: 16,
  },
  signInLink: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  signInLinkAccent: {
    color: COLORS.accent,
    fontWeight: '700',
  },

  // Features
  featuresSection: {
    padding: 28,
    paddingTop: 32,
    backgroundColor: COLORS.bg,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 18,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  featureCard: {
    width: (width - 56 - 14) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    overflow: 'hidden',
  },
  featureTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.9,
  },
  featureIcon: { fontSize: 28, marginBottom: 10 },
  featureTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  featureDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  socialProof: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 16 },
  socialTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  socialSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
