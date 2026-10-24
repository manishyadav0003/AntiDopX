import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type FeedbackType = 'success' | 'warning' | 'error' | 'empty' | 'info';

type FeedbackCardProps = {
  type?: FeedbackType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

const ICONS: Record<FeedbackType, keyof typeof MaterialIcons.glyphMap> = {
  success: 'check-circle',
  warning: 'warning',
  error: 'error',
  empty: 'inbox',
  info: 'info',
};

const COLORS: Record<FeedbackType, { bg: string; border: string; icon: string; title: string }> = {
  success: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    icon: '#16A34A',
    title: '#14532D',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: '#D97706',
    title: '#78350F',
  },
  error: {
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: '#DC2626',
    title: '#7F1D1D',
  },
  empty: {
    bg: '#F8FAFC',
    border: '#E2E8F0',
    icon: '#64748B',
    title: '#1E293B',
  },
  info: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: '#2563EB',
    title: '#1E3A8A',
  },
};

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  type = 'info',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const theme = COLORS[type];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bg, borderColor: theme.border },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <MaterialIcons
          name={ICONS[type]}
          size={28}
          color={theme.icon}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.title }]}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          {actionLabel && onAction ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.icon }]}
              onPress={onAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionText}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    marginVertical: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 14,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
