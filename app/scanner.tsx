import React, {memo, useState, useEffect, useRef } from 'react';
import {Image as RNImage, View, Text, StyleSheet, Animated, ActivityIndicator} from 'react-native';
import Svg, { G, Circle, ClipPath, Defs, Path, Image, Line, LinearGradient, Stop} from 'react-native-svg';

/**
 * Returns the appropriate vehicle icon based on the vehicle type
 * @param {string} VehiclesIcon - The type of vehicle (e.g., 'bus', 'car', 'motor')
 * @returns {ImageSource} - The corresponding image source for the vehicle icon
 */
const VehicleIcon = (VehiclesIcon) => {
  const icons = {
    bus: require('../assets/icons/bus.png'),
    car: require('../assets/icons/car.png'),
    cyclist: require('../assets/icons/cylist.png'),
    jeep: require('../assets/icons/jeep.png'),
    motor: require('../assets/icons/motor.png'),
    tricycle: require('../assets/icons/tricycle.png'),
    truck: require('../assets/icons/truck.png'),
    none: require('../assets/icons/none.png'),
 };
  return icons[VehiclesIcon.toLowerCase()] || require('../assets/icons/none.png');
};

/**
 * Returns the display size for a given vehicle type
 * @param {string} vehicleType - The type of vehicle (e.g., 'bus', 'car', 'motor')
 * @returns {Object} - An object containing width and height properties
 */
const getVehicleSize = (vehicleType) => {
  const sizes = {
    motor: { width: 10, height: 10},
    bus: { width: 15, height: 15},
    car: { width: 10, height: 10},
    cyclist: { width: 8, height: 8 },
    jeep: { width: 15, height: 15 },
    tricycle: { width: 10, height: 10},
    truck: { width: 20, height: 20},
    none: { width: 20, height: 20},
  };
  return sizes[vehicleType.toLowerCase()] || { width: 10, height: 10 }; // Default size if vehicle type isn't found
};

const heightOfRadar = 30;
const userIcon = require("../assets/icons/user.png");

/**
 * Main Radar component that displays vehicle positions on a radar visualization
 * @param {Object} props - Component props
 * @param {Array} props.coordinates - Array of vehicle coordinate objects
 */
const Radar = ({ coordinates }) => {
  /**
   * Normalizes Y position to fit within radar bounds
   * @param {number} value - Raw Y coordinate value
   * @returns {number} - Normalized Y position
   */
  const normalizeYpos = (value) => {
    const clampedY = Math.max(0, Math.min(value, 370));
    return (clampedY / 700) * 30;
  };

  /**
   * Normalizes X position to fit within radar bounds
   * @param {number} value - Raw X coordinate value
   * @returns {number} - Normalized X position
   */
  const normalizeXpos = (value) => {
    const clampedX = Math.max(0, Math.min(value, 600));
    return ((clampedX - 300) / 300) * 10;
  };

  return (
    <View style={styles.radarContainer}>
      <Svg
      style={styles.radarContainer}
        viewBox="-10 0 20 20"
        width="360"
        height="800"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
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
            <Path d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z`} />
          </ClipPath>
          <ClipPath id="vehicleClip">
            <Path d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z`} />
          </ClipPath>
        </Defs>

        {/* === Background Base === */}
        <Path
          d={`M 0 0 L -10 5 L -10 ${heightOfRadar} H 10 V 5 Z`}
          fill="url(#radarGradient)"
          strokeWidth="0.2"
        />

        {/* === Background Rings and Lines === */}
        <G clipPath="url(#radarClip)">
          {[3, 6, 9, 12, 15, 18, 21, 23, 26, 28].map((radius, index) => (
            <Circle
              key={index}
              cx="0"
              cy="0"
              r={radius}
              stroke="url(#radarGradientOutline)"
              strokeWidth="0.1"
              fill="none"
            />
          ))}
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
              />
            );
          })}
        </G>

        {/* === Vehicle Icons (Dynamic) === */}
        <G clipPath="url(#vehicleClip)">
          {coordinates.map((vehicle, index) => {
            const vehicleSize = getVehicleSize(vehicle.object_class);
            return (
              <Image
                style={styles.spawn}
                key={index}
                href={VehicleIcon(vehicle.object_class)}
                x={normalizeXpos(vehicle.x) - vehicleSize.width / 2}
                y={normalizeYpos(vehicle.y)}
                width={vehicleSize.width}
                height={vehicleSize.height}
              />
            );
          })}
        </G>

      {/* === User Icon === */}
        <Image
          href={userIcon}
          x="-4"
          y="-6"
          width="8"
          height="8"
          preserveAspectRatio="xMidYMid slice"
        />
      </Svg>
    </View>
  );
};
// // =============== device ip address ===============//
// const AC_IP = 'http://10.0.0.34:3000/api/data';     //
// // =================================================//

// =============== device ip address ===============//
const AC_IP = 'http://192.168.137.1:3000/api/data';     //
// =================================================//

// ===== FETCH DATA FROM SERVER ==========
//Data Format:
//--------------------------------------------
// detected_objects.append({
//     "object_class": object_class,
//     "x": center_x,
//     "y": center_y,
//     "mDA": average_depth,
//     "hazard_level": hazard_level, 
//     "realWorldDistance": realMetric,
// })
//--------------------------------------------

/**
 * Fetches vehicle data from the server
 * @returns {Promise<Array>} - Array of vehicle data objects
 * @throws {Error} - When the fetch operation fails
 */
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

/**
 * Main AlertCycle component that manages the radar display and risk assessment
 */
export default function AlertCycle() {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setData] = useState([]);
  const [overallRisk, setOverallRisk] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [nearestVehicle, setNearestVehicle] = useState(null);

  const road_background = require("../assets/ui-components/road-background.jpg");

//--------------------------------------------
// detected_objects.append({
//     "object_class": object_class,
//     "x": center_x,
//     "y": center_y,
//     "mDA": average_depth,
//     "hazard_level": hazard_level, 
//     "realWorldDistance": realMetric,
// })
//--------------------------------------------

/**
 * Maps mean depth average (mDA) to Y coordinate on the radar display
 * @param {number} mda - The mean depth average value
 * @returns {number} - The corresponding Y position on the radar
 */
function mapMDAToY(mda: number): number {
  const MIN_MDA = 85;
  const MAX_MDA = 180;
  const clampedMDA = Math.max(Math.min(mda, MAX_MDA), MIN_MDA); // Clamp to range
  return ((MAX_MDA - clampedMDA) / (MAX_MDA - MIN_MDA)) * 500;
}

useEffect(() => {
  const getData = async () => {
    try {
      setLoading(true);
      const result = await fetchDataFromServer();

      // Filter out default/invalid data (data with object_class of 'none')
      const validData = result.filter(item => item.object_class !== 'none');

      // If there's no valid data, clear coordinates and return early
      if (validData.length === 0) {
        setCoordinates([]);
        setData([]);
        return;
      }

      // Transform valid data to coordinate format
      const formattedCoordinates = validData.map(item => ({
        object_class: item.object_class,
        x: item.x, // Adjust x mapping if needed
        // Use the new mapMADToY function to determine y based on mAD
        y: mapMDAToY(item.mDA),
        mDA: item.mDA,
        hazard_level: item.hazard_level,
      }));
      setData(validData);
      setCoordinates(formattedCoordinates);
      setError(null);
      console.log(`data: ${JSON.stringify(formattedCoordinates)}`);
    } catch (err) {
      setLoading(true);
      setError('Error fetching data');
      console.log(`error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  getData();
  const interval = setInterval(getData, 100);
  return () => clearInterval(interval);
}, []);

    // Checking risk level based on coordinates
    useEffect(() => {
      const checkRiskAndNearestVehicle = () => {
        // Check risk level
        if (coordinates.some(item => item.hazard_level === 'high')) {
          setOverallRisk('high');
        } else if (coordinates.some(item => item.hazard_level === 'hazardous')) {
          setOverallRisk('hazardous');
        } else {
          setOverallRisk('safe');
        }

        // Find the nearest vehicle
        const nearest = findNearestVehicle(coordinates);
        setNearestVehicle(nearest);
      };

      checkRiskAndNearestVehicle();
    }, [coordinates]);

    /**
     * Calculates the distance between two points
     * @param {number} x1 - First point's X coordinate
     * @param {number} y1 - First point's Y coordinate
     * @param {number} x2 - Second point's X coordinate
     * @param {number} y2 - Second point's Y coordinate
     * @returns {number} - The calculated distance
     */
    const calculateDistance = (x1, y1, x2, y2) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    /**
     * Finds the nearest vehicle to the user's position
     * @param {Array} coordinates - Array of vehicle coordinates
     * @param {number} userX - User's X position (default 0)
     * @param {number} userY - User's Y position (default 0)
     * @returns {Object|null} - The nearest vehicle object or null if no vehicles
     */
    const findNearestVehicle = (coordinates, userX = 0, userY = 0) => {
      if (coordinates.length === 0) return null;

      let nearestVehicle = coordinates[0];
      let minDistance = calculateDistance(userX, userY, nearestVehicle.x, nearestVehicle.y);

      coordinates.forEach((vehicle) => {
        const distance = calculateDistance(userX, userY, vehicle.x, vehicle.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestVehicle = vehicle;
        }
      });

      return nearestVehicle;
    };

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

  useEffect(() => {
  console.log(`Coordinates to plot:`, coordinates);
}, [coordinates]);
  return (
    <View style={styles.container}>

    <RNImage source={road_background} style={styles.road_background} />
 
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
    
    {
      <Text style={styles.riskText}>
        Vehicle: {nearestVehicle ? nearestVehicle.object_class.toUpperCase() : "NONE"}
     </Text>
    }
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
    position: 'relative',  
  },
  road_background: {
    position: "absolute", 
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
    zIndex: -1,
  },
  CoordinatesViewPort: {
    padding: 10,
    zIndex: 2,
  },
  coordinateText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 5,
  },
  RiskViewPort: {
    position: 'absolute', 
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    width: "100%",
    height: "10%",
    top: 30,
    justifyContent: 'center',
  },
  radarContainer: {
    position: 'absolute', 
    height: "100%",
    width: "100%",
    overflow: 'hidden',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  spawn: {
    position: "relative",
    zIndex: 2,
    overflow: 'hidden',
    border: "5px solid white",
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
});
