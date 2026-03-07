import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';
import TaskCard from '../components/TaskCard';
import { Feather } from '@expo/vector-icons';

export default function TasksScreen() {
  const tasks = useStore(state => state.tasks);
  const completeTask = useStore(state => state.completeTask);
  const resetTasks = useStore(state => state.resetTasks);

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.header}>Gentle Steps</Text>
            <Text style={styles.subtitle}>Take your time, there is no rush.</Text>
          </View>
          {completedCount > 0 && (
            <TouchableOpacity onPress={resetTasks} style={styles.resetButton}>
              <Feather name="rotate-ccw" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

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
              <Text style={styles.celebrationText}>All steps complete.</Text>
              <Text style={styles.celebrationSub}>Enjoy your peaceful oasis.</Text>
           </View>
        )}
      </ScrollView>
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
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  list: {
    marginTop: theme.spacing.md,
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
  }
});
