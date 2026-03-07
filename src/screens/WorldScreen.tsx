import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';

export default function WorldScreen() {
  const growthLevel = useStore(state => state.growthLevel); // 0 to 4

  // Animation values
  const skyColorAnim = useRef(new Animated.Value(0)).current;
  const elementScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate when growthLevel changes
    Animated.parallel([
      Animated.timing(skyColorAnim, {
        toValue: growthLevel,
        duration: 800,
        useNativeDriver: false, // Colors can't use native driver
      }),
      Animated.spring(elementScaleAnim, {
        toValue: growthLevel,
        friction: 6,
        tension: 40,
        useNativeDriver: true, // Transforms can use native driver
      })
    ]).start();
  }, [growthLevel]);

  // Interpolate Sky Color
  const skyColor = skyColorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      '#1A202C', // Night/Dim
      '#2D3748', // Dawn
      '#EBF8FF', // Morning Blue
      '#BEE3F8', // Sunny Light Blue
      '#90CDF4'  // Bright Blue
    ],
    extrapolate: 'clamp'
  });

  // Calculate scales and opacities for different elements based on continuous animation value
  const seedScale = elementScaleAnim.interpolate({
    inputRange: [0, 0.5, 1, 4],
    outputRange: [1, 1.2, 0.8, 0], // seed disappears as it grows
    extrapolate: 'clamp'
  });

  const stemHeight = elementScaleAnim.interpolate({
    inputRange: [0, 1, 2, 4],
    outputRange: [0, 20, 80, 120],
    extrapolate: 'clamp'
  });

  const leavesScale = elementScaleAnim.interpolate({
    inputRange: [0, 1.5, 2, 4],
    outputRange: [0, 0, 1, 1.2],
    extrapolate: 'clamp'
  });

  const budScale = elementScaleAnim.interpolate({
    inputRange: [0, 2.5, 3, 4],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp'
  });

  const bloomScale = elementScaleAnim.interpolate({
    inputRange: [0, 3.5, 4],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp'
  });

  const sunTranslateY = elementScaleAnim.interpolate({
    inputRange: [0, 2, 4],
    outputRange: [200, 50, -50], // Sun rises
    extrapolate: 'clamp'
  });

  const sunOpacity = elementScaleAnim.interpolate({
    inputRange: [0, 1, 3, 4],
    outputRange: [0, 0, 0.5, 1],
    extrapolate: 'clamp'
  });


  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { backgroundColor: skyColor }]}>

        <View style={styles.headerContainer}>
          <Text style={[styles.header, growthLevel < 2 && { color: '#FFF' }]}>Your Oasis</Text>
          <Text style={[styles.subtitle, growthLevel < 2 && { color: '#CBD5E0' }]}>
            {growthLevel === 0 && "Your world is quiet. Take a gentle step."}
            {growthLevel === 1 && "A tiny sprout appears."}
            {growthLevel === 2 && "Growing stronger."}
            {growthLevel === 3 && "Almost ready to bloom."}
            {growthLevel === 4 && "Your oasis is vibrant and alive."}
          </Text>
        </View>

        <View style={styles.worldContainer}>
          {/* Sun */}
          <Animated.View style={[styles.sun, {
            opacity: sunOpacity,
            transform: [{ translateY: sunTranslateY }]
          }]} />

          {/* The Plant */}
          <View style={styles.plantContainer}>

            {/* Flower Bloom (Level 4) */}
            <Animated.View style={[styles.bloom, { transform: [{ scale: bloomScale }] }]}>
              <View style={styles.petalTop} />
              <View style={styles.petalRight} />
              <View style={styles.petalBottom} />
              <View style={styles.petalLeft} />
              <View style={styles.flowerCenter} />
            </Animated.View>

            {/* Bud (Level 3) */}
            <Animated.View style={[styles.bud, { transform: [{ scale: budScale }], opacity: elementScaleAnim.interpolate({ inputRange: [3, 4], outputRange: [1, 0] }) }]} />

            {/* Leaves (Level 2+) */}
            <Animated.View style={[styles.leafLeft, { transform: [{ scale: leavesScale }] }]} />
            <Animated.View style={[styles.leafRight, { transform: [{ scale: leavesScale }] }]} />

            {/* Stem (Level 1+) */}
            <Animated.View style={[styles.stem, { height: stemHeight }]} />

            {/* Seed (Level 0) */}
            <Animated.View style={[styles.seed, { transform: [{ scale: seedScale }] }]} />
          </View>

          {/* Ground */}
          <View style={styles.ground} />
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: theme.spacing.lg,
    zIndex: 10,
    marginTop: theme.spacing.xl,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  },
  worldContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 5,
  },
  ground: {
    width: '100%',
    height: 100,
    backgroundColor: '#81E6D9', // Soft teal green
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  plantContainer: {
    position: 'absolute',
    bottom: 80, // slightly below ground top
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  seed: {
    width: 20,
    height: 14,
    backgroundColor: '#975A16', // Brown
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
  stem: {
    width: 8,
    backgroundColor: '#48BB78', // Green
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  leafLeft: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    width: 24,
    height: 12,
    backgroundColor: '#48BB78',
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    transform: [{ rotate: '-30deg' }]
  },
  leafRight: {
    position: 'absolute',
    bottom: 60,
    right: -20,
    width: 24,
    height: 12,
    backgroundColor: '#48BB78',
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    transform: [{ rotate: '30deg' }]
  },
  bud: {
    position: 'absolute',
    bottom: 110,
    width: 16,
    height: 24,
    backgroundColor: '#ED64A6', // Pink
    borderRadius: 10,
  },
  bloom: {
    position: 'absolute',
    bottom: 110,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  flowerCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
    zIndex: 2,
  },
  petalTop: { position: 'absolute', top: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ED64A6' },
  petalRight: { position: 'absolute', right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ED64A6' },
  petalBottom: { position: 'absolute', bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ED64A6' },
  petalLeft: { position: 'absolute', left: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ED64A6' },
});

