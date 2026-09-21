import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';

/**
 * Thin wrapper over Clerk's hooks that keeps the shape the app already
 * consumes (`isSignedIn` / `isLoaded` / `signOut`), so screens don't need to
 * know which auth provider is behind it.
 */
export function useAuth() {
  const { isLoaded, isSignedIn, userId, sessionId, signOut } = useClerkAuth();
  const { user } = useUser();

  return {
    user: user ?? null,
    userId: userId ?? null,
    sessionId: sessionId ?? null,
    isSignedIn: !!isSignedIn,
    isLoaded,
    // Wrapped so press handlers can pass it straight to onPress without
    // their event argument landing in Clerk's options parameter.
    signOut: () => signOut(),
  };
}
