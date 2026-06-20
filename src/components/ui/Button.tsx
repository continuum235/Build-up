import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "social";
  loading?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          {children}
          <Text style={[styles.text, styles[`text_${variant}`]]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingVertical: 14,
  },
  secondary: {
    backgroundColor: "#965541",
    borderRadius: 8,
    paddingVertical: 14,
  },
  outline: {
    borderWidth: 1,
    borderColor: "#1E1E1E",
    borderRadius: 30,
    paddingVertical: 12,
  },
  social: {
    borderWidth: 1,
    borderColor: "#1E1E1E",
    borderRadius: 30,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: "center",
    fontWeight: "bold",
  },
  text_primary: {
    color: "white",
    fontSize: 16,
  },
  text_secondary: {
    color: "white",
    fontSize: 16,
  },
  text_outline: {
    color: "black",
    fontSize: 14,
  },
  text_social: {
    color: "black",
    fontSize: 14,
  },
});
