import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';
import { generateTasks } from '../lib/backboard';

export default function OnboardingScreen() {
  const setOnboarded = useStore(state => state.setOnboarded);
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const setTasks = useStore(state => state.setTasks);
  const setLoadingTasks = useStore(state => state.setLoadingTasks);
  const setUserGoal = useStore(state => state.setUserGoal);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState('');

  async function handleFinish() {
    if (!name.trim()) {
      Alert.alert("Hold on", "Please enter your name so we know what to call you!");
      return;
    }

    setSaving(true);
    setStatusText('Setting up your space...');

    // Update user name
    if (user) {
      setUser({ ...user, name: name });
    }

    // Save the goal
    setUserGoal(goal.trim());

    // Generate AI tasks if the user provided a goal
    if (goal.trim()) {
      try {
        setStatusText('🤖 Creating your personalized tasks...');
        setLoadingTasks(true);

        const aiTasks = await generateTasks(goal.trim());
        setTasks(aiTasks);
        setLoadingTasks(false);

        console.log('✅ AI tasks set successfully');
      } catch (error) {
        console.warn('⚠️ AI task generation failed, using defaults:', error);
        setLoadingTasks(false);
        // Default tasks are already loaded in the store
      }
    }

    setSaving(false);
    setOnboarded(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Welcome to Oasis</Text>
          <Text style={styles.subtitle}>Before we begin, let's personalize your space.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>What is your gentle goal?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. To take a breath, or drink more water..."
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.hint}>Our AI will create personalized tasks based on your goal ✨</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
            onPress={handleFinish}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? statusText : "Start My Journey"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  headerContainer: { marginBottom: theme.spacing.xl },
  header: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 16, color: theme.colors.textLight, marginTop: 8 },
  formContainer: {},
  inputContainer: { marginBottom: theme.spacing.xl },
  label: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 },
  hint: { fontSize: 13, color: theme.colors.textLight, marginTop: 8, fontStyle: 'italic' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.8,
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
