import React from 'react';
import {Image, StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function Qrscanner() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
    <Text>
sup ma bruh
      </Text>

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
});
