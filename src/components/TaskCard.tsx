import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { HabitTask } from '../store/useStore';

interface TaskCardProps {
  task: HabitTask;
  onComplete: () => void;
}

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  // Animation scale for a gentle pop when completed
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

  // If completed, keep it slightly faded out
  useEffect(() => {
    if (task.completed) {
      Animated.timing(fadeValue, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }
  }, [task.completed]);

  const handlePress = () => {
    if (task.completed) return; // Already completed

    // Gentle press animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
        onComplete();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: fadeValue }}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={[styles.card, task.completed && styles.cardCompleted]} 
        onPress={handlePress}
        disabled={task.completed}
      >
        <View style={[styles.iconContainer, task.completed && styles.iconContainerCompleted]}>
            {/* Convert generic icon strings to valid Feather icons */}
            <Feather 
                name={getFeatherIcon(task.icon)} 
                size={24} 
                color={task.completed ? theme.colors.card : theme.colors.primary} 
            />
        </View>
        
        <View style={styles.content}>
            <Text style={[styles.title, task.completed && styles.titleCompleted]}>
                {task.title}
            </Text>
        </View>

        <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
            {task.completed && <Feather name="check" size={16} color={theme.colors.card} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Simple mapper since our initialState used some generic strings
function getFeatherIcon(type: string): keyof typeof Feather.glyphMap {
    switch (type) {
        case 'water': return 'droplet';
        case 'bed': return 'home'; // bed doesn't exist in feather, use home
        case 'walk': return 'navigation';
        case 'sparkles': return 'star';
        default: return 'circle';
    }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardCompleted: {
    backgroundColor: theme.colors.background,
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerCompleted: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  titleCompleted: {
    color: theme.colors.textLight,
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }
});
