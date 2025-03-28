import React, { useState, useEffect, useRef } from 'react';
import {Image as RNImage, View, Text, StyleSheet, Animated, ActivityIndicator} from 'react-native';
import Svg, { Circle, ClipPath, Defs, Path, Image, Line, LinearGradient, Stop} from 'react-native-svg';
import { Audio } from 'expo-av'; // Add this import at the top

const VehicleIcon = (VehiclesIcon) => {
  const icons = {
    bus: require('../assets/icons/bus.png'),
    car: require('../assets/icons/car.png'),
    cyclist: require('../assets/icons/cylist.png'),
    jeep: require('../assets/icons/jeep.png'),
    motor: require('../assets/icons/motor.png'),
    tricycle: require('../assets/icons/tricycle.png'),
    truck: require('../assets/icons/truck.png'),
 };
  return icons[VehiclesIcon.toLowerCase()] || require('../assets/icons/user.png');
};

const getVehicleSize = (vehicleType) => {
  const sizes = {
    bus: { width: 20, height: 20 },
    car: { width: 10, height: 10 },
    cyclist: { width: 8, height: 8 },
    jeep: { width: 15, height: 15 },
    motor: { width: 10, height: 10 },
    tricycle: { width: 12, height: 12 },
    truck: { width: 25, height: 25 },
  };
  return sizes[vehicleType.toLowerCase()] || { width: 10, height: 10 }; // Default size if vehicle type isn't found
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
            <Stop offset="20%" stopColor="red" stopOpacity="0.3" />
            <Stop offset="40%" stopColor="yellow" stopOpacity="0.3" />
            <Stop offset="70%" stopColor="green" stopOpacity="0.3" />
          </LinearGradient>

          <LinearGradient id="radarGradientOutline" x1="0" y1="0" x2="0" y2={heightOfRadar} gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="red" />
            <Stop offset="100%" stopColor="green" />
          </LinearGradient>

          <ClipPath id="radarClip">
            <Path d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z `} />
          </ClipPath>
        </Defs>
        <Path id="mainradar" d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z`} fill="url(#radarGradient)" strokeWidth="0.2" />
 
        {/* Circle stretching from Origin 0,0*/}
        {[3, 6, 9, 12, 15, 18, 21, 23, 26, 28].map((radius, index) => (
          <Circle key={index} cx="0" cy="0" r={radius}   
            stroke="url(#radarGradientOutline)"
            strokeWidth="0.1" 
            fill="none" clipPath="url(#radarClip)" />
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
              stroke="url(#radarGradientOutline)"
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

      {coordinates.map((vehicle, index) => {
        const vehicleSize = getVehicleSize(vehicle.object_class); 

        return (
          <Image
            key={index}
            href={VehicleIcon(vehicle.object_class)}
            // Adjust x and y positions based on the vehicle size for proper centering
            x={normalizePosition(vehicle.x) - vehicleSize.width / 2}
            y={normalizePosition(vehicle.y) - vehicleSize.height / 2}
            width={vehicleSize.width}
            height={vehicleSize.height}
            clipPath="url(#radarClip)"
          />
        );
      })}
      </Svg>
    </View>
  );
};

// =============== DEVICE IP ADDRESS ===============//
const AC_IP = 'http://localhost:3000/api/data';     //
// =================================================//


// ===== FETCH DATA FROM SERVER ==========

const fetchDataFromServer = async ()  => {
    try {
      const response = await fetch(AC_IP);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json(); 
      return data;
    } catch (err) {
        throw err;
    }
};
// =======================================

export default function AlertCycle() {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setData] = useState([]);
  const [overallRisk, setOverallRisk] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [sounds, setSounds] = useState({});
  const [hasPlayed, setHasPlayed] = useState(false); // To prevent replay

  // Loading sounds asynchronously
  useEffect(() => {
    const loadSounds = async () => {
      const highrisk = await Audio.Sound.createAsync(require('../assets/beep/risky_beep.mp3'));
      const warning = await Audio.Sound.createAsync(require('../assets/beep/warning.mp3'));
      setSounds({ highrisk, warning });
    };
    loadSounds();
  }, []);

  const setSystemVolume = async (level) => {
    await Audio.setVolumeAsync(level);
  };

  const road_background = require("../assets/ui-components/road-background.jpg");

  // Fetching data process
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const result = await fetchDataFromServer();  
        console.log(result);
        setData(result);
        setError(null);                    
      } catch (err) {
        setError('Error fetching data');  
      } finally {
        setLoading(false);               
      }
    };
    getData(); // Fetch data immediately on component mount
    const interval = setInterval(getData, 250);
    return () => clearInterval(interval);
  }, []);

  // Checking risk level based on coordinates
  useEffect(() => {
    const checkRisk = () => {
      if (coordinates.some(item => item.risk === 'high')) {
        setOverallRisk('high');
      } else if (coordinates.some(item => item.risk === 'hazardous')) {
        setOverallRisk('hazardous');
      } else {
        setOverallRisk('safe');
      }
    };
    checkRisk();
  }, [coordinates]);

  // Play sound when risk level changes, only once per detection
    useEffect(() => {
      const playRiskSound = async () => {
        if (overallRisk === 'high') {
          // Ensure playback happens on the main thread using requestAnimationFrame
          requestAnimationFrame(async () => {
            await sounds.highrisk?.sound?.replayAsync();
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between beeps
          });
        } else if (overallRisk === 'hazardous') {
          // Ensure playback happens on the main thread
          requestAnimationFrame(async () => {
            await sounds.warning?.sound?.replayAsync();
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between beeps
        });
        }
      };
      if (overallRisk === 'safe') {
        setHasPlayed(false); // Reset playback if the area becomes safe
      }
      playRiskSound();
    }, [overallRisk, sounds]);

  // Animation for risk indicator
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

  // Set initial hardcoded data
  useEffect(() => {
    const hardcodedData = [
      { object_class: 'motor', x: 100, y: 0, mDA: 30, risk: "high" },
    ];
    setCoordinates(hardcodedData);
    setLoading(false);
  }, []);
  return (
    <View style={styles.container}>

      <RNImage source={road_background} style={styles.road_background} />
      
      {/* ===== Coordinate View Port ====== */} 
      <View style={styles.CoordinatesViewPort}>
        {result.length > 0 ? (
            result.map((result, index) => (
              <Text key={index} style={styles.coordinateText}>
                Object: {result.object_class}, X: {result.x}, Y: {result.mDA}
              </Text>
            ))
          ) : (
              <Text> No coordinates available </Text>
        )}
      </View>
      {/* ================================ */} 
      
      {/* ===== Animated Risk Indicator ====== */} 
      <View style={styles.RiskViewPort}>
        <Animated.View
          style={[
            styles.riskIndicator,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor:
                overallRisk === 'high'
                  ? 'rgba(255, 0, 0, 0.7)' // High Risk: Red
                  : overallRisk === 'hazardous'
                  ? 'rgba(255, 255, 0, 0.7)' // Hazardous: Yellow
                  : 'rgba(0, 255, 0, 0.3)', // Safe: Green
            },
          ]}
        >
          <Text style={styles.riskText}>
            {overallRisk === 'high'
              ? 'HIGH RISK DISTANCE!!'
              : overallRisk === 'hazardous'
              ? 'HAZARDOUS DISTANCE'
              : 'SAFE DISTANCE'}
          </Text>
        </Animated.View>
      </View>
      {/* =================================== */} 

      {/* ======= Radar Component====== */} 
      <Radar coordinates={coordinates}/>
      {/* ====================== */} 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: "100%",
    position: 'relative',  // Ensure the container has relative positioning
  },
  road_background: {
    position: 'absolute', // Positioning the background behind other elements
    width: '100%',
    height: '100%',
    resizeMode: 'stretch', // Ensures the image covers the full area without distorting
    zIndex: -1,
  },
  CoordinatesViewPort: {
    padding: 10,
  },
  coordinateText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 5,
  },
  RiskViewPort: {
    position: 'absolute', // Positioning the background behind other elements
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    width: "100%",
    height: "10%",
    top: 30,
    justifyContent: 'center',
  },
  radarContainer: {
    width: "100%",
    height: "100%",
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

});
