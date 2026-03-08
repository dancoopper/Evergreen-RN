import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, FlatList, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';
import TreeRoom from '../components/TreeRoom';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Trunk1 from '../assets/trunk1.png';
import Trunk2 from '../assets/trunk2.png';
import RootPNG from '../assets/root.png';
import Stair from '../assets/stair.svg'

export default function WorldScreen() {

  const growthLevel = useStore(state => state.growthLevel);
  const isFocused = useIsFocused();

  const TOTAL_ROOMS = 4;
  const TASKS_PER_ROOM = 4;

  // Calculate which room is active based on completed tasks
  const currentActiveRoomIndex = Math.min(Math.floor(growthLevel / TASKS_PER_ROOM), TOTAL_ROOMS - 1);

  // The decoration level of the currently active room
  const activeRoomDecorationLevel = growthLevel >= TOTAL_ROOMS * TASKS_PER_ROOM
    ? 4
    : growthLevel % TASKS_PER_ROOM;

  // Environment animations based on current active room growth
  const skyColorAnim = useRef(new Animated.Value(activeRoomDecorationLevel)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.timing(skyColorAnim, {
        toValue: activeRoomDecorationLevel,
        duration: 800,
        useNativeDriver: false, // Colors can't use native driver
      }).start();
    }
  }, [activeRoomDecorationLevel, isFocused]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: Math.max(0, TOTAL_ROOMS - 1 - currentActiveRoomIndex),
          animated: true,
          viewPosition: 0.5,
        });
      }, 300); // small delay to allow list initialization
    }
  }, [currentActiveRoomIndex, isFocused]);

  // Interpolate Sky Color for the background based on today's tasks
  const skyColor = skyColorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      '#0F1A2E', // Deep Night
      '#1A2744', // Dawn
      '#1E3A5F', // Morning Blue
      '#2B5F8A', // Daytime Blue
      '#3B82A0'  // Bright Sky
    ],
    extrapolate: 'clamp'
  });

  // --- Firefly Component ---
  const Firefly = ({ delay }: { delay: number }) => {
    const anim = useRef(new Animated.Value(0)).current;
    // Pre-calculate random positions so each firefly holds its spot
    const topPos = useRef(Math.random() * Dimensions.get('window').height).current;
    const leftPos = useRef(Math.random() * Dimensions.get('window').width).current;
    const size = useRef(Math.random() * 4 + 2).current; // 2 to 6px

    useEffect(() => {
      // Create a slow pulse animation
      const pulse = Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: Math.random() * 2000 + 1500, // 1.5s to 3.5s
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: Math.random() * 2000 + 1500,
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
      outputRange: [0, 0.8]
    });

    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20] // Slight drift upwards
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
          backgroundColor: '#FDE047', // Yellow-400
          opacity: opacity,
          transform: [{ translateY }],
          shadowColor: '#FEF08A',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 6,
          elevation: 4,
          zIndex: 1
        }}
        pointerEvents="none"
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={[styles.container, { backgroundColor: skyColor }]}>

        {/* Render 30 Fireflies in the background */}
        {Array.from({ length: 30 }).map((_, i) => (
          <Firefly key={`firefly-${i}`} delay={Math.random() * 2000} />
        ))}

        {/* Horizontal Gradient Overlay to make the center darker than the sides */}
        <LinearGradient
          colors={['#010727ff', '#011927', '#011927', '#010727ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Header Overlay (Pinned to top) */}
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: '#FFF' }]}>Your Treehouse!</Text>
          <Text style={[styles.subtitle, { color: '#CBD5E0' }]}>
            {activeRoomDecorationLevel === 0 && "Your room is quiet. Take a gentle step."}
            {activeRoomDecorationLevel === 1 && "It feels a bit cozier."}
            {activeRoomDecorationLevel === 2 && "Settling in."}
            {activeRoomDecorationLevel === 3 && "Adding some life."}
            {activeRoomDecorationLevel === 4 && "Your sanctuary is glowing."}
          </Text>
        </View>

        {/* Scrollable Tree Container mapped as a FlatList */}
        <FlatList
          data={Array.from({ length: TOTAL_ROOMS }).map((_, i) => i)} // 0 is bottom-most room due to inverted
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          inverted={true}
          renderItem={({ item: roomIndex }) => {
            const isLocked = roomIndex > currentActiveRoomIndex;
            const isCurrentlyActive = roomIndex === currentActiveRoomIndex;
            const decorationLevel = isCurrentlyActive ? growthLevel : (isLocked ? 0 : 4);
            const isTrunk1 = roomIndex % 2 === 0;
            const isOddRoom = roomIndex % 2 !== 0;

            return (
              <View style={styles.roomSection}>

                {/* SVG Trunk background */}
                <View style={styles.trunkContainer}>
                  {isTrunk1 ?
                    <Image source={Trunk1} style={{ width: 413, height: 181, resizeMode: 'cover' }} /> :
                    <Image source={Trunk2} style={{ width: 413, height: 231, resizeMode: 'cover' }} />
                  }
                </View>

                {/* Centered Room */}
                <View style={[styles.roomAbsolute, isOddRoom && styles.roomOdd]}>


                  <TreeRoom
                    isLocked={isLocked}
                    decorationLevel={decorationLevel}
                  />
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            // ListHeaderComponent appears at the bottom due to inverted={true}
            <View style={styles.rootContainer}>
              <Image source={RootPNG} style={{ width: 413, height: 177, resizeMode: 'cover' }} />
            </View>
          }
        />

        {/* Ground rendered fixed at the bottom over the list */}
        {/* <View style={styles.ground} /> */}

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1A2E',
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
    paddingBottom: 50, // Space so tree sits above the ground
  },
  roomSection: {
    alignItems: 'center',
    overflow: 'visible',
    justifyContent: 'center',
    position: 'relative',
  },
  trunkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  roomAbsolute: {
    position: 'absolute',
    zIndex: 2,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    transform: [{ translateX: 40 }],

  },
  roomOdd: {
    marginLeft: 60,
    transform: [{ scaleX: -1 }, { translateX: 50 }],

  },
  rootContainer: {
    alignItems: 'center',
    overflow: 'visible',
    // marginTop: -25, // overlap with the first trunk
    // marginBottom: -10,
    zIndex: 0,
  },
  ground: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#48BB78',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
    zIndex: 2,
  },
});
