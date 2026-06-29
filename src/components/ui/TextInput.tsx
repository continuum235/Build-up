import React from "react";
import {
  TextInput as RNTextInput,
  Text,
  TextInputProps as RNTextInputProps,
  View,
  StyleSheet,
} from "react-native";

interface TextInputProps extends RNTextInputProps {
  error?: string;
  label?: string;
}

export default function TextInput({
  error,
  label,
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#A4A9B6"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: "#1E1E1E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "black",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
