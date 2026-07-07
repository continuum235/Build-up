import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput as RNTextInput,
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
import { hasAtLeastOne } from "../utils/validation";
import { useApi } from "../services/api";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, addLanguage, removeLanguage } = useProfile();
  const { t } = useLanguage();
  const { updateProfile } = useApi();
  const [inputText, setInputText] = useState<string>("");
  const [saving, setSaving] = useState(false);
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

  const handleNext = async () => {
    if (!hasAtLeastOne(languages)) {
      alert(t("validation.addLanguage"));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ languages });
    } catch {
      // optimistic
    } finally {
      setSaving(false);
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

        <View style={styles.inputRow}>
          <RNTextInput
            style={styles.textInput}
            placeholder={t("languages.placeholder")}
            placeholderTextColor="#A4A9B6"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddLanguage}>
            <Text style={styles.addBtnText}>{t("common.add")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipContainer}>
          {languages.map((lang) => (
            <View key={lang} style={styles.chip}>
              <Text style={styles.chipText}>{lang}</Text>
              <TouchableOpacity onPress={() => removeLanguage(lang)}>
                <Text style={styles.chipRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
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

export default LanguageScreen;

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
  inputRow: {
    flexDirection: "row",
    marginBottom: hp("2%"),
  },
  textInput: {
    flex: 1,
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    color: "#000000",
    fontSize: wp("4%"),
    backgroundColor: "#FFFFFF",
    marginRight: wp("2%"),
  },
  addBtn: {
    backgroundColor: "#965541",
    borderRadius: wp("3%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp("3%"),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderColor: "#965541",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("3%"),
    marginRight: wp("2%"),
    marginBottom: hp("1%"),
  },
  chipText: {
    color: "#965541",
    fontSize: wp("3.8%"),
    fontWeight: "700",
    marginRight: wp("2%"),
  },
  chipRemove: {
    color: "#965541",
    fontSize: wp("5%"),
    fontWeight: "bold",
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
