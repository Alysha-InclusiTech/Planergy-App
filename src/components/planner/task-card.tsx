import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/planner/card';
import { DurationPicker } from '@/components/planner/duration-picker';
import { SegmentedControl } from '@/components/planner/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { isVerbalTask } from '@/lib/planner-logic';
import { CommunicationMode, EnergyRequired, Task } from '@/types/planner';

export function TaskCard({
  task,
  communicationMode,
  onTogglePriority,
  onSetDuration,
  onSetEnergy,
  onDelete,
}: {
  task: Task;
  communicationMode: CommunicationMode;
  onTogglePriority: () => void;
  onSetDuration: (minutes: number) => void;
  onSetEnergy: (level: EnergyRequired) => void;
  onDelete: () => void;
}) {
  const theme = usePlannerTheme();
  const flaggedVerbal = communicationMode === 'nonverbal' && isVerbalTask(task.text);

  return (
    <Card style={{ borderColor: flaggedVerbal ? theme.danger : theme.border }}>
      <View style={styles.topRow}>
        <ThemedText style={[styles.taskText, { color: theme.text }]}>{task.text}</ThemedText>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      {flaggedVerbal ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          🔇 Requires talking — consider rescheduling to a day you can talk
        </ThemedText>
      ) : null}

      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Duration
      </ThemedText>
      <DurationPicker value={task.duration} onChange={onSetDuration} />

      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Energy required
      </ThemedText>
      <SegmentedControl
        value={String(task.energyRequired)}
        onChange={(level) => onSetEnergy(Number(level) as EnergyRequired)}
        options={[
          { label: 'Low', value: '1' },
          { label: 'Med', value: '2' },
          { label: 'High', value: '3' },
        ]}
      />

      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Priority
      </ThemedText>
      <SegmentedControl
        value={task.priority}
        onChange={onTogglePriority}
        activeColor={task.priority === 'important' ? '#F59E0B' : theme.primary}
        options={[
          { label: 'Flexible', value: 'flexible' },
          { label: 'Important', value: 'important' },
        ]}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  taskText: { fontSize: 16, fontWeight: '600', flex: 1 },
});
