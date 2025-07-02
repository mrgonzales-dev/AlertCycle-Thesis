/**
           _           _    _____           _      
     /\   | |         | |  / ____|         | |     
    /  \  | | ___ _ __| |_| |    _   _  ___| | ___ 
   / /\ \ | |/ _ \ '__| __| |   | | | |/ __| |/ _ \
  / ____ \| |  __/ |  | |_| |___| |_| | (__| |  __/
 /_/    \_\_|\___|_|   \__|\_____\__, |\___|_|\___|
                                  __/ |            
                                 |___/             
**/

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <AppNavigator />
      <StatusBar
        style="auto"
        backgroundColor='#000000'
        barStyle='dark-content'
      />
    </ThemeProvider>
  );
}

// App Navigator (Stack Navigator)
function AppNavigator() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'AlertCycle', headerShown: false }} />
      <Stack.Screen name="scanner" options={{ title: 'Scanner', headerShown: false }} />
      <Stack.Screen name="bridge" options={{ title: 'QR Scanner', headerShown: false }} />
    </Stack>
  );
}
