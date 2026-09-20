import { PlannerColors } from '@/constants/planner-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function usePlannerTheme() {
  const scheme = useColorScheme();
  return PlannerColors[scheme === 'dark' ? 'dark' : 'light'];
}
