import React from 'react';
import {View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';

export default function About() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>About Page</ThemedText>
      <ThemedText style={styles.description}>
        Welcome to the About page! Here you can learn more about our application.
      </ThemedText>
      <Link href="/" style={styles.link}>Go Back to Home</Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    fontSize: 18,
    color: '#007aff',
    textDecorationLine: 'underline',
  },
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
