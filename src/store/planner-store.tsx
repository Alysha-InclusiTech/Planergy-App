import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_DOPAMINE_ITEMS, estimateEnergy, estimateMinutes } from '@/lib/planner-logic';
import { CommunicationMode, DopamineItem, EnergyLevel, EnergyRequired, Priority, Task, WorkHoursMode } from '@/types/planner';

const STORAGE_KEY = 'planergy:data';
const DEFAULT_SCHEDULE_START = 9 * 60; // 9:00 AM

type PlannerData = {
  tasks: Task[];
  energyLevel: EnergyLevel;
  communicationMode: CommunicationMode;
  workHours: WorkHoursMode;
  dopamineItems: DopamineItem[];
  scheduleStartTime: number;
  onboardingComplete: boolean;
};

const DEFAULT_DATA: PlannerData = {
  tasks: [],
  energyLevel: 'medium',
  communicationMode: 'verbal',
  workHours: 'nine-to-five',
  dopamineItems: DEFAULT_DOPAMINE_ITEMS,
  scheduleStartTime: DEFAULT_SCHEDULE_START,
  onboardingComplete: false,
};

type PlannerContextValue = PlannerData & {
  isLoaded: boolean;
  addTasks: (texts: string[]) => void;
  deleteTask: (id: number) => void;
  togglePriority: (id: number) => void;
  setTaskDuration: (id: number, minutes: number) => void;
  setTaskEnergy: (id: number, level: EnergyRequired) => void;
  toggleTaskComplete: (id: number) => void;
  moveTask: (id: number, newStartTime: number | undefined) => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  setCommunicationMode: (mode: CommunicationMode) => void;
  setWorkHours: (mode: WorkHoursMode) => void;
  setScheduleStartTime: (minutes: number) => void;
  addDopamineItem: (text: string, duration?: number) => void;
  editDopamineItem: (id: string, text: string, duration: number) => void;
  removeDopamineItem: (id: string) => void;
  addDopamineToSchedule: (id: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  clearAllData: () => void;
};

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlannerData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<PlannerData>;
          setData({ ...DEFAULT_DATA, ...saved });
        }
      } finally {
        hydrated.current = true;
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      ...data,
      isLoaded,

      addTasks: (texts) => {
        const trimmed = texts.map((t) => t.trim()).filter(Boolean);
        if (trimmed.length === 0) return;
        setData((prev) => ({
          ...prev,
          tasks: [
            ...prev.tasks,
            ...trimmed.map((text, index) => ({
              id: Date.now() + index,
              text,
              priority: 'flexible' as Priority,
              duration: estimateMinutes(text),
              energyRequired: estimateEnergy(text),
              completed: false,
              dopamine: false,
            })),
          ],
        }));
      },

      deleteTask: (id) => setData((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) })),

      togglePriority: (id) =>
        setData((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === id ? { ...t, priority: t.priority === 'important' ? 'flexible' : 'important' } : t)),
        })),

      setTaskDuration: (id, minutes) =>
        setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, duration: minutes } : t)) })),

      setTaskEnergy: (id, level) =>
        setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, energyRequired: level } : t)) })),

      toggleTaskComplete: (id) =>
        setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) })),

      moveTask: (id, newStartTime) =>
        setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, scheduledTime: newStartTime } : t)) })),

      setEnergyLevel: (level) => setData((prev) => ({ ...prev, energyLevel: level })),
      setCommunicationMode: (mode) => setData((prev) => ({ ...prev, communicationMode: mode })),
      setWorkHours: (mode) => setData((prev) => ({ ...prev, workHours: mode })),
      setScheduleStartTime: (minutes) => setData((prev) => ({ ...prev, scheduleStartTime: minutes })),

      addDopamineItem: (text, duration = 15) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setData((prev) => ({
          ...prev,
          dopamineItems: [...prev.dopamineItems, { id: 'custom-' + Date.now(), text: trimmed, duration, custom: true }],
        }));
      },

      editDopamineItem: (id, text, duration) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setData((prev) => ({
          ...prev,
          dopamineItems: prev.dopamineItems.map((d) => (d.id === id ? { ...d, text: trimmed, duration: duration || 15 } : d)),
        }));
      },

      removeDopamineItem: (id) => setData((prev) => ({ ...prev, dopamineItems: prev.dopamineItems.filter((d) => d.id !== id) })),

      addDopamineToSchedule: (id) =>
        setData((prev) => {
          const item = prev.dopamineItems.find((d) => d.id === id);
          if (!item) return prev;
          const newTask: Task = {
            id: Date.now(),
            text: item.text,
            priority: 'flexible',
            duration: item.duration || estimateMinutes(item.text),
            energyRequired: 1,
            dopamine: true,
            completed: false,
          };
          return { ...prev, tasks: [...prev.tasks, newTask] };
        }),

      completeOnboarding: () => setData((prev) => ({ ...prev, onboardingComplete: true })),
      resetOnboarding: () => setData((prev) => ({ ...prev, onboardingComplete: false })),

      clearAllData: () => setData(DEFAULT_DATA),
    }),
    [data, isLoaded]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within a PlannerProvider');
  return ctx;
}
