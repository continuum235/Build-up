import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import routes, { RootStackParamList } from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isNonEmpty, isValidEmail, isValidPassword } from "../utils/validation";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, setAuth } = useProfile();
  const { t } = useLanguage();
  const [name, setName] = useState<string>(profile.auth.name);
  const [email, setEmail] = useState<string>(profile.auth.email);
  const [password, setPassword] = useState<string>(profile.auth.password);
  const [location, setLocation] = useState<string>(profile.auth.location);

  const canSubmit =
    isNonEmpty(name) &&
    isValidEmail(email) &&
    isValidPassword(password, 8) &&
    isNonEmpty(location);

  const handleSignup = () => {
    if (!canSubmit) {
      alert(t("validation.invalidSignup"));
      return;
    }
    setAuth({ name, email, password, location });
    navigation.navigate(routes.roleType);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardSafeWrapper
        scrollStyle={styles.flex1}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("../../assets/Back-button.png")}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={styles.innerContainer}>
          <View style={styles.headerWrapper}>
            <View style={styles.titleRow}>
              <View style={styles.titleBoxSolid}>
                <Text style={styles.titleTextWhite}>build</Text>
              </View>
              <View style={styles.titleBoxOutline}>
                <Text style={styles.titleTextBrown}>up</Text>
              </View>
            </View>

            <Text style={styles.headline}>{t("auth.signupHeadline")}</Text>
          </View>

          <View style={styles.socialSection}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => alert("Google Login")}
            >
              <Image
                source={require("../../assets/Google-logo.png")}
                style={styles.googleIcon}
              />
              <Text style={[styles.socialButtonText, { color: "#4285F4" }]}>
                {t("auth.signupWithGoogle")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>{t("auth.or")}</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.inputSection}>
            <TextInput
              placeholder={t("auth.fullName")}
              placeholderTextColor="#A4A9B6"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor="#A4A9B6"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder={t("auth.passwordPlaceholderSignup")}
              placeholderTextColor="#A4A9B6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              placeholder={t("auth.location")}
              placeholderTextColor="#A4A9B6"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
            <Text style={styles.submitButtonText}>
              {t("auth.createAccount")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerTerms}>
            {t("auth.termsPrefix")}
            <Text style={{ fontWeight: "bold" }}> {t("auth.termsBold")}</Text>
          </Text>
        </View>
      </KeyboardSafeWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp("5%"),
  },
  innerContainer: {
    alignItems: "center",
    paddingHorizontal: wp("8%"),
  },
  backButtonContainer: {
    paddingLeft: wp("6%"),
    paddingTop: hp("2%"),
    width: wp("20%"),
  },
  backIcon: {
    width: wp("8%"),
    height: wp("8%"),
    marginTop: hp("2%"),
    marginLeft: wp("8%"),
    marginBottom: hp("2%"),
  },
  headerWrapper: {
    alignItems: "center",
    marginBottom: hp("4%"),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  titleBoxSolid: {
    backgroundColor: "#965541",
    paddingHorizontal: wp("2%"),
    marginRight: wp("0.5%"),
  },
  titleBoxOutline: {
    borderColor: "#965541",
    borderWidth: 2,
    paddingHorizontal: wp("2%"),
  },
  titleTextWhite: {
    color: "#F2E1DA",
    fontSize: wp("9%"),
    fontWeight: "bold",
  },
  titleTextBrown: {
    color: "#965541",
    fontSize: wp("9%"),
    fontWeight: "bold",
  },
  headline: {
    color: "#965541",
    fontSize: wp("6.5%"),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: wp("9%"),
  },
  socialSection: {
    width: "100%",
    marginBottom: hp("3%"),
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#1E1E1E",
    borderRadius: wp("10%"),
    borderWidth: 1,
    paddingVertical: hp("1.8%"),
    marginBottom: hp("1.5%"),
  },
  socialButtonText: {
    color: "#000000",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  googleIcon: {
    width: wp("4.5%"),
    height: wp("4.5%"),
    marginRight: wp("3%"),
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: "#D8DADC",
  },
  orText: {
    color: "#A4A9B6",
    fontSize: wp("3.5%"),
    marginHorizontal: wp("3%"),
  },
  inputSection: {
    width: "100%",
    marginBottom: hp("3%"),
  },
  input: {
    color: "#000000",
    fontSize: wp("4%"),
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    padding: wp("4.5%"),
    marginBottom: hp("1.5%"),
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
    marginBottom: hp("3%"),
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  footerTerms: {
    color: "#666",
    fontSize: wp("3.2%"),
    textAlign: "center",
    paddingHorizontal: wp("5%"),
    lineHeight: wp("5%"),
  },
});

export default SignupScreen;
