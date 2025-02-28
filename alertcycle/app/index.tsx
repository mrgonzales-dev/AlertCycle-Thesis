import {View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Page() {
  return (
    <ThemedView>
      <ThemedText>Hello</ThemedText>
    </ThemedView>
  );
}
