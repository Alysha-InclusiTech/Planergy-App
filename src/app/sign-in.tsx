import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/planner/card';
import { PrimaryButton } from '@/components/planner/primary-button';
import { ScreenContainer } from '@/components/planner/screen-container';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const theme = usePlannerTheme();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendCode() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({ email: trimmed });
    setLoading(false);
    if (sendError) {
      setError(sendError.message && sendError.message !== '{}' ? sendError.message : 'Something went wrong sending the code. Please try again shortly.');
      return;
    }
    setStep('code');
  }

  async function verifyCode() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter the code we emailed you.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: trimmed,
      type: 'email',
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message && verifyError.message !== '{}' ? verifyError.message : 'Something went wrong verifying the code. Please try again.');
      return;
    }
    router.replace('/');
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
            <PrimaryButton label="Send code" onPress={sendCode} loading={loading} />
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
            <PrimaryButton label="Verify & sign in" onPress={verifyCode} loading={loading} />
            <View style={styles.linksRow}>
              <ThemedText
                type="link"
                style={{ color: theme.textSecondary }}
                onPress={() => {
                  setStep('email');
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
