
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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Import Tab Navigator
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons'; // Icon for the navbar

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a Tab Navigator
const Tab = createBottomTabNavigator();

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
      {/* Tab.Navigator for switching between screens */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = 'home';
            } else if (route.name === 'Scanner') {
              iconName = 'information-circle';
            } 
            // Return an icon for the tab
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        {/* 'index' Screen */}
        <Tab.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
        {/* 'about' Screen */}
        <Tab.Screen name="Scanner" component={ScannerScreen} options={{ headerShown: false }}/>
      </Tab.Navigator>
   <StatusBar
        style="auto"
        backgroundColor='#000000' 
        barStyle='dark-content'
      />
    </ThemeProvider>
  );
}

// Define your Home and About Screens as components
function HomeScreen() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'AlertCycle', headerShown: false }} />
    </Stack>
  );
}

function ScannerScreen() {
  return (
    <Stack>
      <Stack.Screen name="scanner" options={{ title: 'Scanner', headerShown: false}} />
    </Stack>
  );
}

