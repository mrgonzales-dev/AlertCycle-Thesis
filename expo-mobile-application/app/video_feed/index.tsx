import React, { useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const VideoFeedScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Hide the title bar/header
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'http://10.42.0.1:3000' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
      <View style={styles.buttonContainer}>
        <Button title="GO BACK" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

export default VideoFeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
});
