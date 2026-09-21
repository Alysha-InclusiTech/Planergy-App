import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/planner/card';
import { PrimaryButton } from '@/components/planner/primary-button';
import { ScreenContainer } from '@/components/planner/screen-container';
import { usePlannerTheme } from '@/hooks/use-planner-theme';

function messageFor(err: unknown, fallback: string) {
  if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage || err.errors[0]?.message || fallback;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function SignInScreen() {
  const theme = usePlannerTheme();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const [step, setStep] = useState<'email' | 'code'>('email');
  // Whichever flow the email resolved to: existing users verify a first
  // factor, new users verify their new email address.
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ready = signInLoaded && signUpLoaded;

  async function startSignUp(identifier: string) {
    if (!signUp) return;
    await signUp.create({ emailAddress: identifier });
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    setFlow('signUp');
    setStep('code');
  }

  async function sendCode() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      return;
    }
    if (!ready || !signIn) return;

    setError('');
    setLoading(true);
    try {
      const attempt = await signIn.create({ identifier: trimmed });
      const factor = attempt.supportedFirstFactors?.find((f) => f.strategy === 'email_code');

      if (!factor || !('emailAddressId' in factor)) {
        setError('Email code sign-in is not enabled for this Clerk application.');
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
      setFlow('signIn');
      setStep('code');
    } catch (err) {
      // No account yet for this email - create one and verify it instead,
      // which matches the previous passwordless behaviour.
      const notFound =
        isClerkAPIResponseError(err) &&
        err.errors.some((e) => e.code === 'form_identifier_not_found');

      if (notFound) {
        try {
          await startSignUp(trimmed);
          return;
        } catch (signUpErr) {
          setError(messageFor(signUpErr, 'Something went wrong creating your account. Please try again.'));
          return;
        }
      }
      setError(messageFor(err, 'Something went wrong sending the code. Please try again shortly.'));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter the code we emailed you.');
      return;
    }
    if (!ready || !signIn || !signUp || !setActive) return;

    setError('');
    setLoading(true);
    try {
      const result =
        flow === 'signIn'
          ? await signIn.attemptFirstFactor({ strategy: 'email_code', code: trimmed })
          : await signUp.attemptEmailAddressVerification({ code: trimmed });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
        return;
      }
      setError('That code was not enough to finish signing in. Please try again.');
    } catch (err) {
      setError(messageFor(err, 'Something went wrong verifying the code. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer title="Planergy" subtitle="Plan your day based on your energy level">
      <Card>
        {step === 'email' ? (
          <>
            <ThemedText type="smallBold" style={{ color: theme.text }}>
              Sign in with your email
            </ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
            {error ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {error}
              </ThemedText>
            ) : null}
            <PrimaryButton label="Send code" onPress={sendCode} loading={loading || !ready} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              New here? We&apos;ll create your account automatically.
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="smallBold" style={{ color: theme.text }}>
              Enter the code sent to {email}
            </ThemedText>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
            {error ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {error}
              </ThemedText>
            ) : null}
            <PrimaryButton
              label={flow === 'signUp' ? 'Verify & create account' : 'Verify & sign in'}
              onPress={verifyCode}
              loading={loading}
            />
            <View style={styles.linksRow}>
              <ThemedText
                type="link"
                style={{ color: theme.textSecondary }}
                onPress={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                }}>
                Use a different email
              </ThemedText>
              <ThemedText type="link" style={{ color: theme.primary }} onPress={sendCode}>
                Resend code
              </ThemedText>
            </View>
          </>
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
