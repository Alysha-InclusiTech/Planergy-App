import { router } from 'expo-router';

import { Card } from '@/components/planner/card';
import { NavHeader } from '@/components/planner/nav-header';
import { PrimaryButton } from '@/components/planner/primary-button';
import { ScreenContainer } from '@/components/planner/screen-container';
import { SegmentedControl } from '@/components/planner/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { usePlanner } from '@/store/planner-store';

export default function QuestionsScreen() {
  const theme = usePlannerTheme();
  const { tasks, workHours, setWorkHours, energyLevel, setEnergyLevel, communicationMode, setCommunicationMode, completeOnboarding } =
    usePlanner();
  const isEditing = tasks.length > 0;

  function handleContinue() {
    completeOnboarding();
    router.replace(isEditing ? '/daily-view' : '/add-tasks');
  }

  return (
    <ScreenContainer
      headerRow={isEditing ? <NavHeader onBack={() => router.back()} /> : undefined}
      title="A few quick questions"
      subtitle="This helps Planergy build a schedule that fits your day"
      footer={<PrimaryButton label="Continue" onPress={handleContinue} />}>
      <Card>
        <ThemedText type="smallBold" style={{ color: theme.text }}>
          Do you work 9–5, or flexible hours?
        </ThemedText>
        <SegmentedControl
          value={workHours}
          onChange={setWorkHours}
          options={[
            { label: '9–5', value: 'nine-to-five' },
            { label: 'Flexible', value: 'flexible' },
          ]}
        />
      </Card>

      <Card>
        <ThemedText type="smallBold" style={{ color: theme.text }}>
          What&apos;s your energy level today?
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
      </Card>

      <Card>
        <ThemedText type="smallBold" style={{ color: theme.text }}>
          Are you nonverbal or verbal today?
        </ThemedText>
        <SegmentedControl
          value={communicationMode}
          onChange={setCommunicationMode}
          options={[
            { label: 'Can talk', value: 'verbal' },
            { label: 'Non-verbal', value: 'nonverbal' },
          ]}
        />
      </Card>
    </ScreenContainer>
  );
}
