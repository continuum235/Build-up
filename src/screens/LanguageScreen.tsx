import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
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
import { hasAtLeastOne } from "../utils/validation";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, addLanguage, removeLanguage } = useProfile();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState<string>("");
  const { languages } = profile;

  const handleAddLanguage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      return;
    }
    if (languages.length >= 3) {
      alert(t("validation.maxLanguages"));
      return;
    }
    addLanguage(trimmed);
    setInputText("");
  };

  const handleNext = () => {
    if (!hasAtLeastOne(languages)) {
      alert(t("validation.addLanguage"));
      return;
    }
    navigation.navigate(routes.skills);
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
            source={require("../../assets/Back-button.png")}
            resizeMode="contain"
            style={styles.backIcon}
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
          <Text style={styles.mainHeading}>{t("languages.heading")}</Text>
          <Text style={styles.subHeading}>{t("languages.subtitle")}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("languages.label")}</Text>
          <Text style={styles.inputNote}>{t("languages.note")}</Text>

          <View style={styles.chipInputContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.chip}
                onPress={() => removeLanguage(lang)}
              >
                <Text style={styles.chipText}>{lang}</Text>
                <Image
                  source={require("../../assets/Drop-down-arrow.png")}
                  style={styles.chipIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}

            {languages.length < 3 && (
              <TextInput
                style={styles.textInput}
                placeholder={t("languages.placeholder")}
                placeholderTextColor="#A4A9B6"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddLanguage}
              />
            )}
          </View>

          {languages.length < 3 && (
            <View style={styles.addLanguageRow}>
              <TouchableOpacity
                style={[
                  styles.addLanguageButton,
                  !inputText.trim() && styles.addLanguageButtonDisabled,
                ]}
                onPress={handleAddLanguage}
                disabled={!inputText.trim()}
              >
                <Text style={styles.addLanguageButtonText}>
                  {t("languages.addButton")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.addButton} onPress={handleNext}>
          <Text style={styles.addButtonText}>{t("languages.button")}</Text>
        </TouchableOpacity>
      </KeyboardSafeWrapper>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>3/6</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../assets/Back-button.png")}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
            <Image
              source={require("../../assets/Next-page-logo.png")}
              style={styles.navIcon}
              resizeMode="contain"
            />
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
    lineHeight: wp("10%"),
    marginBottom: hp("2%"),
  },
  subHeading: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    lineHeight: wp("5.5%"),
    opacity: 0.8,
  },
  inputSection: {
    marginBottom: hp("2%"),
  },
  inputLabel: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginBottom: hp("0.5%"),
  },
  inputNote: {
    color: "#666",
    fontSize: wp("3.2%"),
    marginBottom: hp("1.5%"),
  },
  chipInputContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    padding: wp("3%"),
    minHeight: hp("7%"),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    marginRight: wp("2%"),
    marginBottom: hp("1%"),
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    marginRight: wp("2%"),
  },
  chipIcon: {
    width: wp("3.5%"),
    height: wp("3.5%"),
    tintColor: "#FFFFFF",
    transform: [{ rotate: "-90deg" }],
  },
  textInput: {
    flex: 1,
    minWidth: wp("20%"),
    color: "#000000",
    fontSize: wp("4%"),
    paddingVertical: hp("1%"),
    marginBottom: hp("1%"),
  },
  addLanguageRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: hp("1%"),
  },
  addLanguageButton: {
    backgroundColor: "#965541",
    borderRadius: wp("3.5%"),
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("5%"),
  },
  addLanguageButtonDisabled: {
    opacity: 0.5,
  },
  addLanguageButtonText: {
    color: "#FFFFFF",
    fontSize: wp("3.6%"),
    fontWeight: "600",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
    marginBottom: hp("2%"),
  },
  addButtonText: {
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
    width: "65%",
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
  arrowButton: {
    backgroundColor: "#965541",
    width: wp("12%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("2%"),
    marginLeft: wp("2%"),
  },
  navIcon: {
    width: wp("6%"),
    height: wp("6%"),
    tintColor: "#FFFFFF",
  },
});

export default LanguageScreen;
