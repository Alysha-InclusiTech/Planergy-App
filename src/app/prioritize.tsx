import { router } from 'expo-router';
import { View } from 'react-native';

import { NavHeader } from '@/components/planner/nav-header';
import { PrimaryButton } from '@/components/planner/primary-button';
import { ScreenContainer } from '@/components/planner/screen-container';
import { TaskCard } from '@/components/planner/task-card';
import { ThemedText } from '@/components/themed-text';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { usePlanner } from '@/store/planner-store';

export default function PrioritizeScreen() {
  const theme = usePlannerTheme();
  const { tasks, communicationMode, togglePriority, setTaskDuration, setTaskEnergy, deleteTask } = usePlanner();

  return (
    <ScreenContainer
      headerRow={router.canGoBack() ? <NavHeader onBack={() => router.back()} /> : undefined}
      title="Review & prioritize"
      subtitle="Mark what's important, and check the time and energy each task needs"
      footer={<PrimaryButton label="Build my schedule" onPress={() => router.push('/daily-view')} />}>
      {tasks.length === 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          No tasks yet.{' '}
          <ThemedText type="link" style={{ color: theme.primary }} onPress={() => router.push('/add-tasks')}>
            Add some tasks
          </ThemedText>{' '}
          first.
        </ThemedText>
      ) : (
        <View style={{ gap: 12 }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              communicationMode={communicationMode}
              onTogglePriority={() => togglePriority(task.id)}
              onSetDuration={(minutes) => setTaskDuration(task.id, minutes)}
              onSetEnergy={(level) => setTaskEnergy(task.id, level)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
