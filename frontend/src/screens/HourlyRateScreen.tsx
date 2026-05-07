import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isValidHourlyRate } from "../utils/validation";
import KeyboardSafeWrapper from "../components/KeyboardSafeWrapper";

const HourlyRateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, setHourlyRate } = useProfile();
  const { t } = useLanguage();
  const [rate, setRate] = useState<string>(profile.hourlyRate || "15");

  const handleNext = () => {
    if (!isValidHourlyRate(rate)) {
      alert(t("validation.validRate"));
      return;
    }
    setHourlyRate(rate);
    navigation.navigate(routes.enterDetails);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <View style={styles.backIconPlaceholder}>
            <Text style={styles.backIconText}>U</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.headerTitle")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardSafeWrapper scrollStyle={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.textSection}>
          <Text style={styles.mainHeading}>{t("hourlyRate.heading")}</Text>
          <Text style={styles.subHeading}>{t("hourlyRate.subtitle")}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("hourlyRate.label")}</Text>
          <Text style={styles.inputNote}>{t("hourlyRate.note")}</Text>

          <View style={styles.rateRow}>
            <View style={styles.rateInputWrapper}>
              <Text style={styles.ratePrefix}>₹</Text>
              <TextInput
                style={styles.rateInput}
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#A4A9B6"
              />
            </View>
            <Text style={styles.rateSuffix}>/hr</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>{t("hourlyRate.button")}</Text>
        </TouchableOpacity>
      </KeyboardSafeWrapper>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>6/6</Text>
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
  backIconPlaceholder: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backIconText: {
    fontSize: wp("5%"),
    fontWeight: "bold",
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
    marginBottom: hp("4%"),
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
    marginBottom: hp("0.5%"),
  },
  inputNote: {
    color: "#1E1E1E",
    fontSize: wp("3.6%"),
    opacity: 0.7,
    marginBottom: hp("1.5%"),
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.4%"),
    flex: 1,
  },
  ratePrefix: {
    fontSize: wp("4.5%"),
    color: "#1E1E1E",
    marginRight: wp("2%"),
    fontWeight: "bold",
  },
  rateInput: {
    flex: 1,
    fontSize: wp("4.5%"),
    color: "#1E1E1E",
  },
  rateSuffix: {
    marginLeft: wp("4%"),
    fontSize: wp("4.5%"),
    color: "#1E1E1E",
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

export default HourlyRateScreen;