import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/colors';
import { useIsFocused } from '@react-navigation/native';

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

  // If locked, the whole room is just a silhouette
  const roomBackgroundColor = isLocked ? '#4A5568' : '#D69E2E'; // Dark gray vs warm wood color
  const wallColor = isLocked ? '#2D3748' : '#F6E05E'; // Inner wall
  const floorColor = isLocked ? '#1A202C' : '#975A16'; // Floor wood

  // Interpolations for each level of decoration (Opacities)
  const rugOpacity = decorAnim.interpolate({ inputRange: [0, 1, 4], outputRange: [0, 1, 1], extrapolate: 'clamp' });
  const furnitureOpacity = decorAnim.interpolate({ inputRange: [0, 1.5, 2, 4], outputRange: [0, 0, 1, 1], extrapolate: 'clamp' });
  const plantsOpacity = decorAnim.interpolate({ inputRange: [0, 2.5, 3, 4], outputRange: [0, 0, 1, 1], extrapolate: 'clamp' });
  const lightsOpacity = decorAnim.interpolate({ inputRange: [0, 3.5, 4], outputRange: [0, 0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.roomWrapper}>
      {/* The main wooden frame of the room */}
      <View style={[styles.roomFrame, { backgroundColor: roomBackgroundColor }]}>
        
        {/* Inner Wall */}
        <View style={[styles.innerWall, { backgroundColor: wallColor }]}>
          
          {/* Level 4: String Lights */}
          <Animated.View style={[styles.lightsContainer, { opacity: lightsOpacity }]}>
             <View style={styles.lightBulb} />
             <View style={styles.lightWire} />
             <View style={styles.lightBulb} />
             <View style={styles.lightWire} />
             <View style={styles.lightBulb} />
          </Animated.View>

          {/* Window */}
          <View style={[styles.window, { backgroundColor: isLocked ? '#1A202C' : '#90CDF4' }]}>
            <View style={styles.windowPane} />
            <View style={[styles.windowPane, styles.windowPaneHorizontal]} />
          </View>

          {/* Level 3: Plants / Decor */}
          <Animated.View style={[styles.plantsContainer, { opacity: plantsOpacity }]}>
            <View style={styles.plantPot}>
              <View style={styles.plantLeaf1} />
              <View style={styles.plantLeaf2} />
              <View style={styles.plantLeaf3} />
            </View>
            <View style={styles.bookshelf}>
               <View style={styles.book1} />
               <View style={styles.book2} />
               <View style={styles.book3} />
            </View>
          </Animated.View>

          {/* Level 2: Basic Furniture (Chair/Bed) */}
          <Animated.View style={[styles.furnitureContainer, { opacity: furnitureOpacity }]}>
            {/* A simple cozy chair outline */}
            <View style={styles.chairBack} />
            <View style={styles.chairSeat} />
            <View style={styles.chairLegs} />
          </Animated.View>

        </View>

        {/* Floor */}
        <View style={[styles.floor, { backgroundColor: floorColor }]}>
           {/* Level 1: A cozy rug */}
           <Animated.View style={[styles.rug, { opacity: rugOpacity }]} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  roomWrapper: {
    width: 240,
    height: 180,
    alignItems: 'center',
    marginVertical: -8, // slight overlap
  },
  roomFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#7B341E', // Dark outer bark rim
    overflow: 'hidden',
    position: 'relative',
  },
  innerWall: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  floor: {
    height: 30,
    marginHorizontal: 10,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  window: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#C05621',
    position: 'absolute',
    top: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  windowPane: {
    width: 4,
    height: '100%',
    backgroundColor: '#C05621'
  },
  windowPaneHorizontal: {
    width: '100%',
    height: 4,
    position: 'absolute'
  },
  
  // Decorations
  rug: {
    width: 120,
    height: 10,
    backgroundColor: '#E53E3E', // Deep red rug
    borderRadius: 5,
  },
  
  furnitureContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 60,
    height: 50,
  },
  chairBack: {
    width: 20,
    height: 35,
    backgroundColor: '#3182CE',
    borderRadius: 10,
    position: 'absolute',
    bottom: 15,
    left: 5,
  },
  chairSeat: {
    width: 35,
    height: 15,
    backgroundColor: '#2B6CB0',
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    left: 0,
  },
  chairLegs: {
    width: 30,
    height: 10,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2D3748',
    position: 'absolute',
    bottom: 0,
    left: 2,
  },

  plantsContainer: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 60,
    height: 70,
  },
  plantPot: {
    width: 20,
    height: 15,
    backgroundColor: '#DD6B20',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    position: 'absolute',
    bottom: 0,
    right: 5,
  },
  plantLeaf1: { width: 10, height: 20, backgroundColor: '#38A169', borderRadius: 5, position: 'absolute', bottom: 10, right: 15, transform: [{rotate: '-30deg'}] },
  plantLeaf2: { width: 12, height: 25, backgroundColor: '#2F855A', borderRadius: 6, position: 'absolute', bottom: 12, right: 8 },
  plantLeaf3: { width: 10, height: 18, backgroundColor: '#48BB78', borderRadius: 5, position: 'absolute', bottom: 10, right: 2, transform: [{rotate: '30deg'}] },
  
  bookshelf: {
    width: 30,
    height: 6,
    backgroundColor: '#7B341E',
    position: 'absolute',
    bottom: 40,
    right: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
  },
  book1: { width: 6, height: 12, backgroundColor: '#D69E2E', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  book2: { width: 5, height: 15, backgroundColor: '#E53E3E', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  book3: { width: 5, height: 10, backgroundColor: '#3182CE', borderTopLeftRadius: 2, borderTopRightRadius: 2, transform: [{rotate: '15deg'}] },

  lightsContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  lightWire: {
    width: 30,
    height: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.text,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -10,
  },
  lightBulb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  }
});
