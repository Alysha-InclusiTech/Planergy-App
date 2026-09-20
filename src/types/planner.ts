export type EnergyLevel = 'low' | 'medium' | 'high';
export type EnergyRequired = 1 | 2 | 3;
export type Priority = 'important' | 'flexible';
export type CommunicationMode = 'verbal' | 'nonverbal';
export type WorkHoursMode = 'nine-to-five' | 'flexible';

export type Task = {
  id: number;
  text: string;
  priority: Priority;
  duration: number;
  energyRequired: EnergyRequired;
  completed: boolean;
  dopamine: boolean;
  scheduledTime?: number;
};

export type DopamineItem = {
  id: string;
  text: string;
  duration: number;
  custom?: boolean;
};

export type ScheduleEvent = {
  task: Task;
  startTime: number;
  endTime: number;
  startTimeStr: string;
  endTimeStr: string;
  duration: number;
  isManual: boolean;
};

export type ComputedSchedule = {
  schedule: ScheduleEvent[];
  totalUsed: number;
  totalCapacity: number;
};

export type PlannerAnswers = {
  workHours: WorkHoursMode;
  energyLevel: EnergyLevel;
  communicationMode: CommunicationMode;
};
