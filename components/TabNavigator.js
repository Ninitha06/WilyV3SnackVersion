import * as React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import Transaction from "../screens/TransactionScreen";
import Search from "../screens/SearchScreen";

const Tab = createBottomTabNavigator();

export default class TabNavigator extends React.Component {
  render() {
    //When you have NavigationContainer enclosing Stack Navigator, You cant have another in the nested Tab Container
    return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focussed, size, color }) => {
              let iconName;

              if (route.name === "Transaction") iconName = "book";
              else if (route.name === "Search") iconName = "search";

              return (
                <Ionicons
                  name={iconName}
                  color={color}
                  size={size}
                  style={{ marginLeft: 0 }}
                />
              );
            },
          })}
          tabBarOptions={{
            activeTintColor: "#FFF",
            inactiveTintColor: "black",
            style: {
              height: 120,
              backgroundColor: "#5653d4",
              borderTopWidth: 0,
            },
            labelStyle: {
              fontSize: 20,
              fontFamily: "Rajdhani",
            },
            labelPosition: "beside-icon",
            tabStyle: {
              marginVertical: 15,
              marginHorizontal: 10,
              borderRadius: 30,
              borderWidth: 2,
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          {/* When we need to pass props to screens. receive props in constructor
            <Tab.Screen name="Transaction" component={() => <Transaction domState="normal"/>}>
            </Tab.Screen>*/}
          <Tab.Screen
            name="Transaction"
            component={Transaction}
            initialParams={"normal"}
          ></Tab.Screen>
          <Tab.Screen name="Search" component={Search}></Tab.Screen>
        </Tab.Navigator>
    );
  }
}