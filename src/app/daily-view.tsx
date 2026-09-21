import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/planner/card';
import { NavHeader, NavIconButton } from '@/components/planner/nav-header';
import { ScreenContainer } from '@/components/planner/screen-container';
import { SegmentedControl } from '@/components/planner/segmented-control';
import { ROW_HEIGHT_PX, SLOT_MINUTES, TimelineEvent } from '@/components/planner/timeline-event';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { computeSchedule, ENERGY_CAPACITY_LABEL, formatTime } from '@/lib/planner-logic';
import { usePlanner } from '@/store/planner-store';

export default function DailyViewScreen() {
  const theme = usePlannerTheme();
  const { signOut, user } = useAuth();
  const {
    tasks,
    energyLevel,
    setEnergyLevel,
    communicationMode,
    workHours,
    scheduleStartTime,
    setScheduleStartTime,
    toggleTaskComplete,
    moveTask,
  } = usePlanner();

  const dayEndBoundary = workHours === 'nine-to-five' ? 17 * 60 : 21 * 60;

  const { schedule, totalUsed, totalCapacity } = useMemo(
    () => computeSchedule(tasks, energyLevel, scheduleStartTime),
    [tasks, energyLevel, scheduleStartTime]
  );

  const unscheduled = tasks.filter((t) => !schedule.some((s) => s.task.id === t.id));

  const minSlot = useMemo(() => {
    const earliest = Math.min(scheduleStartTime, ...(schedule.length ? schedule.map((s) => s.startTime) : [scheduleStartTime]));
    return Math.floor(earliest / SLOT_MINUTES) * SLOT_MINUTES;
  }, [schedule, scheduleStartTime]);

  const maxSlot = useMemo(() => {
    const latest = Math.max(dayEndBoundary, ...(schedule.length ? schedule.map((s) => s.endTime) : [dayEndBoundary]));
    return Math.ceil(latest / SLOT_MINUTES) * SLOT_MINUTES;
  }, [schedule, dayEndBoundary]);

  const slotCount = Math.max(1, (maxSlot - minSlot) / SLOT_MINUTES);

  function attemptMove(taskId: number, deltaMinutes: number) {
    const event = schedule.find((s) => s.task.id === taskId);
    if (!event) return;

    const newStart = Math.max(0, event.startTime + deltaMinutes);
    const newEnd = newStart + event.duration;

    const otherTasks = tasks.filter((t) => t.id !== taskId);
    const { schedule: otherSchedule, totalUsed: otherUsed, totalCapacity: capacity } = computeSchedule(
      otherTasks,
      energyLevel,
      scheduleStartTime
    );

    const overlaps = otherSchedule.some((s) => newStart < s.endTime && newEnd > s.startTime);
    if (overlaps) {
      Alert.alert('Time taken', 'That time already has another task scheduled!');
      return;
    }

    if (otherUsed + event.duration > capacity) {
      Alert.alert('Over capacity', 'Moving this task would exceed your energy capacity!');
      return;
    }

    moveTask(taskId, newStart);
  }

  function adjustStartTime(deltaMinutes: number) {
    setScheduleStartTime(Math.max(0, Math.min(23 * 60 + 30, scheduleStartTime + deltaMinutes)));
  }

  function handleSignOut() {
    const email = user?.primaryEmailAddress?.emailAddress;
    Alert.alert('Sign out', email ? `Signed in as ${email}. Sign out?` : 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScreenContainer
      headerRow={
        <NavHeader
          right={
            <>
              <NavIconButton name="add-circle-outline" onPress={() => router.push('/add-tasks')} />
              <NavIconButton name="list-outline" onPress={() => router.push('/prioritize')} />
              <NavIconButton name="sparkles-outline" onPress={() => router.push('/dopamine')} />
              <NavIconButton name="options-outline" onPress={() => router.push('/questions')} />
              <NavIconButton name="log-out-outline" onPress={handleSignOut} />
            </>
          }
        />
      }
      title="Today's schedule"
      subtitle="Drag tasks around as your energy changes">
      <Card>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Energy level today
        </ThemedText>
        <SegmentedControl
          value={energyLevel}
          onChange={setEnergyLevel}
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ]}
        />

        <View style={styles.startTimeRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Schedule starts at
          </ThemedText>
          <View style={styles.stepper}>
            <Pressable onPress={() => adjustStartTime(-30)} style={[styles.stepperBtn, { borderColor: theme.border }]}>
              <ThemedText style={{ color: theme.text }}>−</ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={{ color: theme.text, minWidth: 76, textAlign: 'center' }}>
              {formatTime(scheduleStartTime)}
            </ThemedText>
            <Pressable onPress={() => adjustStartTime(30)} style={[styles.stepperBtn, { borderColor: theme.border }]}>
              <ThemedText style={{ color: theme.text }}>+</ThemedText>
            </Pressable>
          </View>
        </View>
      </Card>

      {tasks.length === 0 ? (
        <Card>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No tasks yet.{' '}
            <ThemedText type="link" style={{ color: theme.primary }} onPress={() => router.push('/add-tasks')}>
              Add some tasks
            </ThemedText>{' '}
            to generate your schedule.
          </ThemedText>
        </Card>
      ) : (
        <Card>
          <View style={[styles.timeline, { height: slotCount * ROW_HEIGHT_PX }]}>
            {Array.from({ length: slotCount }).map((_, i) => {
              const slotStart = minSlot + i * SLOT_MINUTES;
              const isHourMark = slotStart % 60 === 0;
              return (
                <View key={slotStart} style={[styles.timelineRow, { top: i * ROW_HEIGHT_PX, borderColor: theme.border }]}>
                  <ThemedText type="small" style={[styles.hourLabel, { color: theme.textSecondary }]}>
                    {isHourMark ? formatTime(slotStart) : ''}
                  </ThemedText>
                </View>
              );
            })}
            {schedule.map((event) => (
              <TimelineEvent
                key={event.task.id}
                event={event}
                minSlot={minSlot}
                communicationMode={communicationMode}
                onToggleComplete={() => toggleTaskComplete(event.task.id)}
                onAttemptMove={(delta) => attemptMove(event.task.id, delta)}
              />
            ))}
          </View>

          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Energy used: {totalUsed} / {totalCapacity} min · {ENERGY_CAPACITY_LABEL[energyLevel]}
          </ThemedText>

          {unscheduled.length > 0 ? (
            <ThemedText type="small" style={{ color: theme.danger }}>
              {unscheduled.length} task{unscheduled.length > 1 ? 's' : ''} didn&apos;t fit your energy capacity today.
            </ThemedText>
          ) : null}
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  startTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  timeline: { position: 'relative' },
  timelineRow: { position: 'absolute', left: 0, right: 0, height: 44, borderTopWidth: StyleSheet.hairlineWidth, justifyContent: 'flex-start' },
  hourLabel: { width: 52, fontSize: 11 },
});
