# Planergy

An energy-aware daily planner. Instead of scheduling tasks by time alone,
Planergy asks how much mental/physical energy you have for the day and
how much each task takes, then builds a realistic schedule around that
capacity rather than an idealized one.

## How it works

1. **Sign in** — Supabase-backed auth.
2. **Questions** — set your available work hours, energy level for the
   day, and preferred communication mode.
3. **Add tasks** — type or dictate tasks (voice input via
   `expo-speech-recognition`).
4. **Prioritize** — mark priority, assign a duration and energy cost to
   each task.
5. **Daily view** — tasks are scheduled into a timeline based on your
   energy capacity for the day (`src/lib/planner-logic.ts`), not just
   raw time available.
6. **Dopamine** — short, low-effort rewards to break up the day.

## Stack

- [Expo](https://expo.dev) (SDK 54) + [expo-router](https://docs.expo.dev/router/introduction/) for file-based routing
- React Native 0.81 / React 19
- [Supabase](https://supabase.com) for auth and data
- TypeScript

## Getting started

```bash
npm install
npx expo start
```

This app has no separate `.env` setup yet — Supabase connection details
live in `src/lib/supabase.ts`. From the Expo CLI output you can open the
app in a development build, an Android/iOS simulator, or Expo Go.

## Project structure

```
src/
  app/          screens, one file per route (expo-router)
  components/   shared UI (planner/ holds the app-specific components)
  hooks/        useAuth, useTheme, useColorScheme, etc.
  lib/          Supabase client, scheduling logic
  store/        planner state (PlannerProvider)
  types/        shared TypeScript types
```

## Scripts

- `npm run android` / `npm run ios` / `npm run web` — start Expo for a specific platform
- `npm run lint` — `expo lint`
