import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { usePlannerTheme } from '@/hooks/use-planner-theme';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const theme = usePlannerTheme();

  const bg = variant === 'primary' ? theme.primary : variant === 'danger' ? theme.dangerBg : 'transparent';
  const borderColor = variant === 'secondary' ? theme.border : 'transparent';
  const textColor = variant === 'primary' ? theme.onPrimary : variant === 'danger' ? theme.danger : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'secondary' ? 1 : 0, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
