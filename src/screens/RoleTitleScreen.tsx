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
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { isNonEmpty } from "../utils/validation";
import KeyboardSafeWrapper from "../components/KeyboardSafeWrapper";

const RoleTitleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, setRoleTitle } = useProfile();
  const { t } = useLanguage();
  const [roleTitle, setRoleTitleInput] = useState<string>(profile.roleTitle);

  const handleNext = () => {
    if (!isNonEmpty(roleTitle)) {
      alert(t("validation.enterRole"));
      return;
    }
    setRoleTitle(roleTitle.trim());
    navigation.navigate(routes.upload);
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
          <Text style={styles.mainHeading}>{t("roleTitle.heading")}</Text>
          <Text style={styles.subHeading}>{t("roleTitle.subtitle")}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t("roleTitle.label")}</Text>
          <TextInput
            style={styles.inputBox}
            placeholder={t("roleTitle.placeholder")}
            placeholderTextColor="#A4A9B6"
            value={roleTitle}
            onChangeText={setRoleTitleInput}
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.addButton} onPress={handleNext}>
          <Text style={styles.addButtonText}>{t("roleTitle.button")}</Text>
        </TouchableOpacity>
      </KeyboardSafeWrapper>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>2/6</Text>
        <View style={{ flexDirection: "row" }}>
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
    marginBottom: hp("4%"),
  },
  inputLabel: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginBottom: hp("1.5%"),
  },
  inputBox: {
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    color: "#000000",
    fontSize: wp("4%"),
    backgroundColor: "#FFFFFF",
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
    width: "55%",
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
  arrowText: {
    color: "#FFFFFF",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
});

export default RoleTitleScreen;
