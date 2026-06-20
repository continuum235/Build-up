import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "social";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-[#1E1E1E] rounded-lg py-[14px]",
  secondary: "bg-[#965541] rounded-lg py-[14px]",
  outline: "border border-[#1E1E1E] rounded-[30px] py-[12px]",
  social: "border border-[#1E1E1E] rounded-[30px] py-[12px] flex-row justify-center",
};

const textStyles = {
  primary: "text-white text-center font-bold text-[16px]",
  secondary: "text-white text-center font-bold text-[16px]",
  outline: "text-black text-center font-bold text-[14px]",
  social: "text-black text-center font-bold text-[14px]",
};

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
      className={`w-full items-center ${variantStyles[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          {children}
          <Text className={textStyles[variant]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
