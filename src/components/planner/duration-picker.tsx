import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { durationOptions } from '@/lib/planner-logic';
import { usePlannerTheme } from '@/hooks/use-planner-theme';

export function DurationPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const theme = usePlannerTheme();
  const options = durationOptions(value);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((minutes) => {
        const isActive = minutes === value;
        return (
          <Pressable
            key={minutes}
            onPress={() => onChange(minutes)}
            style={[
              styles.chip,
              { borderColor: theme.border, backgroundColor: isActive ? theme.primary : 'transparent' },
            ]}>
            <Text style={[styles.label, { color: isActive ? theme.onPrimary : theme.text }]}>{minutes}m</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
