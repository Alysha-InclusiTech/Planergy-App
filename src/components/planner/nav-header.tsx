import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePlannerTheme } from '@/hooks/use-planner-theme';

export function NavHeader({ onBack, right }: { onBack?: () => void; right?: ReactNode }) {
  const theme = usePlannerTheme();

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
      ) : (
        <View style={{ width: 24 }} />
      )}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function NavIconButton({ name, onPress, active }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; active?: boolean }) {
  const theme = usePlannerTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.iconButton, { backgroundColor: active ? theme.primary : theme.bg, borderColor: theme.border }]}>
      <Ionicons name={name} size={18} color={active ? theme.onPrimary : theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  right: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
