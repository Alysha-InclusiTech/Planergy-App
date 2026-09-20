import { ComputedSchedule, DopamineItem, EnergyLevel, EnergyRequired, ScheduleEvent, Task } from '@/types/planner';

// Energy capacity in minutes for the day - hard-coded limits, ported 1:1 from
// the original web prototype.
export const ENERGY_CAPACITY: Record<EnergyRequired, number> = {
  1: 80, // Low energy: max 80 minutes
  2: 120, // Medium energy: max 120 minutes
  3: 300, // High energy: max 300 minutes
};

export const ENERGY_CAPACITY_LABEL: Record<EnergyLevel, string> = {
  low: 'Low energy max: 80min',
  medium: 'Medium energy max: 120min',
  high: 'High energy max: 300min',
};

export const DEFAULT_DOPAMINE_ITEMS: DopamineItem[] = [
  { id: 'dop1', text: 'Watch favorite comfort show', duration: 20 },
  { id: 'dop2', text: 'Listen to favorite playlist', duration: 15 },
  { id: 'dop3', text: 'Take a short walk outside', duration: 15 },
  { id: 'dop4', text: 'Pet/cuddle with pet', duration: 10 },
  { id: 'dop5', text: 'Read a chapter of fun book', duration: 20 },
  { id: 'dop6', text: 'Scroll favorite social media', duration: 10 },
  { id: 'dop7', text: 'Play a quick game', duration: 15 },
  { id: 'dop8', text: 'Do a puzzle or coloring', duration: 20 },
  { id: 'dop9', text: 'Make a favorite snack', duration: 10 },
  { id: 'dop10', text: 'Take a relaxing shower/bath', duration: 20 },
];

export const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90];

export function energyLevelToRequired(level: EnergyLevel): EnergyRequired {
  return level === 'low' ? 1 : level === 'medium' ? 2 : 3;
}

export function getEnergyLabel(energyRequired: EnergyRequired): string {
  if (energyRequired === 1) return 'Low';
  if (energyRequired === 2) return 'Medium';
  return 'High';
}

// Match a keyword as a whole word (not as a substring of a longer word), so
// e.g. "call" doesn't match inside "recall" or "file" inside "profile".
// Multi-word phrases already have natural boundaries via their spaces.
function matchesKeyword(lowerText: string, keyword: string): boolean {
  if (keyword.includes(' ')) return lowerText.includes(keyword);
  return new RegExp(`\\b${keyword}\\b`).test(lowerText);
}

// AI: Estimate task duration based on keywords.
export function estimateMinutes(text: string): number {
  const lowerText = text.toLowerCase();

  const veryQuickPhrases = ['drink water', 'drinking water', 'water break', 'quick break'];
  if (veryQuickPhrases.some((phrase) => matchesKeyword(lowerText, phrase))) return 5;

  const quickKeywords = ['email', 'reply', 'text', 'message', 'pay', 'confirm', 'snack', 'check', 'quick', 'call', 'phone'];
  if (quickKeywords.some((kw) => matchesKeyword(lowerText, kw))) return 10;

  const lightKeywords = ['tidy', 'clean', 'shower', 'prep', 'prepare', 'walk', 'stretch', 'organize', 'sort', 'file'];
  if (lightKeywords.some((kw) => matchesKeyword(lowerText, kw))) return 20;

  const mediumKeywords = ['meeting', 'lunch', 'dinner', 'cook', 'plan', 'write', 'report', 'record', 'review', 'read', 'study', 'pack', 'packing'];
  if (mediumKeywords.some((kw) => matchesKeyword(lowerText, kw))) {
    if (matchesKeyword(lowerText, 'pack') || matchesKeyword(lowerText, 'packing')) return 40;
    return 45;
  }

  const deepKeywords = ['build', 'code', 'develop', 'design', 'create', 'research', 'deep work', 'project', 'presentation', 'analyze'];
  if (deepKeywords.some((kw) => matchesKeyword(lowerText, kw))) return 90;

  // No keyword match - fall back based on estimated energy so tasks don't
  // all collapse to the same default duration.
  const energy = estimateEnergy(text);
  if (energy === 1) return 15;
  if (energy === 3) return 60;
  return 30;
}

// AI: Estimate energy required (1=Low, 2=Medium, 3=High).
export function estimateEnergy(text: string): EnergyRequired {
  const lowerText = text.toLowerCase();

  const lowKeywords = ['email', 'reply', 'text', 'message', 'pay', 'confirm', 'drink', 'water', 'snack', 'check', 'scroll', 'watch', 'listen'];
  if (lowKeywords.some((kw) => matchesKeyword(lowerText, kw))) return 1;

  const highKeywords = ['build', 'code', 'develop', 'design', 'create', 'research', 'deep work', 'project', 'presentation', 'analyze', 'write', 'meeting', 'call', 'interview'];
  if (highKeywords.some((kw) => matchesKeyword(lowerText, kw))) return 3;

  return 2;
}

// Detect tasks that require talking out loud (phone calls, etc.)
export function isVerbalTask(text: string): boolean {
  const lowerText = text.toLowerCase();
  const verbalKeywords = ['call', 'phone', 'ring up', 'voicemail', 'speak to', 'speak with', 'talk to', 'talk with'];
  return verbalKeywords.some((kw) => matchesKeyword(lowerText, kw));
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function minutesToTimeInputValue(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function durationOptions(current: number): number[] {
  return DURATION_PRESETS.includes(current) ? DURATION_PRESETS : [...DURATION_PRESETS, current].sort((a, b) => a - b);
}

// Compute the schedule (manually-placed + auto-placed tasks) as pure data.
// Shared by the daily view (rendering) and the drag-to-move handler (overlap
// checks), so both always agree on what's actually occupying what time.
export function computeSchedule(taskList: Task[], energyLevel: EnergyLevel, scheduleStartTime: number): ComputedSchedule {
  const totalCapacity = ENERGY_CAPACITY[energyLevelToRequired(energyLevel)];

  const manuallyScheduled = taskList.filter((t) => t.scheduledTime !== undefined);
  const autoScheduled = taskList.filter((t) => t.scheduledTime === undefined);

  const sortedAutoTasks = [...autoScheduled].sort((a, b) => {
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
    return 0;
  });

  const schedule: ScheduleEvent[] = [];

  manuallyScheduled.forEach((task) => {
    const taskDuration = task.duration || 30;
    const start = task.scheduledTime!;
    const end = start + taskDuration;

    schedule.push({
      task,
      startTime: start,
      endTime: end,
      startTimeStr: formatTime(start),
      endTimeStr: formatTime(end),
      duration: taskDuration,
      isManual: true,
    });
  });

  let currentTime = scheduleStartTime;
  let totalUsed = manuallyScheduled.reduce((sum, t) => sum + (t.duration || 30), 0);

  for (const task of sortedAutoTasks) {
    const taskDuration = task.duration || 30;

    if (totalUsed + taskDuration <= totalCapacity) {
      const conflicts = schedule.filter(
        (s) => (currentTime >= s.startTime && currentTime < s.endTime) || (currentTime + taskDuration > s.startTime && currentTime < s.endTime)
      );

      if (conflicts.length > 0) {
        const lastConflict = conflicts.reduce((max, s) => (s.endTime > max ? s.endTime : max), 0);
        currentTime = lastConflict + 15; // 15 min break
      }

      const start = currentTime;
      const end = currentTime + taskDuration;

      schedule.push({
        task,
        startTime: start,
        endTime: end,
        startTimeStr: formatTime(start),
        endTimeStr: formatTime(end),
        duration: taskDuration,
        isManual: false,
      });

      totalUsed += taskDuration;
      currentTime = end + 15; // 15 min break
    }
    // else: this task doesn't fit right now - skip it and keep trying the
    // remaining (possibly smaller) tasks instead of stopping the whole
    // schedule.
  }

  schedule.sort((a, b) => a.startTime - b.startTime);

  return { schedule, totalUsed, totalCapacity };
}
