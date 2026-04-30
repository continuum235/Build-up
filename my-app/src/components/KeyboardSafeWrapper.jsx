import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

const KeyboardSafeWrapper = ({ children, contentContainerStyle, scrollStyle }) => (
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
