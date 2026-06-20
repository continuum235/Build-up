import React from "react";
import { TextInput as RNTextInput, Text, TextInputProps as RNTextInputProps, View } from "react-native";

interface TextInputProps extends RNTextInputProps {
  error?: string;
  label?: string;
}

export default function TextInput({
  error,
  label,
  className = "",
  style,
  ...props
}: TextInputProps) {
  return (
    <View className="w-full mb-3">
      {label && <Text className="text-[#1E1E1E] text-sm font-semibold mb-1">{label}</Text>}
      <RNTextInput
        className={`bg-white border ${error ? "border-red-500" : "border-[#D8DADC]"} rounded-lg px-4 py-3.5 text-base text-black ${className}`}
        placeholderTextColor="#A4A9B6"
        style={style}
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
