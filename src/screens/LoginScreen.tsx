import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useSignIn, useOAuth, useAuth } from "@clerk/clerk-expo";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import routes, { RootStackParamList } from "../navigation/routes";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { loginSchema } from "../utils/schemas";
import { useApi } from "../services/api";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();
  const { signIn, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signOut } = useAuth();
  const { syncUser, getMe } = useApi();
  const { setRoleType } = useProfile();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** After Clerk auth succeeds, fetch the DB profile and redirect appropriately */
  const handlePostAuth = async () => {
    let navigated = false;
    const go = (fn: () => void) => {
      if (!navigated) {
        navigated = true;
        fn();
      }
    };

    const resolveDestination = async () => {
      try {
        await syncUser();
      } catch {
        // best-effort
      }
      try {
        const { user } = await getMe();
        if (user.role === "HIRER" || user.role === "WORKER") {
          setRoleType(user.role === "HIRER" ? "employer" : "jobSeeker");
        }
        if (user.onboardingComplete) {
          const dest = user.role === "HIRER" ? routes.jobBoard : routes.findJobs;
          go(() => navigation.reset({ index: 0, routes: [{ name: dest }] }));
        } else {
          go(() => navigation.replace(routes.roleType));
        }
      } catch {
        // Backend unreachable — send to onboarding, it will re-sync
        go(() => navigation.replace(routes.roleType));
      }
    };

    // Cap the wait so a cold/slow backend never leaves login hanging.
    const tooSlow = new Promise<void>((resolve) => setTimeout(resolve, 8000));
    await Promise.race([resolveDestination(), tooSlow]);
    go(() => navigation.replace(routes.roleType));
  };

  const handleLogin = async () => {
    const parse = loginSchema.safeParse({ email, password });
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

    if (!signIn) {
      alert("Sign-in is not ready. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await handlePostAuth();
      } else {
        alert("Additional verification required. Please try again.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message: string }[] })?.errors?.[0]?.message ??
            "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!startOAuthFlow) {
      alert("Sign-in not ready yet. Please try again.");
      return;
    }
    setLoading(true);
    try {
      await signOut().catch(() => {});
      const { createdSessionId, setActive: setActiveOAuth } =
        await startOAuthFlow();
      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId });
        await handlePostAuth();
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
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={errors.email}
            />
            <TextInput
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              error={errors.password}
            />
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#965541"
              style={{ marginVertical: hp("2%") }}
            />
          ) : (
            <Button
              title={t("auth.loginButton")}
              onPress={handleLogin}
            />
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("auth.orLoginWith")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogle}
              disabled={loading}
            >
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

export default LoginScreen;

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
