import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, TextStyle } from 'react-native';

export type BadgeVariant =
  | 'allowed'
  | 'caution'
  | 'prohibited'
  | 'unknown'
  | 'xp'
  | 'live'
  | 'info'
  | 'neutral';

type AppBadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      {icon ? <Text style={styles.iconText}>{icon} </Text> : null}
      <Text style={[styles.label, styles[`label_${variant}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  iconText: {
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Variant backgrounds
  allowed: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  caution: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  prohibited: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unknown: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  xp: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  live: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  info: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  neutral: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  // Label colors
  label_allowed: {
    color: '#15803D',
  },
  label_caution: {
    color: '#B45309',
  },
  label_prohibited: {
    color: '#B91C1C',
  },
  label_unknown: {
    color: '#475569',
  },
  label_xp: {
    color: '#0284C7',
  },
  label_live: {
    color: '#059669',
  },
  label_info: {
    color: '#2563EB',
  },
  label_neutral: {
    color: '#334155',
  },
});
