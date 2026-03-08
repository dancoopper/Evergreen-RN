import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Room0 from '../assets/room0.png';
import Room1 from '../assets/room1.png';
import Room2 from '../assets/room2.png';
import Stair from '../assets/stair.svg'
import LockedRoom from '../assets/locked_room.png';
import { Image } from 'react-native';

interface TreeRoomProps {
  isLocked: boolean;
  decorationLevel: number; // 0 to 4
}

export default function TreeRoom({ isLocked, decorationLevel }: TreeRoomProps) {
  const isFocused = useIsFocused();

  // We use an animated value to fade in new decorations smoothly
  // Initialize to current state so it doesn't animate from 0 on fresh app load
  const decorAnim = useRef(new Animated.Value(isLocked ? 0 : decorationLevel)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.timing(decorAnim, {
        toValue: isLocked ? 0 : decorationLevel,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [decorationLevel, isLocked, isFocused]);

  const getRoomSvg = () => {
    if (isLocked) {
      return <Image source={LockedRoom} style={{ width: '75%', height: '100%' }} />;
    }

    // Fallbacks for intermediate growth levels (3 and 4) since we only have 3 assets
    let state = decorationLevel;
    if (state > 2) state = 2;

    switch (state) {
      case 0:
        return <Image source={Room0} style={{ width: '75%', height: '100%' }} />;
      case 1:
        return <Image source={Room1} style={{ width: '75%', height: '100%' }} />;
      case 2:
      default:
        return <Image source={Room2} style={{ width: '75%', height: '100%' }} />;
    }
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
  addOnContainer: {
    position: 'absolute',
    overflow: 'visible',
    right: -40,
    bottom: 20,
    zIndex: 5,
  }
});
