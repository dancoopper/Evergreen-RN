import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export default function OnboardingScreen() {
  const setOnboarded = useStore(state => state.setOnboarded);
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (!name.trim()) {
      Alert.alert("Hold on", "Please enter your name so we know what to call you!");
      return;
    }

    setSaving(true);

    if (user && !user.isGuest) {
      // Save user info to Supabase using Auth0 user ID
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, // Storing Auth0 ID as the primary key in Supabase
          display_name: name,
          primary_goal: goal,
          updated_at: new Date()
        });

      if (error) {
        console.warn("Could not save to Supabase. Make sure your tables are set up.", error);
      }
    }

    // Update generic state for both auth'ed users and guests
    if (user) {
      setUser({ ...user, name: name });
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
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleFinish}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Start My Journey"}
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
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
