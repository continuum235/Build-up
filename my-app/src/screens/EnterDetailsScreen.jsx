import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isValidDetails } from "../utils/validation";
import KeyboardSafeWrapper from "../components/KeyboardSafeWrapper";

const EnterDetailsScreen = () => {
  const navigation = useNavigation();
  const { profile, setDetails } = useProfile();
  const { t } = useLanguage();
  const [country, setCountry] = useState(profile.details.country);
  const [addressLine1, setAddressLine1] = useState(profile.details.addressLine1);
  const [addressLine2, setAddressLine2] = useState(profile.details.addressLine2);
  const [city, setCity] = useState(profile.details.city);

  const handleSubmit = () => {
    const updatedDetails = {
      country,
      addressLine1,
      addressLine2,
      city,
    };

    if (!isValidDetails(updatedDetails)) {
      alert(t("validation.requiredDetails"));
      return;
    }

    setDetails(updatedDetails);
    const payload = {
      ...profile,
      details: updatedDetails,
    };

    console.log("Profile submit:", payload);
    alert("Profile saved. Check console for details.");
    navigation.reset({
      index: 0,
      routes: [{ name: routes.findJobs }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require("../../assets/Profile-logo.png")}
            resizeMode="contain"
            style={styles.profileIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("details.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardSafeWrapper scrollStyle={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("details.country")}</Text>
          <TouchableOpacity style={styles.selectInput} activeOpacity={0.8}>
            <Text style={styles.selectText}>{country}</Text>
            <Image
              source={require("../../assets/Drop-down-arrow.png")}
              resizeMode="contain"
              style={styles.selectIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("details.address")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t("details.addressLine1")}
            placeholderTextColor="#A4A9B6"
            value={addressLine1}
            onChangeText={setAddressLine1}
          />
          <TextInput
            style={[styles.textInput, styles.textInputSpacing]}
            placeholder={t("details.addressLine2")}
            placeholderTextColor="#A4A9B6"
            value={addressLine2}
            onChangeText={setAddressLine2}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("details.city")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t("details.city")}
            placeholderTextColor="#A4A9B6"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>{t("details.button")}</Text>
        </TouchableOpacity>
      </KeyboardSafeWrapper>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>1/n</Text>
        <View style={styles.navArrowsContainer}>
          <TouchableOpacity style={styles.arrowButton} onPress={() => navigation.goBack()}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={handleSubmit}>
            <Text style={styles.arrowText}>{">"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  profileIcon: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp("8%"),
    paddingTop: hp("1%"),
    paddingBottom: hp("3%"),
  },
  avatarRow: {
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  avatarCircle: {
    width: wp("26%"),
    height: wp("26%"),
    borderRadius: wp("13%"),
    backgroundColor: "#F3C2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: wp("8%"),
    fontWeight: "bold",
    color: "#7A3D64",
  },
  inputSection: {
    marginBottom: hp("2.5%"),
  },
  inputLabel: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.8%"),
  },
  selectText: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
  },
  selectIcon: {
    width: wp("4%"),
    height: wp("4%"),
    tintColor: "#965541",
  },
  textInput: {
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.8%"),
    color: "#1E1E1E",
    fontSize: wp("4%"),
  },
  textInputSpacing: {
    marginTop: hp("1.5%"),
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
    marginBottom: hp("2%"),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  progressContainer: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: hp("0.5%"),
  },
  progressTrack: {
    width: "100%",
    height: "100%",
  },
  progressFill: {
    backgroundColor: "#965541",
    width: "100%",
    height: "100%",
    borderRadius: wp("1%"),
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2E1DA",
    paddingHorizontal: wp("8%"),
    paddingTop: hp("2.5%"),
    paddingBottom: hp("4%"),
  },
  stepText: {
    color: "#965541",
    fontSize: wp("7%"),
    fontWeight: "bold",
  },
  navArrowsContainer: {
    flexDirection: "row",
  },
  arrowButton: {
    backgroundColor: "#965541",
    width: wp("12%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("2%"),
    marginLeft: wp("2%"),
  },
  arrowText: {
    color: "#FFFFFF",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
});

export default EnterDetailsScreen;
