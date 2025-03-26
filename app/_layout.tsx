
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
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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
  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Tab.Navigator for switching between screens */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'About') {
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
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        {/* 'about' Screen */}
        <Tab.Screen name="About" component={AboutScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
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

function AboutScreen() {
  return (
    <Stack>
      <Stack.Screen name="about" options={{ title: 'About', headerShown: false}} />
    </Stack>
  );
}
