import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Link } from "expo-router";

export default function Devicelist() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>
        Device List
      </Text>
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
});
