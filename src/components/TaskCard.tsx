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
  health: ' Health',
  mind: ' Mind',
  social: ' Social',
  environment: ' Environment',
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
  const catLabel = categoryLabels[task.category] || 'Mind';

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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  iconContainerCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flexShrink: 1,
  },
  titleCompleted: {
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    lineHeight: 18,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.3)',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxCompleted: {
    backgroundColor: '#F6B352',
    borderColor: '#F6B352',
  }
});
