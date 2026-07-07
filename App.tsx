import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import AppNavigator from "./src/navigation/AppNavigator";
import { ProfileProvider } from "./src/context/ProfileContext";
import { LanguageProvider } from "./src/context/LanguageContext";

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_d2lsbGluZy10ZXJyYXBpbi0yNS5jbGVyay5hY2NvdW50cy5kZXYk";

const App: React.FC = () => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
    <LanguageProvider>
      <ProfileProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ProfileProvider>
    </LanguageProvider>
  </ClerkProvider>
);

export default App;
