import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { getEnergyLabel, isVerbalTask } from '@/lib/planner-logic';
import { CommunicationMode, ScheduleEvent } from '@/types/planner';

const ROW_HEIGHT_PX = 44;
const SLOT_MINUTES = 30;

export function TimelineEvent({
  event,
  minSlot,
  communicationMode,
  onToggleComplete,
  onAttemptMove,
}: {
  event: ScheduleEvent;
  minSlot: number;
  communicationMode: CommunicationMode;
  onToggleComplete: () => void;
  onAttemptMove: (deltaMinutes: number) => void;
}) {
  const theme = usePlannerTheme();
  const flaggedVerbal = communicationMode === 'nonverbal' && isVerbalTask(event.task.text);
  const energyLabel = getEnergyLabel(event.task.energyRequired || 2);

  const top = ((event.startTime - minSlot) / SLOT_MINUTES) * ROW_HEIGHT_PX;
  const height = Math.max(ROW_HEIGHT_PX - 4, (event.duration / SLOT_MINUTES) * ROW_HEIGHT_PX - 4);

  const translateY = useSharedValue(0);
  const dragging = useSharedValue(false);

  const attemptMove = (deltaMinutes: number) => onAttemptMove(deltaMinutes);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragging.value = true;
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const deltaSlots = Math.round(translateY.value / ROW_HEIGHT_PX);
      translateY.value = withSpring(0);
      dragging.value = false;
      if (deltaSlots !== 0) {
        runOnJS(attemptMove)(deltaSlots * SLOT_MINUTES);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: dragging.value ? 10 : 1,
    opacity: dragging.value ? 0.85 : 1,
  }));

  const backgroundColor = flaggedVerbal
    ? theme.dangerBg
    : event.task.dopamine
      ? theme.successBg
      : event.task.priority === 'important'
        ? theme.warningBg
        : theme.surface;

  const timeLine = flaggedVerbal
    ? `${event.startTimeStr} - ${event.endTimeStr} · 🔇 talking`
    : `${event.startTimeStr} - ${event.endTimeStr} · ⚡ ${energyLabel}`;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.event, animatedStyle, { top, height, backgroundColor, borderColor: theme.border }]}>
        <Pressable onPress={onToggleComplete} hitSlop={8} style={styles.checkbox}>
          <Ionicons
            name={event.task.completed ? 'checkbox' : 'square-outline'}
            size={20}
            color={event.task.completed ? theme.primary : theme.textSecondary}
          />
        </Pressable>
        <View style={styles.textCol}>
          <ThemedText
            numberOfLines={1}
            style={[styles.title, { color: theme.text, textDecorationLine: event.task.completed ? 'line-through' : 'none' }]}>
            {event.task.text}
          </ThemedText>
          <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
            {timeLine}
          </ThemedText>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export { ROW_HEIGHT_PX, SLOT_MINUTES };

const styles = StyleSheet.create({
  event: {
    position: 'absolute',
    left: 56,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: { paddingVertical: 4 },
  textCol: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600' },
});
