import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useSignUp, useOAuth, useAuth } from "@clerk/clerk-expo";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import routes, { RootStackParamList } from "../navigation/routes";
import { useLanguage } from "../context/LanguageContext";
import { signupSchema } from "../utils/schemas";
import { useApi } from "../services/api";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const { signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signOut } = useAuth();
  const { syncUser, updateProfile } = useApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignup = async () => {
    const parse = signupSchema.safeParse({ name, email, password });
    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      parse.error.issues.forEach((e) => {
        const field = e.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!signUp) {
      alert(t("validation.invalidSignup"));
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await syncUser().catch(() => {});
        await updateProfile({ name }).catch(() => {});
        // New user always goes to onboarding
        navigation.replace(routes.roleType);
      } else {
        alert("Please check your email for a verification code.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message: string }[] })?.errors?.[0]?.message ??
            "Signup failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!startOAuthFlow) {
      alert("Sign-up not ready yet. Please try again.");
      return;
    }
    setLoading(true);
    try {
      await signOut().catch(() => {});
      const { createdSessionId, setActive: setActiveOAuth } =
        await startOAuthFlow();
      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId });
        try {
          await syncUser();
        } catch {
          // best-effort
        }
        navigation.replace(routes.roleType);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message: string }[] })?.errors?.[0]?.message ??
            "";
      if (msg) alert(msg);
    } finally {
      setLoading(false);
    }
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
              onPress={handleGoogle}
              disabled={loading}
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
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              style={styles.input}
              error={errors.name}
            />
            <TextInput
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={errors.email}
            />
            <TextInput
              placeholder={t("auth.passwordPlaceholderSignup")}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              secureTextEntry
              style={styles.input}
              error={errors.password}
            />
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#965541"
              style={{ marginVertical: hp("2%") }}
            />
          ) : (
            <Button
              title={t("auth.createAccount")}
              onPress={handleSignup}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />
          )}

          <Text style={styles.footerTerms}>
            {t("auth.termsPrefix")}
            <Text style={{ fontWeight: "bold" }}> {t("auth.termsBold")}</Text>
          </Text>
        </View>
      </KeyboardSafeWrapper>
    </SafeAreaView>
  );
};

export default SignupScreen;

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
    fontSize: wp("4%"),
    borderRadius: wp("3%"),
    padding: wp("4.5%"),
  },
  submitButton: {
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
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
