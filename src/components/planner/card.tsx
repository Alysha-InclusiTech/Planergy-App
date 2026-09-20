import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { usePlannerTheme } from '@/hooks/use-planner-theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const theme = usePlannerTheme();
  return <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
});
