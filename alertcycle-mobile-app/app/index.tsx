import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Button} from 'react-native';
import Svg, { Circle, ClipPath, Defs, Path, Image, Line, LinearGradient, Stop} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';

const VehicleIcon = (VehiclesIcon) => {
  const icons = {
    bus: require('../assets/icons/bus.png'),
    car: require('../assets/icons/car.png'),
    cyclist: require('../assets/icons/cylist.png'),
    ecar: require('../assets/icons/e-car.png'),
    jeep: require('../assets/icons/jeep.png'),
    motor: require('../assets/icons/motor.png'),
    pedicab: require('../assets/icons/pedicab.png'),
    tricycle: require('../assets/icons/tricycle.png'),
    truck: require('../assets/icons/truck.png'),
  };
  return icons[VehiclesIcon.toLowerCase()] || require('../assets/icons/user.png');
};

const Radar = ({ coordinates }) => {

  const heightOfRadar = 30;
  const userIcon = require("../assets/icons/user.png"); // ✅ Import PNG
  
  // Normalize function to fit coordinates in radar view (assuming width is 600px in Python)
  const normalizePosition = (value) => (value / 600) * 28; // Scale to SVG range

  return (
    <View style={styles.radarContainer}>
      <Svg width="100%" height="100%" viewBox="-10 -0 20 20" preserveAspectRatio="xMidYMid meet">
        {/* Definitions Section */}
        <Defs>
          {/* Gradient from Green to Red */}
          <LinearGradient id="radarGradient" x1="0" y1="0" x2="0" y2={heightOfRadar} gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="green" />
            <Stop offset="100%" stopColor="red" />
          </LinearGradient>

          <ClipPath id="radarClip">
            <Path d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z `} />
          </ClipPath>
        </Defs>
        <Path id="mainradar" d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z`} fill="url(#radarGradient)" stroke="green" strokeWidth="0.2" />
 
        {/* Circle stretching from Origin 0,0*/}
        {[3, 6, 9, 12, 15, 18, 21, 23, 26, 28].map((radius, index) => (
          <Circle key={index} cx="0" cy="0" r={radius} stroke="green" strokeWidth="0.1" fill="none" clipPath="url(#radarClip)" />
        ))}
        {/* Radial Lines */}
        {[...Array(20)].map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          return (
            <Line
              key={i}
              x1="0"
              y1="0"
              x2={Math.cos(angle) * 28}
              y2={Math.sin(angle) * 28}
              stroke="green"
              strokeWidth="0.1"
              clipPath="url(#radarClip)"
            />
          );
        })}

        {/* 🔥 PNG Rendered at the Origin (Centered) */}
        <Image
          href={userIcon} // ✅ Correct image source
          x="-5"  // ✅ Centering by adjusting position
          y="-5"
          width="10" // ✅ Adjusted size
          height="10"
          preserveAspectRatio="xMidYMid slice"
        />

       {/* Plot Vehicles Behind User */}
        {coordinates.map((vehicle, index) => (
          <Image
            key={index}
            href={VehicleIcon(vehicle.object_class)}
            x={normalizePosition(vehicle.x) - 3} // Adjust to center icon
            y={normalizePosition(vehicle.y) + 5} // Shift vehicles down
            width="6"
            height="6"
            clipPath="url(#radarClip)"
          />
        ))}
      </Svg>
    </View>
  );
};

export default function AlertCycle() {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallRisk, setOverallRisk] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  useEffect(() => {
    const hasHighRisk = coordinates.some(item => item.risk);
    setOverallRisk(hasHighRisk);
  }, [coordinates]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [overallRisk]);

  useEffect(() => {
    const hardcodedData = [
      { object_class: 'bus', x: -100, y: 100, mDA: 20, risk: true},
      { object_class: 'truck', x: 0, y: 0, mDA: 30, risk: false },
      { object_class: 'cyclist', x: 100, y: 0, mDA: 30, risk: false },
      { object_class: 'motor', x: -100 ,y: 300, mDA: 30, risk: false },
    ];
    setCoordinates(hardcodedData);
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
     
      {/* ===== Animated Risk Indicator ====== */} 
      <View style={styles.RiskViewPort}>
        <Animated.View style={[styles.riskIndicator, { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: overallRisk ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)'
        }]}>
          <Text style={styles.riskText}>
            {overallRisk ? 'HIGH RISK!' : 'SAFE'}
          </Text>
        </Animated.View>
        <Button style={styles.button_dashboard} title = "Dahsboard" onPress={() => navigation.navigate('about')}/>
      </View>
      {/* ====================== */} 

  
      {/* ======= Radar Component====== */} 
      <Radar coordinates={coordinates}/>
      {/* ====================== */} 
  

      {/* ======= Cars Coordinates ====== */} 
      <View style={styles.CoordinatesViewPort}>
  
      </View>
      {/* ====================== */} 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    width: "100%",
    height: "100%",
    // borderWidth: 2,
    // borderColor: 'white',
  },
  RiskViewPort: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    width: "100%",
    height: "10%",
    // borderWidth: 2,
    // borderColor: 'white',
    justifyContent: 'center',
  },
  radarContainer: {
    width: "100%",
    height: "90%",
    padding: 0,
    // borderWidth: 2,
    // borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskIndicator: {
    top:0,
    padding: 10,
    width: '100%',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: 'white',
  },
  riskText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  userIcon: {
    color: 'white',
    width: 100,
    height: 100,
  },
  button_dashboard: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },

});
