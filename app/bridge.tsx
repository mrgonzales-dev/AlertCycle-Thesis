import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Link } from "expo-router";
import { useCameraPermissions } from "expo-camera";

const blue_main_logo  = require("../assets/main-logo/ac-logo-black.png");
const sample_qr_code = require("../assets/ui-components/sample_qr_code.png");

export default function ConnectionPage() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image source={blue_main_logo} style={styles.top_logo} />
        <Image source={sample_qr_code} style={styles.sampe_qr} />
        <Text style={styles.pr_b}></Text>
      </View>
      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
      {/* Top Container */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Connect To Device</Text>
          <Text style={styles.pr}>
            To start the application, scan the QR code to connect to the device access point
            or do it manually on your phone.
          </Text>
        </View>
        <View style={{
    justifyContent: 'center',
    alignItems: 'center',
        }}>
 
          <Link href={"./qrscan"} asChild>
            <TouchableOpacity 
              onPress={requestPermission}
              disabled={!isPermissionGranted}
              style={styles.scan_btn}
            >
              <Text style={[
                styles.buttonText, 
                { opacity: !isPermissionGranted ? 0.5 : 1 }
              ]}>
                Scan QR Code
              </Text>
            </TouchableOpacity>
          </Link>

            <TouchableOpacity 
              disabled={!isPermissionGranted}
              style={styles.skip_btn}
              style={styles.connect_btn}
              onPress={() => navigation.navigate('scanner')}>
              <Text style={[
                styles.skip_btn_txt, 
                { opacity: !isPermissionGranted ? 0.5 : 1 }
              ]}>
               Already Connected?
              </Text>
            </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#1373EC",
  },
  top_logo: {
    top: 40,
    marginBottom: 20,
    width: 200,  // Adjust the size of the alert image
    height: 100, // Adjust the size of the alert image
    resizeMode: 'contain',
    shadowColor: '#fff',          // Glow color (white in this case)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,             // This creates the glow effect
    elevation: 10,                // For Android shadow
  },
  sample_qr: {
    margin: 0,
    position: 'absolute',
  },
  topContainer: {
    flex: 1, // Takes up 50% of the screen height
    width: "200%",  
    bottom: 20,
    borderRadius: '50%' ,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDFDFD",
    padding: 20,
  },
  bottomContainer: {
    flex: 0.7, // Takes up 50% of the screen height
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1373EC",
    textAlign: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
    bottom: 10,
} ,
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom:5,
},
  pr: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
    paddingHorizontal: 50,

  },
  scan_btn: {
    borderRadius: 20,
    padding: 10,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    shadowColor: '#a7ff22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.39,
    shadowRadius: 8.30,
    elevation: 13,
  },
  skip_btn: {
    color: "white",
    padding: 10,
    width: '80%',
  },
  skip_btn_txt: {
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 5,
    fontSize: 15,
    color: "white",
    textAlign: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'black',
  },
  bottomText: {
    fontSize: 18,
    color: 'black',
  },
});
