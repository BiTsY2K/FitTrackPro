import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native';

import { COLORS } from '@/constants/theme';

import { SectionLabel } from '../common/SectionLabel';

const ITEM_HEIGHT = 44;
const ITEM_WIDTH = 1.5 * ITEM_HEIGHT;
const VISIBLE_ITEMS = 5; // must be odd
const DRUM_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const DRUM_WIDTH = VISIBLE_ITEMS * ITEM_WIDTH;
const SPRING_CFG = { useNativeDriver: false, duration: 80, easing: Easing.out(Easing.cubic) } as const;

const IS_IOS = Platform.OS === 'ios';

interface NumberPickerProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  accentColor?: string;
  icon?: string;
}

export const NumberPicker: React.FC<NumberPickerProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  accentColor = COLORS.accent,
  icon,
}) => {
  const items = useMemo<number[]>(() => {
    const arr: number[] = [];
    const decimals = step < 1 ? 1 : 0;
    for (let v = min; v <= max + 0.001; v = parseFloat((v + step).toFixed(4))) {
      arr.push(parseFloat(v.toFixed(decimals)));
    }
    return arr;
  }, [min, max, step]);

  const decimals = step < 1 ? 1 : 0;
  const formatVal = useCallback((v: number) => v.toFixed(decimals), [decimals]);

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, parseFloat((Math.round(v / step) * step).toFixed(decimals)))),
    [min, max, step, decimals],
  );

  /* prettier-ignore */
  const indexOfValue = useCallback(
    (v: number) => Math.max(0, items.findIndex(i => Math.abs(i - v) < step * 0.5)),
    [items, step],
  );

  const initialIdx = useMemo<number>(() => indexOfValue(value), []);
  const [selectedIdx, setSelectedIdx] = useState<number>(initialIdx);
  const selectedIdxRef = useRef<number>(initialIdx);
  const currentOffsetX = useRef<number>(initialIdx * ITEM_WIDTH);
  const flatListRef = useRef<FlatList<number>>(null);

  const snapToIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const targetOff = clamped * ITEM_WIDTH;
      const springAnim = new Animated.Value(currentOffsetX.current);

      currentOffsetX.current = targetOff;
      springAnim.addListener(({ value: v }) => {
        const safeOffset = Math.max(0, Math.min((items.length - 1) * ITEM_WIDTH, v)); // Clamp listener value to valid scroll range before passing to FlatList
        flatListRef.current?.scrollToOffset({ offset: safeOffset, animated: true });
      });

      Animated.timing(springAnim, { toValue: targetOff, ...SPRING_CFG }).start(({ finished }) => {
        springAnim.removeAllListeners();
        if (finished) flatListRef.current?.scrollToOffset({ offset: targetOff, animated: false });
      });

      if (selectedIdxRef.current !== clamped) {
        selectedIdxRef.current = clamped;
        setSelectedIdx(clamped);
      }
      onChange(items[clamped]);
    },
    [items, onChange],
  );

  // Stable ref so renderItem always calls the latest snapToIndex
  const snapRef = useRef(snapToIndex);
  useEffect(() => { snapRef.current = snapToIndex; }, [snapToIndex]); // prettier-ignore

  /* Initial scroll — onLayout fires after FlatList measures its frame */
  const hasScrolledInitially = useRef(false);
  const onFlatListLayout = useCallback(() => {
    if (hasScrolledInitially.current) return;
    hasScrolledInitially.current = true;
    flatListRef.current?.scrollToOffset({ offset: initialIdx * ITEM_WIDTH, animated: true });
  }, [initialIdx]);

  /* Sync when parent changes value externally */
  useEffect(() => {
    const idx = indexOfValue(value);
    if (idx === selectedIdxRef.current) return;
    snapRef.current(idx);
  }, [value, indexOfValue]);

  const dragStart = useRef(0);
  const dragStartOffset = useRef(0);
  const isScrolling = useRef(false);
  const rafHandle = useRef<number | null>(null); // for rAF cancellation

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 3 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.2,
      onMoveShouldSetPanResponderCapture: (_, gs) => Math.abs(gs.dx) > 3 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.2,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: (_, gs) => {
        isScrolling.current = true;
        dragStart.current = gs.x0;
        dragStartOffset.current = currentOffsetX.current;

        // Cancel any in-progress snap animation
        if (rafHandle.current !== null) {
          cancelAnimationFrame(rafHandle.current);
          rafHandle.current = null;
        }
      },

      onPanResponderMove: (_, gs) => {
        const maxScroll = (items.length - 1) * ITEM_WIDTH;
        const next = dragStartOffset.current - gs.dx;

        const rubber = (v: number, limit: number, dir: 1 | -1) => {
          const over = dir * (v - limit);
          return limit + dir * Math.sqrt(Math.max(0, over)) * 5;
        };

        let clamped = next;
        if (next < 0) clamped = rubber(next, 0, -1);
        if (next > maxScroll) clamped = rubber(next, maxScroll, 1);
        // clamped = Math.max(-ITEM_WIDTH * 2, Math.min(maxScroll + ITEM_WIDTH * 2, clamped));

        currentOffsetX.current = clamped;

        // iOS fix: defer scrollToOffset to next animation frame
        if (rafHandle.current !== null) cancelAnimationFrame(rafHandle.current);
        rafHandle.current = requestAnimationFrame(() => {
          flatListRef.current?.scrollToOffset({
            offset: Math.max(0, clamped), // FlatList cannot scroll to negative offset
            animated: true,
          });
          rafHandle.current = null;
        });
      },

      onPanResponderRelease: (_, gs) => {
        isScrolling.current = false;
        if (rafHandle.current !== null) {
          cancelAnimationFrame(rafHandle.current);
          rafHandle.current = null;
        }
        const moved = dragStartOffset.current - gs.dx;
        const rawIdx = Math.round(moved / ITEM_WIDTH);
        snapRef.current(rawIdx);
      },

      onPanResponderTerminate: (_, gs) => {
        isScrolling.current = false;
        if (rafHandle.current !== null) {
          cancelAnimationFrame(rafHandle.current);
          rafHandle.current = null;
        }
        const moved = dragStartOffset.current - gs.dx;
        const rawIdx = Math.round(moved / ITEM_WIDTH);
        snapRef.current(rawIdx);
      },
    }),
  ).current;

  const handleTap = useCallback((idx: number) => snapRef.current(idx), []);
  const renderItem = useCallback(
    ({ item: v, index: idx }: { item: number; index: number }) => (
      <DrumItem key={v} value={v} idx={idx} selectedIdx={selectedIdx} accentColor={accentColor} formatVal={formatVal} onTap={handleTap} />
    ),
    [selectedIdx, accentColor, formatVal],
  );

  const keyExtractor = useCallback((item: number) => item.toString(), []);
  const getItemLayout = useCallback((_: any, index: number) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }), []);

  return (
    <View>
      <View style={styles.headerRow}>
        {/* prettier-ignore */}
        <SectionLabel icon={icon} styleContainerView={styles.labelFlex}>{label}</SectionLabel>

        <View style={[styles.valueBadge, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40` }]}>
          <Text style={[styles.valueNum, { color: accentColor }]}>{formatVal(value)}</Text>
          <Text style={[styles.valueUnit, { color: accentColor }]}>{unit}</Text>
        </View>
      </View>

      {/* Drum */}
      <View style={[styles.drum, { height: ITEM_HEIGHT * 1.5 }]} {...panResponder.panHandlers}>
        <LinearGradient
          colors={[`${COLORS.bgCard2}28`, `${accentColor}00`]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fadeOverlay, styles.fadeLeft]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[`${accentColor}00`, `${COLORS.bgCard2}28`]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fadeOverlay, styles.fadeRight]}
          pointerEvents="none"
        />

        <View style={[styles.selectionBand, { borderColor: `red` }]} pointerEvents="none" />
        {/* <View style={[styles.strip, { backgroundColor: accentColor, top: 0 }]} pointerEvents="none" />
        <View style={[styles.strip, { backgroundColor: accentColor, bottom: 0 }]} pointerEvents="none" /> */}

        <Animated.FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          onLayout={onFlatListLayout}
          windowSize={21}
          initialNumToRender={VISIBLE_ITEMS + 4}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews={!IS_IOS}
          contentContainerStyle={{
            paddingHorizontal: (DRUM_WIDTH - ITEM_WIDTH) / 2,
            alignItems: 'center',
          }}
          // ItemSeparatorComponent={() => <Text style={{ color: 'red', textAlignVertical: 'center' }}>|</Text>}
        />

        {/* <Animated.View style={{ transform: [{ translateY }] }}>
          {items.map((v, idx) => (
              renderItem({ item: v, index: idx })

              // prettier-ignore 
              // <DrumItem key={v} value={v} idx={idx} selectedIdx={selectedIdx} accentColor={accentColor} 
              // formatVal={formatVal} onTap={handleTap} />
          ))}
        </Animated.View> */}
      </View>

      {/* ─── Increament(+)/Decreament(-) Buttons ─── */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          onPress={() => snapToIndex(indexOfValue(value - step))}
          style={styles.btn}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <View style={styles.btnDivider} />
        <TouchableOpacity
          onPress={() => snapToIndex(indexOfValue(value + step))}
          style={styles.btn}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ─── DrumItem ───────────────────────────────────────────────────── */
interface DrumItemProps {
  value: number;
  idx: number;
  selectedIdx: number;
  accentColor: string;
  formatVal: (v: number) => string;
  onTap: (idx: number) => void;
}

const DrumItem = React.memo<DrumItemProps>(
  ({ value, idx, selectedIdx, accentColor, formatVal, onTap }) => {
    const dist = Math.abs(idx - selectedIdx);
    const isSelected = dist === 0;
    const isAdjacent = dist === 1;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onTap(idx)}
        style={[styles.item, { height: ITEM_HEIGHT, width: 1.5 * ITEM_HEIGHT }]}
        hitSlop={{ top: 6, bottom: 6, left: 20, right: 20 }}
        delayLongPress={10}
      >
        <Text
          style={[
            styles.itemText,
            isSelected && [styles.itemTextSelected, { color: 'white' }],
            isAdjacent && styles.itemTextAdjacent,
            !isSelected && !isAdjacent && styles.itemTextFar,
          ]}
          // selectable={false}
        >
          {formatVal(value)}
        </Text>
      </TouchableOpacity>
    );
  },

  (prev, next) =>
    prev.idx === next.idx && prev.selectedIdx === next.selectedIdx && prev.accentColor === next.accentColor && prev.value === next.value,
);

DrumItem.displayName = 'DrumItem';

const styles = StyleSheet.create({
  labelFlex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  valueNum: { fontSize: 20, fontWeight: '900' },
  valueUnit: { fontSize: 11, fontWeight: '700' },
  drum: {
    height: DRUM_HEIGHT,
    alignSelf: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },

  fadeOverlay: { position: 'absolute', top: 0, bottom: 0, width: ITEM_WIDTH * 1.5, zIndex: 2 },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0 },
  selectionBand: {
    position: 'absolute',
    top: '20%',
    bottom: '20%',
    zIndex: 1,
    left: (DRUM_WIDTH - ITEM_WIDTH) / 2,
    width: ITEM_WIDTH,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  strip: {
    position: 'absolute',
    zIndex: 1,
    left: (DRUM_WIDTH - ITEM_WIDTH) / 2,
    width: ITEM_WIDTH,
    height: 3,
  },
  item: { width: ITEM_WIDTH, height: DRUM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '400', opacity: 0.3 },
  itemTextSelected: { fontSize: 22, fontWeight: '900', opacity: 1, letterSpacing: -0.5 },
  itemTextAdjacent: { fontSize: 15, fontWeight: '600', opacity: 0.7, color: COLORS.text },
  itemTextFar: { opacity: 0.3 },
  btnRow: {
    flexDirection: 'row',
    marginTop: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  btnText: { color: COLORS.text, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  btnDivider: { width: 1, backgroundColor: COLORS.border },
});
