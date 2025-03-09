import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native';

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

export default function AlertCycle() {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallRisk, setOverallRisk] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const maxCoordinate = 500; // Maximum distance from user
  const radarSize = 300;     // Radar display size

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
    // Coordinates relative to user position (0,0)
    const hardcodedData = [
      { object_class: 'cylist', x: 150, y: -200, mDA: 10, risk: false },
      { object_class: 'truck', x: -100, y: -250, mDA: 8, risk: true },
      { object_class: 'ecar', x: 50, y: -150, mDA: 5, risk: false },
    ];
    setCoordinates(hardcodedData);
    setLoading(false);
  }, []);

  const calculateRadarPosition = (coord, axis) => {
    const center = radarSize / 2;
    const scaleFactor = center / maxCoordinate;
    let scaledCoord = coord * scaleFactor;
    
    // Invert y-axis to match radar display orientation
    if (axis === 'y') scaledCoord = -scaledCoord;
    
    return center + scaledCoord - 15; // 15 is half icon size
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.riskIndicator, { 
        transform: [{ scale: scaleAnim }],
        backgroundColor: overallRisk ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)'
      }]}>
        <Text style={styles.riskText}>
          {overallRisk ? 'HIGH RISK!' : 'SAFE'}
        </Text>
      </Animated.View>

      <View style={styles.radar_interface}>
        <View style={styles.graphCanvas}>
          {/* Semi-circle grid lines */}
          <View style={[styles.gridLine, styles.gridMedium]} />
          <View style={[styles.gridLine, styles.gridSmall]} />
          
          {/* Mask for upper half */}
          <View style={styles.mask} />

          {/* Radar Objects (only show behind user - negative y values) */}
          {coordinates.filter(item => item.y < 0).map((item, index) => (
            <View key={`radar-${index}`} style={[styles.radarObject, {
              left: calculateRadarPosition(item.x, 'x'),
              top: calculateRadarPosition(item.y, 'y'),
            }]}>
              <Image
                style={styles.radarIcon}
                source={getObjectIcon(item.object_class)}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>

        <View style={styles.imageContainer}>
          <Image 
            style={styles.bikeIcon} 
            source={require('../assets/icons/user.png')} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.coordinates}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : coordinates.map((item, index) => (
            <View key={index} style={styles.objectContainer}>
              <Image
                style={styles.objectIcon}
                source={getObjectIcon(item.object_class)}
                resizeMode="contain"
              />
              <Text style={[
                styles.coordinateText,
                item.risk ? styles.highRisk : styles.lowRisk
              ]}>
                {`${item.object_class} | (${item.x}, ${item.y}) | ${item.mDA}m`}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  radar_interface: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  graphCanvas: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    position: 'absolute',
    overflow: 'hidden',
  },
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'black',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
  },
  gridMedium: {
    width: '66%',
    height: '66%',
    top: '34%',
    left: '17%',
  },
  gridSmall: {
    width: '33%',
    height: '33%',
    top: '67%',
    left: '33.5%',
  },
  radarObject: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarIcon: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bikeIcon: {
    width: 60,
    height: 60,
  },
  coordinates: {
    color: 'white',
    fontSize: 18,
    maxWidth: 600,
    textAlign: 'left',
    overflow: 'hidden',
    maxHeight: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginTop: 20,
  },
  highRisk: {
    color: 'red',
    fontWeight: 'bold',
  },
  lowRisk: {
    color: 'green',
    fontWeight: 'bold',
  },
  riskIndicator: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  riskText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 20,
  },
  objectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 5,
  },
  objectIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  coordinateText: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexShrink: 1,
    fontSize: 16,
  },
});
