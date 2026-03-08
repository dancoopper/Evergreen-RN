import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Room0 from '../assets/room0.png';
import Room1 from '../assets/room1.png';
import Room2 from '../assets/room2.png';
import LockedRoom from '../assets/locked_room.png';

interface TreeRoomProps {
  isLocked: boolean;
  decorationLevel: number; // 0 to 4
}

// A simple floating firefly component for the final decoration levels
const RoomFirefly = ({ delay, left, top }: { delay: number; left: `${number}%`; top: `${number}%` }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: 1500, useNativeDriver: true }),
        ])
      ),
    ]);
    pulse.start();
    return () => pulse.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  return (
    <Animated.View
      style={[
        styles.firefly,
        { left, top, opacity: anim, transform: [{ translateY }] as any }
      ]}
    />
  );
};

export default function TreeRoom({ isLocked, decorationLevel }: TreeRoomProps) {
  const isFocused = useIsFocused();
  const decorAnim = useRef(new Animated.Value(isLocked ? 0 : decorationLevel)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.timing(decorAnim, {
        toValue: isLocked ? 0 : decorationLevel,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [decorationLevel, isLocked, isFocused]);

  const getRoomSvg = () => {
    if (isLocked) {
      return <Image source={LockedRoom} style={styles.roomImage} />;
    }

    // Determine the base image (0, 1, or 2)
    let baseImage = Room2;
    if (decorationLevel === 0) baseImage = Room0;
    else if (decorationLevel === 1) baseImage = Room1;

    return (
      <View style={styles.roomInnerContainer}>
        <Image source={baseImage} style={styles.roomImage} />
        
        {/* Level 3: Add a warm window glow overlay */}
        {decorationLevel >= 3 && (
          <Animated.View style={styles.warmGlow} />
        )}

        {/* Level 4: Add floating magical fireflies around the room */}
        {decorationLevel >= 4 && (
          <>
            <RoomFirefly delay={0} left="20%" top="30%" />
            <RoomFirefly delay={800} left="75%" top="40%" />
            <RoomFirefly delay={400} left="50%" top="10%" />
            <RoomFirefly delay={1200} left="85%" top="70%" />
            <RoomFirefly delay={1600} left="15%" top="60%" />
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.roomWrapper}>
      <Animated.View style={[styles.svgContainer, { opacity: 1 }]}>
        {getRoomSvg()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  roomWrapper: {
    width: 220,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInnerContainer: {
    width: '75%',
    height: '100%',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  warmGlow: {
    position: 'absolute',
    top: '35%',
    left: '20%',
    width: '60%',
    height: '40%',
    backgroundColor: '#FDE047',
    borderRadius: 50,
    opacity: 0.15,
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  firefly: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FEF08A',
    shadowColor: '#FEF08A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  }
});
