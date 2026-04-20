import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import first from "./Pages/Screen1";
import login from "./Pages/login";
import ProfileScreen from "./Pages/ProfileScreen";
import signup from "./Pages/signup";
import UploadCred from "./Pages/Upload_Cred";
import ChooseJob from "./Pages/Choose_Job";
import LanguageSection from "./Pages/Language_section";
import AddSkill from "./Pages/AddSkill";
import Bio_Jobseeker from "./Pages/Bio_Jobseeker";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen key={"first"} name={"first"} component={first} />
        <Stack.Screen name="login" component={login} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="Upload_Cred" component={UploadCred} />
        <Stack.Screen name="Choose_Job" component={ChooseJob} />
        <Stack.Screen name="Language_section" component={LanguageSection} />
        <Stack.Screen name="AddSkill" component={AddSkill} />
        <Stack.Screen name="Bio_Jobseeker" component={Bio_Jobseeker} />
        <Stack.Screen name="signup" component={signup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
