import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './components/HomeScreen';
import { HelpScreen } from './components/HelpScreen';

//Home Screen loaded by default
//Help screen loaded by pressing button with question mark in top right corner

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Voice Cast" component={HomeScreen}/>
        <Stack.Screen name="Help" component={HelpScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}