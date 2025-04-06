import React, {memo, useState, useEffect, useRef } from 'react';
import {Image as RNImage, View, Text, StyleSheet, Animated, ActivityIndicator} from 'react-native';
import Svg, { G, Circle, ClipPath, Defs, Path, Image, Line, LinearGradient, Stop} from 'react-native-svg';

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


// Map average depth to the appropriate y coordinate on the radar (y range: 0 to 550)
const MIN_MDA = 85;
const MAX_MDA = 180;

function mapMDAToY(mda: number): number {
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



    // Function to calculate the distance between two points
    const calculateDistance = (x1, y1, x2, y2) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    // Function to find the nearest vehicle
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
  absoluteFill: {
    ...StyleSheet.absoluteFillObject, 
  },
  road_background: {
    position: 'absolute', 
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
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
    position: 'relative',
    height: 700,
    width: "100%",
    position: 'relative',
    overflow: 'hidden',
    top: 0,
    left: 0,
    right: 0,
    left: 0,
  },
  radarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden',
  },
  spawn: {
    position: 'absolute',
    zIndex: 2,
    overflow: 'hidden',
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

