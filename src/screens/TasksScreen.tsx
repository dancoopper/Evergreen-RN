import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { useStore, defaultTasks } from '../store/useStore';
import TaskCard from '../components/TaskCard';
import { Feather } from '@expo/vector-icons';
import { generateTasks } from '../lib/backboard';

export default function TasksScreen() {
  const tasks = useStore(state => state.tasks);
  const completeTask = useStore(state => state.completeTask);
  const resetTasks = useStore(state => state.resetTasks);
  const isLoadingTasks = useStore(state => state.isLoadingTasks);
  const userGoal = useStore(state => state.userGoal);
  const setTasks = useStore(state => state.setTasks);
  const setLoadingTasks = useStore(state => state.setLoadingTasks);
  const setUserGoal = useStore(state => state.setUserGoal);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;

  async function handleGenerateForGoal(goal: string) {
    if (!goal.trim()) return;

    setShowGoalModal(false);
    setUserGoal(goal.trim());
    setIsRegenerating(true);
    setLoadingTasks(true);

    try {
      const aiTasks = await generateTasks(goal.trim());
      setTasks(aiTasks);
    } catch (error) {
      console.warn('⚠️ Failed to generate tasks:', error);
    } finally {
      setIsRegenerating(false);
      setLoadingTasks(false);
    }
  }

  async function handleRegenerate() {
    if (!userGoal) return;
    await handleGenerateForGoal(userGoal);
  }

  function handleDeleteGoal() {
    Alert.alert(
      'Remove Goal',
      'Are you sure you want to remove your current goal? Your tasks will reset to defaults.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setUserGoal('');
            setTasks(defaultTasks);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Gentle Steps</Text>
            <Text style={styles.subtitle}>Take your time, there is no rush.</Text>
          </View>
          <View style={styles.headerActions}>
            {userGoal ? (
              <TouchableOpacity
                onPress={handleRegenerate}
                style={styles.actionButton}
                disabled={isRegenerating}
              >
                <Feather name="refresh-cw" size={18} color={isRegenerating ? theme.colors.textLight : theme.colors.primary} />
              </TouchableOpacity>
            ) : null}
            {completedCount > 0 && (
              <TouchableOpacity onPress={resetTasks} style={styles.actionButton}>
                <Feather name="rotate-ccw" size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Current goal badge */}
        {userGoal ? (
          <View style={styles.goalBadge}>
            <Feather name="target" size={14} color={theme.colors.primary} />
            <Text style={styles.goalBadgeText} numberOfLines={1}>{userGoal}</Text>
            <TouchableOpacity onPress={handleDeleteGoal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={14} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoadingTasks || isRegenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              {isRegenerating ? 'Refreshing your tasks...' : 'Creating your gentle steps...'}
            </Text>
            <Text style={styles.loadingSubtext}>Our coach is crafting something just for you 💛</Text>
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => completeTask(task.id)}
                />
              ))}
            </View>

            {completedCount === tasks.length && (
              <View style={styles.celebration}>
                <Text style={styles.celebrationText}>All steps complete! 🎉</Text>
                <Text style={styles.celebrationSub}>Enjoy your peaceful oasis.</Text>
              </View>
            )}
          </>
        )}

        {/* New Goal Button */}
        <TouchableOpacity
          style={styles.newGoalButton}
          onPress={() => { setNewGoal(''); setShowGoalModal(true); }}
        >
          <Feather name="plus" size={18} color={theme.colors.primary} />
          <Text style={styles.newGoalButtonText}>Set a new goal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Goal Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What's your new goal?</Text>
            <Text style={styles.modalSubtitle}>Our AI will create specific tasks to help you achieve it</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Exercise more, read daily, eat healthier..."
              value={newGoal}
              onChangeText={setNewGoal}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, !newGoal.trim() && styles.modalSubmitDisabled]}
                onPress={() => handleGenerateForGoal(newGoal)}
                disabled={!newGoal.trim()}
              >
                <Feather name="zap" size={16} color="#FFF" />
                <Text style={styles.modalSubmitText}>Generate Tasks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
    gap: 6,
  },
  goalBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  list: {
    marginTop: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  celebration: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  celebrationSub: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  newGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  newGoalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 4,
    marginBottom: theme.spacing.lg,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  modalSubmitButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    gap: 6,
  },
  modalSubmitDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
