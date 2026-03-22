import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import first from "./Pages/first_on_boarding";
import details from "./Pages/Login_details"
const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen key={"first"} name={"first"} component={first} />
       <Stack.Screen name="details" component={details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;