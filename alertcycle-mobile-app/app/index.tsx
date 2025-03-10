import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Path, Image as SvgImage, Line } from 'react-native-svg';

const getObjectIcon = (objectClass) => {
  const icons = {
    bus: require('../assets/icons/bus.png'),
    car: require('../assets/icons/car.png'),
    cylist: require('../assets/icons/cylist.png'),
    ecar: require('../assets/icons/e-car.png'),
    jeep: require('../assets/icons/jeep.png'),
    motor: require('../assets/icons/motor.png'),
    pedicab: require('../assets/icons/pedicab.png'),
    tricycle: require('../assets/icons/tricycle.png'),
    truck: require('../assets/icons/truck.png'),
  };
  return icons[objectClass.toLowerCase()] || require('../assets/icons/user.png');
};

const Radar = () => {
  return (
    <View style={styles.radarContainer}>
      <Svg width="100%" height="100%" viewBox="-10 -0 20 20">
        <Defs>
          <ClipPath id="radarClip">
            <Path d="M 0 0 L -10 5 A 1 20 0 0 0 10 5 Z" />
          </ClipPath>
        </Defs>
        <Path id="mainradar" d="M 0 0 L -10 5 A 1 20 0 0 0 10 5 Z" fill="lime" stroke="green" strokeWidth="0.2" />
 
        {/* Circle stretching from Origin 0,0*/}
        <Circle cx="0" cy="0" r="3" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        <Circle cx="0" cy="0" r="6" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        <Circle cx="0" cy="0" r="9" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        <Circle cx="0" cy="0" r="12" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        <Circle cx="0" cy="0" r="15" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        <Circle cx="0" cy="0" r="18" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        <Circle cx="0" cy="0" r="21" stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
 

        {/* Negative X quadrant lines */}
        <Line x1="0" y1="0" x2="0" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-5" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-10" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-15" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-20" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-25" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-30" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="-35" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        
        {/* Positive X quadrant lines */}
        <Line x1="0" y1="0" x2="5" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="10" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="15" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="20" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="25" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="30" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
        <Line x1="0" y1="0" x2="35" y2="100%" stroke="green" strokeWidth="0.1" clipPath="url(#radarClip)" />
      </Svg>
    </View>
  );
};

export default function AlertCycle() {
  return (
    <View style={styles.container}>
      <Radar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: 'white',
  },
  radarContainer: {
    borderWidth: 2,
    width: "90%",
    height: "50%",
    padding: 0,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
