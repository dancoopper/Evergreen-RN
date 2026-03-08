import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, FlatList, Image } from 'react-native';
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
  const TOTAL_ROOMS = 4;
  const currentActiveRoomIndex = 1; // Room index 0 is bottom, index 1 is active for visual testing

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { backgroundColor: skyColor }]}>

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
    paddingTop: 0, // Padding bottom gives space for the visual header at the top
    paddingBottom: 150,
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

