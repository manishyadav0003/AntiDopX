import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type ProgressBarProps = {
  progressPercent: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelText?: string;
  style?: StyleProp<ViewStyle>;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercent,
  height = 8,
  color = '#06B6D4',
  backgroundColor = '#E2E8F0',
  showLabel = false,
  labelText,
  style,
}) => {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clamped, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {showLabel ? (
        <View style={styles.labelRow}>
          {labelText ? <Text style={styles.labelText}>{labelText}</Text> : null}
          <Text style={styles.percentText}>{Math.round(clamped)}%</Text>
        </View>
      ) : null}
      <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            animatedStyle,
            { height, backgroundColor: color, borderRadius: height / 2 },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  percentText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
