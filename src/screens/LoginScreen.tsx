import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isValidEmail, isValidPassword } from "../utils/validation";
import KeyboardSafeWrapper from "../components/KeyboardSafeWrapper";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, setAuth } = useProfile();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string>(profile.auth.email);
  const [password, setPassword] = useState<string>(profile.auth.password);

  const canSubmit = isValidEmail(email) && isValidPassword(password);

  const handleLogin = () => {
    if (!canSubmit) {
      alert(t("validation.invalidLogin"));
      return;
    }
    setAuth({ email, password });
    navigation.navigate(routes.roleType);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F2E1DA]">
      <StatusBar barStyle="dark-content" />
      <KeyboardSafeWrapper>
        <TouchableOpacity
          className="pl-[5%] pt-[2%] w-[20%]"
          style={{ padding: wp("5%"), marginTop: hp("2%") }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../assets/Back-button.png")}
            className="w-[8%] h-[8%]"
            style={{ width: wp("8%"), height: wp("8%") }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View className="items-center px-[10%]">
          <View className="flex-row mb-[4%]" style={{ marginBottom: hp("4%") }}>
            <View className="bg-[#965541] px-[2%]" style={{ paddingHorizontal: wp("2%") }}>
              <Text className="text-white font-bold" style={{ fontSize: wp("10%") }}>
                build
              </Text>
            </View>
            <View className="border-2 border-[#965541] px-[2%] ml-[1%]" style={{ paddingHorizontal: wp("2%"), marginLeft: wp("1%") }}>
              <Text className="text-[#965541] font-bold" style={{ fontSize: wp("10%") }}>
                up
              </Text>
            </View>
          </View>

          <Text className="font-bold text-[#1E1E1E]" style={{ fontSize: wp("7.5%") }}>
            {t("auth.welcomeBack")}
          </Text>
          <Text className="text-[#666] mb-[5%]" style={{ fontSize: wp("4%"), marginBottom: hp("5%") }}>
            {t("auth.loginSubtitle")}
          </Text>

          <View className="w-full">
            <TextInput
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity className="self-end mb-[4%]" style={{ marginBottom: hp("4%") }}>
              <Text className="text-[#965541] font-semibold" style={{ fontSize: wp("3.5%") }}>
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={t("auth.loginButton")}
            onPress={handleLogin}
            disabled={!canSubmit}
          />

          <View className="flex-row items-center mb-[3%]" style={{ marginBottom: hp("3%") }}>
            <View className="flex-1 h-[1px] bg-[#D8DADC]" />
            <Text className="mx-[3%] text-[#A4A9B6]" style={{ fontSize: wp("3.5%") }}>
              {t("auth.orLoginWith")}
            </Text>
            <View className="flex-1 h-[1px] bg-[#D8DADC]" />
          </View>

          <View className="flex-row justify-center mb-[5%]" style={{ marginBottom: hp("5%") }}>
            <TouchableOpacity
              className="bg-white rounded-full items-center justify-center mx-[3%]"
              style={{
                width: wp("14%"),
                height: wp("14%"),
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
              }}
            >
              <Image
                source={require("../../assets/Google-logo.png")}
                style={{ width: wp("6%"), height: wp("6%") }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="p-[2%]"
            onPress={() => navigation.navigate(routes.signup)}
          >
            <Text className="text-[#666]" style={{ fontSize: wp("3.5%") }}>
              {t("auth.noAccount")}{" "}
              <Text className="text-[#007AFF] font-bold">
                {t("auth.signupLink")}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardSafeWrapper>
    </SafeAreaView>
  );
};

export default LoginScreen;
