import React from 'react';

import {SafeAreaView, Pressable, Image, StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';

import { useNavigation } from '@react-navigation/native';


const blue_main_logo  = require("../assets/main-logo/ac-logo-black.png");

const bike_transparent = require("../assets/ui-components/bicycle-transparent.png");


export default function AlertCycle() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={bike_transparent} style={styles.backgroundImage} />

      {/* Foreground Content */}
      <Image source={blue_main_logo} style={styles.image} />
      <TouchableOpacity 
          style={styles.connect_btn}
          onPress={() => navigation.navigate('bridge')}>
          <Text style={styles.buttonText}>
            Start
          </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backgroundImage: {
    position: 'absolute', // Positioning the background behind other elements
    top: 180,
    left: -350,
    width: '240%',
    height: '100%',
    resizeMode: 'stretch', // Ensures the image covers the full area without distorting
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 300,
    bottom: 70,
  },
  connect_btn: {
    bottom: 0,
    borderRadius: 20,
    padding: 10,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#1373EC",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 20,
    color: 'white',
  },
});
