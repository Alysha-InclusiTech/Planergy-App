import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '@/hooks/use-planner-theme';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  activeColor,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  activeColor?: string;
}) {
  const theme = usePlannerTheme();

  return (
    <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.bg }]}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              isActive && { backgroundColor: activeColor ?? theme.primary },
            ]}>
            <Text style={[styles.label, { color: isActive ? theme.onPrimary : theme.text }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
