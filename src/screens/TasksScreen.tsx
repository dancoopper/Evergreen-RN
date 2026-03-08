import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, Alert, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { useStore, defaultTasks } from '../store/useStore';
import TaskCard from '../components/TaskCard';
import { Feather } from '@expo/vector-icons';
import { generateTasks } from '../lib/backboard';
import { LinearGradient } from 'expo-linear-gradient';

// --- Firefly Component ---
const Firefly = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const topPos = useRef(Math.random() * Dimensions.get('window').height).current;
  const leftPos = useRef(Math.random() * Dimensions.get('window').width).current;
  const size = useRef(Math.random() * 6 + 4).current; 

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 2000 + 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: Math.random() * 2000 + 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6]
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15]
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: topPos,
        left: leftPos,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#E2F1E7', 
        opacity: opacity,
        transform: [{ translateY }],
        shadowColor: '#FEF08A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 1
      }}
      pointerEvents="none"
    />
  );
};

export default function TasksScreen() {
  const tasks = useStore(state => state.tasks);
  const completeTask = useStore(state => state.completeTask);
  const resetTasks = useStore(state => state.resetTasks);
  const isLoadingTasks = useStore(state => state.isLoadingTasks);
  const userGoal = useStore(state => state.userGoal);
  const setTasks = useStore(state => state.setTasks);
  const setLoadingTasks = useStore(state => state.setLoadingTasks);
  const setUserGoal = useStore(state => state.setUserGoal);
  const syncTasksToSupabase = useStore(state => state.syncTasksToSupabase);
  const user = useStore(state => state.user);

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
      syncTasksToSupabase(aiTasks);
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Deep Teal Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#2B464F', '#1F343A']}
          style={StyleSheet.absoluteFillObject}
        />
        {Array.from({ length: 25 }).map((_, i) => (
          <Firefly key={`firefly-${i}`} delay={Math.random() * 2000} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Glassmorphic Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Evergreen</Text>
          <Text style={styles.welcomeSubtitle}>Welcome{user?.name ? `, ${user.name}` : ''}!</Text>
          <Text style={styles.welcomeText}>
            Whenever you're ready, let's have a short breath here can grow something real in the full Evergreen app.
          </Text>
          
          <View style={styles.headerActions}>
            {userGoal ? (
              <TouchableOpacity onPress={handleRegenerate} style={styles.actionIconButton} disabled={isRegenerating}>
                <Feather name="refresh-cw" size={16} color={isRegenerating ? 'rgba(255,255,255,0.4)' : '#FFF'} />
              </TouchableOpacity>
            ) : null}
            {completedCount > 0 && (
              <TouchableOpacity onPress={resetTasks} style={styles.actionIconButton}>
                <Feather name="rotate-ccw" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
            {userGoal ? (
              <TouchableOpacity onPress={handleDeleteGoal} style={styles.actionIconButton}>
                <Feather name="x" size={16} color="#FFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {isLoadingTasks || isRegenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E2F1E7" />
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
          <LinearGradient
            colors={['#F6B352', '#F68657']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newGoalGradient}
          >
            <Feather name="target" size={18} color="#FFF" />
            <Text style={styles.newGoalButtonText}>Set a new goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Goal Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
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
              placeholderTextColor="rgba(255,255,255,0.4)"
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
                <LinearGradient
                  colors={['#F6B352', '#F68657']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalSubmitGradient}
                >
                  <Feather name="zap" size={16} color="#FFF" />
                  <Text style={styles.modalSubmitText}>Generate Tasks</Text>
                </LinearGradient>
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
    backgroundColor: '#1F343A',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: 40,
    zIndex: 1,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  welcomeTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionIconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  list: {
    marginTop: 10,
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
    color: '#FFF',
    marginTop: theme.spacing.lg,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: theme.spacing.sm,
  },
  celebration: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(72, 187, 120, 0.4)',
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  celebrationSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  newGoalButton: {
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F68657',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  newGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  newGoalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F343A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  modalSubmitButton: {
    flex: 2,
    borderRadius: 100,
    overflow: 'hidden',
  },
  modalSubmitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalSubmitDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

