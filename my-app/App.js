import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ProfileProvider } from "./src/context/ProfileContext";
import { LanguageProvider } from "./src/context/LanguageContext";

const App = () => (
  <LanguageProvider>
    <ProfileProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ProfileProvider>
  </LanguageProvider>
);

export default App;
