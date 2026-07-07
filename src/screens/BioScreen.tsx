import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
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
import { isValidBio } from "../utils/validation";
import { useApi } from "../services/api";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";
import TextInput from "../components/ui/TextInput";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BioScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, setBio } = useProfile();
  const { t } = useLanguage();
  const { updateProfile } = useApi();
  const [bioText, setBioText] = useState<string>(profile.bio);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!isValidBio(bioText)) {
      alert(t("validation.bioLength"));
      return;
    }
    setBio(bioText);
    setSaving(true);
    try {
      await updateProfile({ bio: bioText });
    } catch {
      // optimistic
    } finally {
      setSaving(false);
    }
    navigation.navigate(routes.hourlyRate);
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
          <Text style={styles.mainHeading}>{t("bio.heading")}</Text>
          <Text style={styles.subHeading}>{t("bio.subtitle")}</Text>
        </View>

        <TextInput
          placeholder={t("bio.placeholder")}
          value={bioText}
          onChangeText={setBioText}
          multiline
          style={styles.bioInput}
        />
        <Text style={styles.charCount}>
          {bioText.length}/100 {t("bio.minChars")}
        </Text>

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

export default BioScreen;

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
    marginBottom: hp("4%"),
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
  bioInput: {
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    padding: wp("4%"),
    color: "#000000",
    fontSize: wp("4%"),
    minHeight: hp("20%"),
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
  },
  charCount: {
    color: "#A4A9B6",
    fontSize: wp("3.2%"),
    marginTop: hp("1%"),
    marginBottom: hp("3%"),
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
