import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

import { Card } from '@/components/planner/card';
import { NavHeader } from '@/components/planner/nav-header';
import { PrimaryButton } from '@/components/planner/primary-button';
import { ScreenContainer } from '@/components/planner/screen-container';
import { ThemedText } from '@/components/themed-text';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { usePlanner } from '@/store/planner-store';

export default function AddTasksScreen() {
  const theme = usePlannerTheme();
  const { communicationMode, addTasks } = usePlanner();
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);

  useSpeechRecognitionEvent('result', (event) => {
    const fullTranscript = event.results
      .map((r) => r.transcript)
      .join('. ')
      // Spoken task lists often use "and" to join tasks instead of a pause
      // (e.g. "edit post and call my mom") - break those onto separate
      // lines so they're split into separate tasks like typed input.
      .replace(/\s+and\s+/gi, '\n');
    setText(fullTranscript.trim());
  });

  useSpeechRecognitionEvent('end', () => setRecording(false));

  useSpeechRecognitionEvent('error', (event) => {
    setRecording(false);
    if (event.error === 'not-allowed') {
      Alert.alert('Microphone access denied', 'Please allow microphone access and try again.');
    } else if (event.error === 'no-speech') {
      Alert.alert('No speech detected', 'Try speaking louder or closer to the microphone.');
    }
  });

  async function toggleVoice() {
    if (recording) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone access denied', 'Please allow microphone access and try again.');
      return;
    }

    setRecording(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: true });
  }

  function handleContinue() {
    const lines = text
      .split(/\n|•/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      Alert.alert('Add at least one task', 'Type or record a task before continuing.');
      return;
    }
    addTasks(lines);
    setText('');
    router.push('/prioritize');
  }

  const showVoice = communicationMode === 'verbal';

  return (
    <ScreenContainer
      headerRow={router.canGoBack() ? <NavHeader onBack={() => router.back()} /> : undefined}
      title="Add your tasks"
      subtitle="Type one task per line, or record with your voice"
      footer={<PrimaryButton label="Continue" onPress={handleContinue} />}>
      <Card style={styles.centeredCard}>
        {showVoice ? (
          <>
            <Pressable
              onPress={toggleVoice}
              style={[styles.voiceButton, { backgroundColor: recording ? theme.danger : theme.primary }]}>
              <Ionicons name={recording ? 'stop' : 'mic'} size={32} color={theme.onPrimary} />
            </Pressable>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {recording ? 'Listening… tap to stop' : 'Tap to record your tasks'}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              or
            </ThemedText>
          </>
        ) : null}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type your tasks, one per line"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.textArea, { borderColor: theme.border, color: theme.text }]}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centeredCard: {
    alignItems: 'center',
  },
  voiceButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    width: '100%',
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
