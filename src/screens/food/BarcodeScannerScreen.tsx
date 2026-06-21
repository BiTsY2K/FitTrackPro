import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/theme';
import { MainStackParamList } from '@/navigation/MainNavigation';
import { foodAPIService } from '@/services/food/FoodAPIService';
import { colors, rounded, spacing, typography } from '@/themes';
import { MealType } from '@/types/food.types';
import { logger } from '@/utils/logger';

const SCAN_THROTTLE_MS = 2000; // prevent duplicate rapid scans

// ── FoodSearchScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MainStackParamList, 'BarcodeScanner'>;

export const BarcodeScannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mealType } = route.params as { mealType: MealType };
  const [permission, requestPermission] = useCameraPermissions();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [statusText, setStatusText] = useState('Point camera at a barcode');
  const [torchOn, setTorchOn] = useState(false);

  const lastScanTime = useRef(0);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  // Pulse animation for scan line //
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  // Request permission on mount if not yet determined //
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert('Camera Permission Required', 'Please enable camera access in your device settings to scan barcodes.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [permission]);

  /** Handle a scanned barcode — throttled to avoid duplicate rapid lookups */
  const handleBarcodeScanned = async ({ data: barcode }: { data: string }) => {
    const now = Date.now();
    if (isLookingUp || now - lastScanTime.current < SCAN_THROTTLE_MS) return;

    lastScanTime.current = now;
    setIsLookingUp(true);
    setStatusText(`Looking up: ${barcode}`);
    logger.info('Barcode scanned', { barcode });

    try {
      const food = await foodAPIService.searchByBarcode(barcode);

      if (food) {
        logger.info('Barcode product found', { barcode, name: food.name });
        // Navigate to FoodDetail so the user can adjust servings before logging //
        navigation.navigate('FoodDetail', { food, mealType });
      } else {
        setStatusText('Product not found. Try again or add manually.');
        Alert.alert('Product Not Found', 'This barcode is not in our database yet.', [
          {
            text: 'Try Again',
            onPress: () => {
              setIsLookingUp(false);
              setStatusText('Point camera at a barcode');
            },
          },
          { text: 'Add Manually', onPress: () => navigation.replace('ManualFoodEntry', { mealType }) },
        ]);
      }
    } catch (error) {
      logger.error('Barcode lookup failed', error as Error, { barcode });
      setStatusText('Lookup failed. Check your connection.');
      setIsLookingUp(false);
    }
  };

  // ── Permission states ── //
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>Calorix needs camera access to scan food barcodes.</Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-screen camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={isLookingUp ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39'] }}
      />

      {/* Dark overlay — top */}
      <View style={styles.overlayTop} />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Scan Barcode</Text>
        <Pressable onPress={() => setTorchOn(t => !t)} style={styles.headerBtn} hitSlop={8}>
          <MaterialCommunityIcons name={torchOn ? 'flash' : 'flash-off'} size={22} color={torchOn ? COLORS.accent : '#FFFFFF'} />
        </Pressable>
      </SafeAreaView>

      {/* Scan frame — centred */}
      <View style={styles.frameRow}>
        {/* Left overlay */}
        <View style={styles.overlayLateral} />

        <View style={styles.frame}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Scan line */}
          {!isLookingUp && <Animated.View style={[styles.scanLine, { opacity: pulseAnim }]} />}

          {/* Looking up overlay */}
          {isLookingUp && (
            <View style={styles.lookingUpOverlay}>
              <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
          )}
        </View>

        {/* Right overlay */}
        <View style={styles.overlayLateral} />
      </View>

      {/* Dark overlay — bottom */}
      <View style={styles.overlayBottom}>
        <Text style={styles.statusText}>{statusText}</Text>

        <Pressable style={styles.manualBtn} onPress={() => navigation.navigate('ManualFoodEntry', { mealType })}>
          <MaterialCommunityIcons name="square-edit-outline" size={18} color={COLORS.accent} />
          <Text style={styles.manualBtnText}>Enter Manually</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const FRAME_SIZE = 260;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Header ── //
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    zIndex: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: rounded.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },

  // ── Scan frame layout ── //
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '25%', backgroundColor: 'rgba(0,0,0,0.65)' },
  frameRow: { position: 'absolute', top: '25%', left: 0, right: 0, flexDirection: 'row', height: FRAME_SIZE },
  overlayLateral: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE, position: 'relative' },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '25%',
    marginTop: FRAME_SIZE,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    paddingTop: spacing[4],
    gap: spacing.md,
  },

  // ── Corner brackets ── //
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: COLORS.accent },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 12 },

  // ── Scan line ── //
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── Looking up ── //
  lookingUpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Bottom UI ── //
  statusText: {
    color: colors.content.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accent.green,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: COLORS.accentGlow,
  },
  manualBtnText: {
    color: COLORS.accent,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },

  // ── Permission screen ── //
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  permissionIcon: { fontSize: 56 },
  permissionTitle: {
    color: colors.content.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.black,
    textAlign: 'center',
  },
  permissionText: { color: colors.content.secondary, fontSize: typography.size.sm, textAlign: 'center', lineHeight: 20 },
  permissionBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: rounded.lg,
    marginTop: spacing.sm,
  },
  permissionBtnText: { color: '#000', fontSize: typography.size.md, fontWeight: typography.weight.black },
  secondaryBtn: { paddingVertical: spacing.sm },
  secondaryBtnText: { color: colors.content.secondary, fontSize: typography.size.sm },
});
