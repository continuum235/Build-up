import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isValidBio } from "../utils/validation";
import KeyboardSafeWrapper from "../components/KeyboardSafeWrapper";

const BioScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, setBio } = useProfile();
  const { t } = useLanguage();
  const [bioText, setBioText] = useState<string>(profile.bio);

  const handleNext = () => {
    if (!isValidBio(bioText)) {
      alert(t("validation.bioLength"));
      return;
    }
    setBio(bioText);
    navigation.navigate(routes.hourlyRate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/Back-button.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.headerTitle")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardSafeWrapper scrollStyle={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.textSection}>
          <Text style={styles.mainHeading}>{t("bio.heading")}</Text>
          <Text style={styles.subHeading}>{t("bio.subtitle")}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("bio.label")}</Text>
          <TextInput
            style={styles.bioInput}
            multiline
            textAlignVertical="top"
            placeholder={t("bio.placeholder")}
            placeholderTextColor="#A4A9B6"
            value={bioText}
            onChangeText={setBioText}
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>{t("bio.button")}</Text>
        </TouchableOpacity>
      </KeyboardSafeWrapper>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>5/6</Text>
        <View style={styles.navArrowsContainer}>
          <TouchableOpacity style={styles.arrowButton} onPress={() => navigation.goBack()}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
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
  backBtn: {
    padding: wp("5%"),
    width: wp("20%"),
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
    width: wp("10%"),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp("8%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("3%"),
  },
  textSection: {
    marginBottom: hp("3%"),
  },
  mainHeading: {
    color: "#965541",
    fontSize: wp("8%"),
    lineHeight: wp("10.5%"),
    marginBottom: hp("2%"),
  },
  subHeading: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
    lineHeight: wp("6%"),
    opacity: 0.9,
  },
  inputSection: {
    marginBottom: hp("3%"),
  },
  inputLabel: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginBottom: hp("1.5%"),
  },
  bioInput: {
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    padding: wp("4%"),
    minHeight: hp("20%"),
    color: "#000000",
    fontSize: wp("4%"),
    backgroundColor: "#FFFFFF",
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
    width: "85%",
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

export default BioScreen;