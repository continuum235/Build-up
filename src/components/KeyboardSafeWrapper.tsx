import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, ViewStyle, StyleProp } from "react-native";

interface KeyboardSafeWrapperProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
}

const KeyboardSafeWrapper: React.FC<KeyboardSafeWrapperProps> = ({ children, contentContainerStyle, scrollStyle }) => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView
      style={scrollStyle}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

export default KeyboardSafeWrapper;