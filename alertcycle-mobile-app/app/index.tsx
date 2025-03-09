import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Image as SvgImage } from 'react-native-svg';

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

var size = 300;

const Radar = ({ coordinates, size}) => {
  const center = size / 2;
  const maxCoordinate = 500;
  const scaleFactor = center / maxCoordinate;
  const gridDistances = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,];
  
  // Size ratios (adjust these to change proportions)
  const userIconSizeRatio = 0.3; // 20% of radar size
  const objectIconSizeRatio = 0.2; // 6% of radar size
  const strokeWidthRatio = 0.007; // 0.7% of radar size

  // Calculated sizes
  const userIconSize = size * userIconSizeRatio;
  const objectIconSize = size * objectIconSizeRatio;
  const strokeWidth = size * strokeWidthRatio;
// M 0 0 L -16 8 A 1 1 0 0 0 16 8 L 0 0
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.radarSvg}>
      <Defs>
        <ClipPath id="clip">
          {/* Flip semicircle to bottom */}
        <Path d={`M${center} ${center} L${center - 200} ${center + 200} A1 1 0 0 0 ${center + 200} ${center + 200} L${center} ${center} Z`} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip)">
        {/* Background semicircle */}
     <Path
          d={`M${center} ${center} L${center - 200} ${center + 200} A1 1 0 0 0 ${center + 200} ${center + 200} L${center} ${center} Z`}
          fill="rgba(0, 255, 0, 0.1)"
          stroke="rgba(0, 255, 0, 0.3)"
          strokeWidth={strokeWidth * 2}
        />

        {/* Grid lines (flipped) */}
        {gridDistances.map((distance) => {
          const r = distance * scaleFactor;
          return (
            <Path
              key={`grid-${distance}`}
              d={`M ${center - r} ${center} A${r} ${r} 0 0 0 ${center + r} ${center}`}
              stroke="rgba(0, 255, 0, 0.2)"
              strokeWidth={strokeWidth}
              fill="none"
            />
          );
        })}
        })}

        {/* Radar objects */}
        {coordinates.filter(item => item.y < 0).map((item, index) => {
          const x = center + item.x * scaleFactor - objectIconSize/2;
          const y = center - item.y * scaleFactor - objectIconSize/2;
          return (
            <SvgImage
              key={`obj-${index}`}
              x={x}
              y={y}
              width={objectIconSize}
              height={objectIconSize}
              href={getObjectIcon(item.object_class)}
              preserveAspectRatio="xMidYMid meet"
            />
          );
        })}
      </G>

      {/* Centered user icon */}
      <SvgImage
        x={center - userIconSize/2}
        y={center - userIconSize/2}
        width={userIconSize}
        height={userIconSize}
        href={require('../assets/icons/user.png')}
        preserveAspectRatio="xMidYMid meet"
      />
    </Svg>
  );
};

export default function AlertCycle() {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallRisk, setOverallRisk] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      { object_class: 'cylist', x: 150, y: -200, mDA: 10, risk: false },
    ];
    setCoordinates(hardcodedData);
    setLoading(false);
  }, []);

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

      <View style={styles.radarContainer}>
        <Radar coordinates={coordinates} size={size} />
      </View>
    </View>
  );
}

// ================= COORDINATES ===================
// <View style={styles.coordinates}>
//   {loading ? (
//     <ActivityIndicator color="white" />
//   ) : coordinates.map((item, index) => (
//     <View key={index} style={styles.objectContainer}>
//       <SvgImage
//         width={40}
//         height={40}
//         href={getObjectIcon(item.object_class)}
//         preserveAspectRatio="xMidYMid meet"
//       />
//       <Text style={[
//         styles.coordinateText,
//         item.risk ? styles.highRisk : styles.lowRisk
//       ]}>
//         {`${item.object_class} | (${item.x}, ${item.y}) | ${item.mDA}m`}
//       </Text>
//     </View>
//   ))}
// </View>


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    width: "100%",
    height: "100%",
  },
  radarContainer: {
    marginTop: 0,
    alignItems: 'center',
    width: 500,  // Control radar size here
    height: 600, // Control radar size here
    border: '1px white solid',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: '50%',
  },
  radarSvg: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
  },
  coordinates: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  riskIndicator: {
    padding: 10,
    margin: 0,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    border: '2px solid white',
  },
  riskText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  objectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    border: '2px solid white',
  },
  coordinateText: {
    color: 'white',
    marginLeft: 15,
    fontSize: 16,
    flexShrink: 1,
  },
  highRisk: {
    color: 'red',
    fontWeight: 'bold',
  },
  lowRisk: {
    color: 'green',
    fontWeight: 'bold',
  },
});
