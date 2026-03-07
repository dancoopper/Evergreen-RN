import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';
import TreeRoom from '../components/TreeRoom';
import { useIsFocused } from '@react-navigation/native';

export default function WorldScreen() {
  const growthLevel = useStore(state => state.growthLevel); // 0 to 4
  const isFocused = useIsFocused();

  // Environment animations based on current room growth
  const skyColorAnim = useRef(new Animated.Value(growthLevel)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.timing(skyColorAnim, {
        toValue: growthLevel,
        duration: 800,
        useNativeDriver: false, // Colors can't use native driver
      }).start();
    }
  }, [growthLevel, isFocused]);

  // Interpolate Sky Color for the background based on today's tasks
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

  // Total Rooms configuration.
  // We can eventually load `unlockedRoomsCount` from the Zustand store.
  // For now, let's hardcode 4 total rooms to show the concept.
  const TOTAL_ROOMS = 4;
  const currentActiveRoomIndex = 0; // The bottom-most room is index 0

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { backgroundColor: skyColor }]}>

        {/* Header Overlay (Pinned to top) */}
        <View style={styles.headerContainer}>
          <Text style={[styles.header, growthLevel < 2 && { color: '#FFF' }]}>Your Treehouse</Text>
          <Text style={[styles.subtitle, growthLevel < 2 && { color: '#CBD5E0' }]}>
            {growthLevel === 0 && "Your room is quiet. Take a gentle step."}
            {growthLevel === 1 && "It feels a bit cozier."}
            {growthLevel === 2 && "Settling in."}
            {growthLevel === 3 && "Adding some life."}
            {growthLevel === 4 && "Your sanctuary is glowing."}
          </Text>
        </View>

        {/* Scrollable Tree Container mapped as a FlatList */}
        <FlatList
          data={Array.from({ length: TOTAL_ROOMS }).map((_, i) => TOTAL_ROOMS - 1 - i)}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: roomIndex }) => {
            const isLocked = roomIndex > currentActiveRoomIndex;
            const isCurrentlyActive = roomIndex === currentActiveRoomIndex;
            const decorationLevel = isCurrentlyActive ? growthLevel : (isLocked ? 0 : 4);

            return (
              <View style={styles.roomSection}>
                {/* Small trunk connector between rooms (except the very top one) */}
                {roomIndex !== TOTAL_ROOMS - 1 && (
                  <View style={[styles.trunkSegment, isLocked && styles.trunkLocked]} />
                )}

                <TreeRoom
                  isLocked={isLocked}
                  decorationLevel={decorationLevel}
                />
              </View>
            );
          }}
          ListFooterComponent={
            <View style={{ alignItems: 'center' }}>
              {/* Base Trunk extending to the ground */}
              <View style={styles.baseTrunk} />
            </View>
          }
        />

        {/* Ground rendered fixed at the bottom over the list */}
        <View style={styles.ground} />

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 24
  },
  container: {
    flex: 1,
    position: 'relative'
  },
  headerContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 150, // Space for header
    paddingBottom: 0,
  },
  roomSection: {
    alignItems: 'center',
  },
  trunkSegment: {
    width: 100,
    height: 40,
    backgroundColor: '#7B341E', // Wood color
    marginVertical: -5,
  },
  trunkLocked: {
    backgroundColor: '#4A5568', // Gray wood
  },
  baseTrunk: {
    width: 120,
    height: 80,
    backgroundColor: '#7B341E',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: -1,
    marginTop: -10, // overlap bottom room slightly
  },
  ground: {
    //position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#48BB78', // Soft grass green
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
    zIndex: 2, // Cover the bottom of the trunk slightly
  },
});

