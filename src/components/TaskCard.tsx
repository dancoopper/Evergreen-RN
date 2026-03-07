import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/colors';
import { HabitTask, TaskCategory } from '../store/useStore';

interface TaskCardProps {
  task: HabitTask;
  onComplete: () => void;
}

const categoryColors: Record<TaskCategory, string> = {
  health: '#48BB78',
  mind: '#9F7AEA',
  social: '#ED8936',
  environment: '#4299E1',
};

const categoryLabels: Record<TaskCategory, string> = {
  health: '💚 Health',
  mind: '🧠 Mind',
  social: '🤝 Social',
  environment: '🌿 Environment',
};

export default function TaskCard({ task, onComplete }: TaskCardProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

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
    if (task.completed) return;

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

  const catColor = categoryColors[task.category] || '#9F7AEA';
  const catLabel = categoryLabels[task.category] || '🧠 Mind';

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: fadeValue }}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, task.completed && styles.cardCompleted]}
        onPress={handlePress}
        disabled={task.completed}
      >
        <View style={[styles.iconContainer, task.completed && styles.iconContainerCompleted]}>
          <Feather
            name={getFeatherIcon(task.icon)}
            size={22}
            color={task.completed ? theme.colors.card : theme.colors.primary}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, task.completed && styles.titleCompleted]} numberOfLines={1}>
              {task.title}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.categoryText, { color: catColor }]}>{catLabel}</Text>
            </View>
          </View>
          {task.description ? (
            <Text style={[styles.description, task.completed && styles.descriptionCompleted]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
        </View>

        <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
          {task.completed && <Feather name="check" size={16} color={theme.colors.card} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function getFeatherIcon(type: string): keyof typeof Feather.glyphMap {
  switch (type) {
    case 'water': return 'droplet';
    case 'bed': return 'home';
    case 'walk': return 'navigation';
    case 'sparkles': return 'star';
    case 'heart': return 'heart';
    case 'book': return 'book-open';
    case 'sun': return 'sun';
    case 'music': return 'music';
    case 'coffee': return 'coffee';
    case 'smile': return 'smile';
    case 'eye': return 'eye';
    case 'moon': return 'moon';
    default: return 'circle';
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 10,
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
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  iconContainerCompleted: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    flexShrink: 1,
  },
  titleCompleted: {
    color: theme.colors.textLight,
    textDecorationLine: 'line-through',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
    lineHeight: 16,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }
});
