import React, { Component } from 'react';

import * as Font from 'expo-font';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './components/TabNavigator';

const Stack = createStackNavigator();
export default class App extends Component {
  constructor() {
    super();
    this.state = {
      fontLoaded: false,
    };
  }

  async loadFonts() {
    Font.loadAsync({
      Rajdhani: require('./fonts/Rajdhani-SemiBold.ttf')
    }).then(() => {
      this.setState({ fontLoaded: true });
    });
  }

  componentDidMount() {
    this.loadFonts();
  }

  render() {
    const { fontLoaded } = this.state;

    if (fontLoaded) {
      return (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="BottomTab" component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return null;
  }
}
