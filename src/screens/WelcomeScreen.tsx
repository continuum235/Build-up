import React, { useEffect, useRef } from "react";
import {
  View,
  ScrollView,
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
import { useAuth } from "@clerk/clerk-expo";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import routes, { RootStackParamList } from "../navigation/routes";
import { useApi } from "../services/api";
import { useProfile } from "../context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isSignedIn, isLoaded } = useAuth();
  const { getMe } = useApi();
  const { setRoleType } = useProfile();
  const handled = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || handled.current) return;
    // Not signed in *yet*: don't latch, so a session that finishes restoring
    // a moment later still gets routed here instead of leaving this screen
    // stuck.
    if (!isSignedIn) return;
    handled.current = true;

    const routeToDestination = (user: { role: string; onboardingComplete: boolean }) => {
      if (!isMounted.current) return;
      if (user.role === "HIRER" || user.role === "WORKER") {
        setRoleType(user.role === "HIRER" ? "employer" : "jobSeeker");
      }
      if (user.onboardingComplete) {
        const dest = user.role === "HIRER" ? routes.jobBoard : routes.findJobs;
        navigation.reset({ index: 0, routes: [{ name: dest }] });
      } else {
        navigation.replace(routes.roleType);
      }
    };

    getMe()
      .then(({ user }) => routeToDestination(user))
      .catch(() => {
        // Backend unreachable but user is signed in via Clerk —
        // send to onboarding anyway. Data will sync when API is back.
        if (isMounted.current) navigation.replace(routes.roleType);
      });
  }, [isLoaded, isSignedIn, getMe, navigation, setRoleType]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#965541" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2E1DA" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.innerContainer}>
          <View style={styles.titleWrapper}>
            <View style={styles.titleBoxSolid}>
              <Text style={styles.titleText}>build</Text>
            </View>
            <View style={styles.titleBoxOutline}>
              <Text style={styles.titleText}>up</Text>
            </View>
          </View>

          <Image
            source={require("../../assets/hexagon.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <View style={styles.textSection}>
            <Text style={styles.headline}>A good headline</Text>
            <Text style={styles.subheadline}>
              A simple app introduction {"\n"}greeting audience.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(routes.languageSelection, {
                next: routes.login,
              })
            }
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupContainer}
            activeOpacity={0.6}
            onPress={() =>
              navigation.navigate(routes.languageSelection, {
                next: routes.signup,
              })
            }
          >
            <Text style={styles.signupTextBase}>
              New to Buildup? <Text style={styles.signupTextBlue}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2E1DA",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    alignItems: "center",
    paddingVertical: hp("5%"),
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("6%"),
    backgroundColor: "#FFFFFF",
    padding: wp("1%"),
  },
  titleBoxSolid: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("3%"),
  },
  titleBoxOutline: {
    backgroundColor: "#EAD4CD",
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("3%"),
  },
  titleText: {
    color: "#965541",
    fontSize: wp("11%"),
    fontWeight: "bold",
    textTransform: "lowercase",
  },
  textSection: {
    alignItems: "center",
    marginBottom: hp("5%"),
    width: "90%",
  },
  headline: {
    color: "#965541",
    fontSize: wp("9%"),
    fontWeight: "bold",
    marginBottom: hp("1.5%"),
    textAlign: "center",
  },
  subheadline: {
    color: "#4A4A4A",
    fontSize: wp("4.5%"),
    textAlign: "center",
    lineHeight: wp("6.5%"),
  },
  loginButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: wp("70%"),
    alignItems: "center",
    marginBottom: hp("2.5%"),
  },
  heroImage: {
    width: wp("75%"),
    height: hp("35%"),
    marginBottom: hp("6%"),
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  signupContainer: {
    paddingVertical: hp("1%"),
  },
  signupTextBase: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "500",
  },
  signupTextBlue: {
    color: "#007AFF",
  },
});
