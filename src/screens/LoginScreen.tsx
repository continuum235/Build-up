import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import routes, { RootStackParamList } from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isValidEmail, isValidPassword } from "../utils/validation";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardSafeWrapper>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../assets/Back-button.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBuild}>
              <Text style={styles.logoBuildText}>build</Text>
            </View>
            <View style={styles.logoUp}>
              <Text style={styles.logoUpText}>up</Text>
            </View>
          </View>

          <Text style={styles.welcomeTitle}>{t("auth.welcomeBack")}</Text>
          <Text style={styles.welcomeSubtitle}>{t("auth.loginSubtitle")}</Text>

          <View style={styles.inputContainer}>
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
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={t("auth.loginButton")}
            onPress={handleLogin}
            disabled={!canSubmit}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("auth.orLoginWith")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require("../../assets/Google-logo.png")}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate(routes.signup)}
          >
            <Text style={styles.signupText}>
              {t("auth.noAccount")}{" "}
              <Text style={styles.signupLinkText}>{t("auth.signupLink")}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardSafeWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2E1DA",
  },
  backButton: {
    paddingLeft: wp("5%"),
    paddingTop: hp("2%"),
    width: wp("20%"),
  },
  backIcon: {
    width: wp("8%"),
    height: wp("8%"),
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: wp("10%"),
  },
  logoContainer: {
    flexDirection: "row",
    marginBottom: hp("4%"),
  },
  logoBuild: {
    backgroundColor: "#965541",
    paddingHorizontal: wp("2%"),
  },
  logoBuildText: {
    color: "white",
    fontWeight: "bold",
    fontSize: wp("10%"),
  },
  logoUp: {
    borderWidth: 2,
    borderColor: "#965541",
    paddingHorizontal: wp("2%"),
    marginLeft: wp("1%"),
  },
  logoUpText: {
    color: "#965541",
    fontWeight: "bold",
    fontSize: wp("10%"),
  },
  welcomeTitle: {
    fontWeight: "bold",
    color: "#1E1E1E",
    fontSize: wp("7.5%"),
  },
  welcomeSubtitle: {
    color: "#666",
    fontSize: wp("4%"),
    marginBottom: hp("5%"),
  },
  inputContainer: {
    width: "100%",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: hp("4%"),
  },
  forgotPasswordText: {
    color: "#965541",
    fontWeight: "600",
    fontSize: wp("3.5%"),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8DADC",
  },
  dividerText: {
    marginHorizontal: wp("3%"),
    color: "#A4A9B6",
    fontSize: wp("3.5%"),
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp("5%"),
  },
  socialButton: {
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: wp("3%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  socialIcon: {
    width: wp("6%"),
    height: wp("6%"),
  },
  signupLink: {
    paddingHorizontal: wp("2%"),
  },
  signupText: {
    color: "#666",
    fontSize: wp("3.5%"),
  },
  signupLinkText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});

export default LoginScreen;
