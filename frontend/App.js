import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Button } from "react-native";

import Auth from "./screens/auth";
import Profile from "./screens/profile";
import RestaurantsList from "./screens/restaurants-list";
import ReservationForm from "./screens/reservation-form";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ title: "Profile" }}
        />
        <Stack.Screen
          name="RestaurantsList"
          component={RestaurantsList}
          options={({ navigation }) => ({
            title: "Resaturants",
            headerRight: () => (
              <Button
                title="Profile"
                onPress={() => navigation.navigate("Profile")}
              />
            ),
          })}
        />
        <Stack.Screen
          name="ReservationForm"
          component={ReservationForm}
          options={({ route }) => ({
            title: route.params.restaurant.restaurant_name,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
