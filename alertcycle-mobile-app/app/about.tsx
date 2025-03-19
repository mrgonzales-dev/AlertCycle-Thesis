import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function About() {
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
        <TouchableOpacity style={styles.connect_btn}  onPress={()=> alert('Connecting to AlertCycle Device')}>
          <Text>Connect to AlertCycle Device</Text>
          </TouchableOpacity>
      </View>

  );
}

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
    marginBottom: 10,
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
    height:150,
    alignItems: 'center',
    justifyContent: 'center',
    margin:250,  
  },
  circle:{
    width:360,
    height:360,
    borderRadius:360/2,
    borderColor: 'armygreen',
    borderWidth: 5,
  },
  connect_btn:{
    backgroundColor: 'oceanblue',
    paddingVertical:12,
    paddingHorizontal:20,
    borderRadius:8,
  },/*
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
