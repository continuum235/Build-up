import React from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";

export default () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2E1DA" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.innerContainer}>
          {/* TITLE SECTION */}
          <View style={styles.titleWrapper}>
            <View style={styles.titleBoxSolid}>
              <Text style={styles.titleText}>build</Text>
            </View>
            <View style={styles.titleBoxOutline}>
              <Text style={styles.titleText}>up</Text>
            </View>
          </View>

          {/* MAIN HERO GRAPHIC (Hexagon) */}
          <Image
            source={require("../../assets/hexagon.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* TEXT SECTION */}
          <View style={styles.textSection}>
            <Text style={styles.headline}>A good headline</Text>
            <Text style={styles.subheadline}>
              A simple app introduction {"\n"}greeting audience.
            </Text>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                routes.languageSelection as never,
                { next: routes.login } as never,
              )
            }
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          {/* SIGN UP REDIRECT */}
          <TouchableOpacity
            style={styles.signupContainer}
            activeOpacity={0.6}
            onPress={() =>
              navigation.navigate(
                routes.languageSelection as never,
                { next: routes.signup } as never,
              )
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2E1DA",
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

  /* LOGO TITLE */
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
    backgroundColor: "#EAD4CD", // Tinted background for 'up'
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("3%"),
  },
  titleText: {
    color: "#965541",
    fontSize: wp("11%"),
    fontWeight: "bold",
    textTransform: "lowercase",
  },

  /* TYPOGRAPHY */
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

  /* BUTTONS */
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
    color: "#007AFF", // Standard iOS blue link color
  },
});
