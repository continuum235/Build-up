import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput as RNTextInput,
  Image,
  ActivityIndicator,
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
import { isValidHourlyRate } from "../utils/validation";
import { useApi } from "../services/api";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HourlyRateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, setHourlyRate } = useProfile();
  const { t } = useLanguage();
  const { updateProfile } = useApi();
  const [rate, setRate] = useState<string>(profile.hourlyRate || "15");
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!isValidHourlyRate(rate)) {
      alert(t("validation.validRate"));
      return;
    }
    setHourlyRate(rate);
    setSaving(true);
    try {
      await updateProfile({ hourlyRate: parseInt(rate, 10) });
    } catch {
      // optimistic
    } finally {
      setSaving(false);
    }
    navigation.navigate(routes.enterDetails);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../assets/Back-button.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.headerTitle")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardSafeWrapper
        scrollStyle={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.textSection}>
          <Text style={styles.mainHeading}>{t("hourlyRate.heading")}</Text>
          <Text style={styles.subHeading}>{t("hourlyRate.subtitle")}</Text>
        </View>

        <View style={styles.rateInputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <RNTextInput
            style={styles.rateInput}
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
            placeholder="15"
            placeholderTextColor="#A4A9B6"
          />
          <Text style={styles.rateSuffix}>/hr</Text>
        </View>

        <View style={{ flex: 1 }} />

        {saving ? (
          <ActivityIndicator size="large" color="#965541" />
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{t("common.next")}</Text>
          </TouchableOpacity>
        )}
      </KeyboardSafeWrapper>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HourlyRateScreen;

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
    padding: wp("1%"),
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
    marginBottom: hp("5%"),
  },
  mainHeading: {
    color: "#965541",
    fontSize: wp("7.5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  subHeading: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    lineHeight: wp("5.5%"),
    opacity: 0.8,
  },
  rateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("4%"),
  },
  currencySymbol: {
    color: "#965541",
    fontSize: wp("8%"),
    fontWeight: "bold",
    marginRight: wp("2%"),
  },
  rateInput: {
    borderBottomColor: "#D8DADC",
    borderBottomWidth: 2,
    color: "#965541",
    fontSize: wp("10%"),
    fontWeight: "bold",
    textAlign: "center",
    minWidth: wp("25%"),
    paddingVertical: hp("1%"),
  },
  rateSuffix: {
    color: "#A4A9B6",
    fontSize: wp("5%"),
    fontWeight: "600",
    marginLeft: wp("2%"),
  },
  nextBtn: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
    marginBottom: hp("2%"),
  },
  nextBtnText: {
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
    width: "55%",
    height: "100%",
    borderRadius: wp("1%"),
  },
});
