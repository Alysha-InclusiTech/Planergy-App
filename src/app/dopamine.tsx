import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/planner/card';
import { NavHeader } from '@/components/planner/nav-header';
import { PrimaryButton } from '@/components/planner/primary-button';
import { ScreenContainer } from '@/components/planner/screen-container';
import { ThemedText } from '@/components/themed-text';
import { usePlannerTheme } from '@/hooks/use-planner-theme';
import { usePlanner } from '@/store/planner-store';

export default function DopamineScreen() {
  const theme = usePlannerTheme();
  const { dopamineItems, addDopamineItem, editDopamineItem, removeDopamineItem, addDopamineToSchedule } = usePlanner();

  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDuration, setEditDuration] = useState('15');

  function handleAdd() {
    if (!newText.trim()) return;
    addDopamineItem(newText);
    setNewText('');
    setShowAdd(false);
  }

  function startEdit(id: string, text: string, duration: number) {
    setEditingId(id);
    setEditText(text);
    setEditDuration(String(duration));
    setShowAdd(false);
  }

  function saveEdit() {
    if (!editingId) return;
    editDopamineItem(editingId, editText, parseInt(editDuration, 10) || 15);
    setEditingId(null);
  }

  function handleAddToSchedule(id: string) {
    addDopamineToSchedule(id);
    Alert.alert('Added', 'Added to today’s schedule.');
  }

  return (
    <ScreenContainer
      headerRow={
        <NavHeader
          onBack={() => router.back()}
          right={
            <Pressable onPress={() => setShowAdd((v) => !v)} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={26} color={theme.text} />
            </Pressable>
          }
        />
      }
      title="Dopamine menu"
      subtitle="Add fun, low-pressure activities to your schedule today">
      {showAdd ? (
        <Card>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            placeholder="What brings you joy?"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />
          <PrimaryButton label="Add" onPress={handleAdd} />
        </Card>
      ) : null}

      <View style={{ gap: 12 }}>
        {dopamineItems.map((item) => {
          const isEditing = editingId === item.id;
          return (
            <Card key={item.id}>
              {isEditing ? (
                <>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    placeholder="Activity"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  />
                  <TextInput
                    value={editDuration}
                    onChangeText={setEditDuration}
                    placeholder="15"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { borderColor: theme.border, color: theme.text, width: 90 }]}
                  />
                  <View style={styles.row}>
                    <PrimaryButton label="Save" onPress={saveEdit} />
                    <PrimaryButton label="Cancel" variant="secondary" onPress={() => setEditingId(null)} />
                  </View>
                </>
              ) : (
                <Pressable onPress={() => handleAddToSchedule(item.id)}>
                  <View style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ color: theme.text, fontWeight: '600' }}>{item.text}</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {item.duration} min · tap to add to today
                      </ThemedText>
                    </View>
                    <Pressable onPress={() => startEdit(item.id, item.text, item.duration)} hitSlop={8}>
                      <Ionicons name="pencil-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => removeDopamineItem(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </Pressable>
              )}
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
