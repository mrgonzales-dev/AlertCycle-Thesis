import React from 'react';
import {SafeAreaView, Image, StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {Link, Stack} from "expo-router";

import { useCameraPermissions } from "expo-camera";
import { Camera, CameraView } from "expo-camera";


export default function Qrscanner() {
  const navigation = useNavigation();
  
  const [permission, requestPermission] = useCameraPermissions();

  const isPermissionGranted = Boolean(permission?.granted);
  
  return (
   <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Overview", headerShown: false }} />
      <Text style={styles.title}>QR Code Scanner</Text>
      <View style={{ gap: 20 }}>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.buttonStyle}>Request Permissions</Text>
        </TouchableOpacity>
        <Link href={"./qrscan"} asChild>
          <TouchableOpacity disabled={!isPermissionGranted}>
            <Text
              style={[
                styles.buttonStyle,
                { opacity: !isPermissionGranted ? 0.5 : 1 },
              ]}
            >
              Scan Code
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    justifyContent: "space-around",
    paddingVertical: 80,
  },
  title: {
    color: "white",
    fontSize: 40,
  },
  buttonStyle: {
    color: "#0E7AFE",
    fontSize: 20,
    textAlign: "center",
  },
});
