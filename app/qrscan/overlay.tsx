import React from 'react';
import { View, Dimensions, StyleSheet, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const innerDimension = 300;

export default function Overlay(){
  return (
    <View style={styles.container}>
      <View style={styles.outer} />
      <View style={styles.inner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // black with 50% opacity
    justifyContent: 'center', // center vertically
    alignItems: 'center',    // center horizontally
  },
  outer: {
    width: width,
    height: height,
    backgroundColor: 'transparent', // outer transparent part
  },
  inner: {
    width: innerDimension,
    height: innerDimension,
    backgroundColor: 'white', // inner white part
    borderRadius: 50,         // 50px border radius for rounded corners
  },
});

