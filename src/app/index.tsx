import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { useAuth } from '@/hooks/use-auth';
import { usePlanner } from '@/store/planner-store';

export default function Gate() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { onboardingComplete, isLoaded: plannerLoaded } = usePlanner();
  const theme = usePlannerTheme();

  if (!authLoaded || !plannerLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (!onboardingComplete) return <Redirect href="/questions" />;
  return <Redirect href="/daily-view" />;
}
