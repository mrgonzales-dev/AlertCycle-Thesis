import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Stack } from "expo-router";
import {
  Image,
  View,
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";

import React from 'react';
import { useEffect, useRef } from "react";
import {WifiManager } from "react-native-wifi-reborn";
import { useNavigation } from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native';


const { width, height } = Dimensions.get('window');
const innerDimension = 300;

export default function ActivateCamera() {
  const navigation = useNavigation();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);


const connectToWifi = (ssid, password, encryptionType, hidden) => {
  if (WifiManager) {
    WifiManager.connectToProtectedSSID(ssid, password, false, hidden)
      .then(() => {
        Alert.alert("Connected to Wi-Fi", `You are now connected to ${ssid}`);
      })
      .catch((error) => {
        Alert.alert("Connection Failed", `Failed to connect to ${ssid}: ${error.message}`);
      });
  } else {
    Alert.alert("Error", "WifiManager is not available.");
  }
};

const handleQRCodeScanned = async (data) => {
  if (data && !qrLock.current) {
    qrLock.current = true;

    // Request location permissions
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission is required for WiFi connections',
        message:
          'This app needs location permission as this is required ' +
          'to scan for wifi networks.',
        buttonNegative: 'DENY',
        buttonPositive: 'ALLOW',
      }
    );

    // Check if permission was granted
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Assuming your QR code data is in the form ["SSID", "Password"]
      const match = data;
      console.log(match);
      if (match) {
        const ssid = match[1];
        const password = match[2];
        const hidden = false
        const encryptionType = "WPA";
        
        // Connect to Wi-Fi after 1 second delay
        setTimeout(() => {
          connectToWifi(ssid, password, encryptionType, hidden);
        }, 1000);
      } else {
        Alert.alert("Invalid QR Code", "Scanned QR code does not contain valid Wi-Fi credentials.");
        qrLock.current = false; // Allow scanning again
      }
    } else {
      Alert.alert("Permission Denied", "Location permission is required to connect to Wi-Fi.");
      qrLock.current = false; // Allow scanning again
    }
  }
};

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => handleQRCodeScanned(data)}
      />
      <Overlay />
    </SafeAreaView>
  );
}

function Overlay() {
  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.outer}>
        <View style={[overlayStyles.overlayPart, { height: (height - innerDimension) / 2 }]} />
        <View style={{ flexDirection: 'row' }}>
          <View style={[overlayStyles.overlayPart, { width: (width - innerDimension) / 2 }]} />
          <View style={overlayStyles.scannerWindow}>
            <View style={overlayStyles.alertContainer}>
              <Image
                source={require('../../assets/main-logo/ac-logo-white.png')}
                style={overlayStyles.glowingAlert}
              />
            </View>
            <View style={overlayStyles.borderTopLeft} />
            <View style={overlayStyles.borderTopRight} />
            <View style={overlayStyles.borderBottomLeft} />
            <View style={overlayStyles.borderBottomRight} />
          </View>
          <View style={[overlayStyles.overlayPart, { width: (width - innerDimension) / 2 }]} />
        </View>
        <View style={overlayStyles.overlayPart} />
      </View>
    </View>
  );
};

const overlayStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overall dimmed background
  },
  outer: {
    height: '100%',
    ...StyleSheet.absoluteFillObject,
  },
  overlayPart: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed part outside the scan area
  },
  scannerWindow: {
    width: innerDimension,
    height: innerDimension,
    backgroundColor: 'transparent', // Transparent part to represent the scanning area
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    position: 'absolute',
    top: -50, // Adjust this value to position the alert on top of the scanner window
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowingAlert: {
    position: 'absolute',
    width: 200,  // Adjust the size of the alert image
    height: 100, // Adjust the size of the alert image
    resizeMode: 'contain',
    shadowColor: '#fff',          // Glow color (white in this case)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,             // This creates the glow effect
    elevation: 10,                // For Android shadow
  },
  // Corner markers for the scanning window
  borderTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
  },
  borderTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
  },
  borderBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
  },
  borderBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
  },
});
