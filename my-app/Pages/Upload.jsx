import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

export default function Upload() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("../assets/Profile-logo.png")}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Image
            source={require("../assets/Search.png")}
            resizeMode="contain"
            style={styles.heroIcon}
          />
          <Text style={styles.title}>Looking for jobs</Text>
          <Text style={styles.subtitle}>
            Add your details and upload your profile so employers can find you faster.
          </Text>
        </View>

        <View style={styles.uploadCard}>
          <Image
            source={require("../assets/Upload.png")}
            resizeMode="contain"
            style={styles.uploadIcon}
          />
          <Text style={styles.uploadTitle}>Upload your documents</Text>
          <Text style={styles.uploadText}>
            Resume, ID proof, certificates, and work samples can be added here next.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
  },
  backIcon: {
    width: wp("8%"),
    height: wp("8%"),
  },
  headerTitle: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  headerSpacer: {
    width: wp("8%"),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp("8%"),
    paddingTop: hp("3%"),
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: wp("6%"),
    paddingVertical: hp("4%"),
    paddingHorizontal: wp("6%"),
    marginBottom: hp("3%"),
  },
  heroIcon: {
    width: wp("18%"),
    height: wp("18%"),
    marginBottom: hp("2%"),
  },
  title: {
    color: "#965541",
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
  },
  subtitle: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
    textAlign: "center",
    lineHeight: wp("6%"),
    opacity: 0.8,
  },
  uploadCard: {
    alignItems: "center",
    borderColor: "#A4A9B6",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: wp("6%"),
    paddingVertical: hp("5%"),
    paddingHorizontal: wp("6%"),
    marginBottom: hp("4%"),
  },
  uploadIcon: {
    width: wp("20%"),
    height: wp("20%"),
    marginBottom: hp("2%"),
  },
  uploadTitle: {
    color: "#965541",
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
  },
  uploadText: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    textAlign: "center",
    lineHeight: wp("5.5%"),
  },
  primaryButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
});
