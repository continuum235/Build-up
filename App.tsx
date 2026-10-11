import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { View, Text, StyleSheet } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { ProfileProvider } from "./src/context/ProfileContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { RealtimeProvider } from "./src/services/realtime";

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const App: React.FC = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY</Text>
      </View>
    );
  }
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <RealtimeProvider>
        <LanguageProvider>
          <ProfileProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ProfileProvider>
        </LanguageProvider>
      </RealtimeProvider>
    </ClerkProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default App;
