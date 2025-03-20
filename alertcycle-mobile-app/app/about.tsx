import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function About() {
  const navigation = useNavigation();
  return (


      <View style={styles.container}>      
      <Text style={styles.title}>DASHBOARD</Text>
      {/*<ThemedText style={styles.description}>
        Welcome to the Dashboard page! Here you need to connect the Phone to the Alertcycle device.
      </ThemedText>
      <Link href="/" style={styles.link}>Go Back to Home</Link>*/}
      <View style={styles.shape_container}>
        <View style={styles.circle}>
        </View>
      </View>
        <TouchableOpacity style={styles.connect_btn}  onPress={()=> Alert.alert('alert', 'Connecting to AlertCycle Device',
          [{text: 'OK', onPress:()=> navigation.navigate('scan')},])}>
          <Text style={styles.text_btn}>Connect to AlertCycle Device</Text>
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
    backgroundColor: 'white', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 300,
  },/*
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  link:{
    fontSize: 18,
    color: '#007aff',
    textDecorationLine: 'underline',
  },*/
  shape_container:{
    height:100,
    alignItems: 'center',
    justifyContent: 'center',
    margin:150,  
  },
  circle:{
    width:300,
    height:300,
    borderRadius:300/2,
    borderColor: 'green',
    borderWidth: 3,
  },
  connect_btn:{
    backgroundColor: '#039dfc',
    paddingVertical:12,
    paddingHorizontal:20,
    borderRadius:8,
  },
  text_btn:{
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  }/*
  rectangle:{
    width:120*2,
    height:120,
    backgroundColor: 'red', 
  },*/
});

// turn this into a file named "dashboard"
// Make the background white
// Add features like 
//      - Button to connect to alertcycle wifi (this dont have to do anything, just a button)
//      - Basic Manual to what to do
//      - A title of our program
//      - add a feature for the developer to go from the index.tsx to this dashboard so that we can see it on development
//
//
//      TITLE 
//
//
//      CONNECT TO ALERT CYCLE DEVICE (BUTTON)
//      DESCRIPTON TO WHAT TO DO
