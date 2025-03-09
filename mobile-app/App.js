import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'react-native-elements';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import ChatScreen from './screens/ChatScreen';
import ARVerificationScreen from './screens/ARVerificationScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createStackNavigator();

// Custom loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);


// Custom theme for React Native Elements
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#4CD964',
    error: '#FF3B30',
    warning: '#FF9500',
    grey0: '#000000',
    grey1: '#222222',
    grey2: '#444444',
    grey3: '#666666',
    grey4: '#888888',
    grey5: '#AAAAAA',
  },
  Button: {
    raised: true,
    borderRadius: 8,
  },
  Input: {
    containerStyle: {
      paddingHorizontal: 0,
    },
  },
};

export default function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={user ? "Home" : "Login"}
            screenOptions={{
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'QuickBucks' }}
            />
            <Stack.Screen 
              name="CreateTask" 
              component={CreateTaskScreen}
              options={{ title: 'Create New Task' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ title: 'Chat' }}
            />
            <Stack.Screen 
              name="ARVerification" 
              component={ARVerificationScreen}
              options={{ title: 'Task Verification' }}
            />
            <Stack.Screen
              name="TaskDetails"
              component={TaskDetailsScreen}
              options={{ title: 'Task Details' }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={({ route }) => ({
                title: route.params?.isOwnProfile ? 'My Profile' : 'User Profile'
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
