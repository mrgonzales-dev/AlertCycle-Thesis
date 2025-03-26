import React from 'react';
import {Image, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const blue_main_logo  = require("../assets/main-logo/ac-logo-blue.png")


export default function Dashboard() {
  const navigation = useNavigation();
  return (
      <View style={styles.container}>      
        {/* Local Image */}
        <Image source={blue_main_logo} style={styles.image} />
       <TouchableOpacity 
        style={styles.connect_btn}  
        onPress={()=> Alert.alert('alert', 'Connecting to AlertCycle Device',
        [{text: 'OK', onPress:()=> navigation.navigate('scan')},])}> 
        <Text style={styles.buttonText}> 
             Connect
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
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain', // or 'contain', 'stretch', etc.
    marginBottom: 300,
  },
  connect_btn: {
    bottom: 0,
    borderRadius: 20,
    padding: 10,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
});
