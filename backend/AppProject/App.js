import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Home from "./components/Home";
import Create from "./components/Create";
import Details from "./components/Details";
import Edit from "./components/Edit";

import Contants from "expo-constants";

import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

function App() {
  const [localData, setLocalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem("Excercises", jsonValue);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetch(`http://192.168.56.1:3000/get/excercises`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((excercise) => {
        setLocalData(excercise);
        storeData(excercise);
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, []);

  if (!isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            initialParams={{ localData: localData }}
          />
          <Stack.Screen name="Create" component={Create} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="Edit" component={Edit} />
        </Stack.Navigator>
      </View>
    );
  } else {
    return <Text>Loading...</Text>;
  }
}

export default () => {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eddfdf",
    marginTop: Contants.statusBarHeight,
  },
});
