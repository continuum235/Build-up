import React from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import routes, { RouteName } from "../navigation/routes";
import { useLanguage } from "../context/LanguageContext";

const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { language, setLanguage, t } = useLanguage();

  const nextRoute: RouteName = route.params?.next || routes.login;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <View style={styles.backIconPlaceholder}>
            <Text style={styles.backIconText}>U</Text>
          </View>
        </TouchableOpacity> */}
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/Back-button.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("languageSelection.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.textSection}>
          <Text style={styles.mainHeading}>{t("languageSelection.title")}</Text>
          <Text style={styles.subHeading}>{t("languageSelection.subtitle")}</Text>
        </View>

        <View style={styles.cardSection}>
          <TouchableOpacity
            style={[styles.languageCard, language === "en" && styles.languageCardSelected]}
            onPress={() => setLanguage("en")}
          >
            <Text style={styles.languageTitle}>{t("languageSelection.english")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageCard, language === "hi" && styles.languageCardSelected]}
            onPress={() => setLanguage("hi")}
          >
            <Text style={styles.languageTitle}>{t("languageSelection.hindi")}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate(nextRoute)}
        >
          <Text style={styles.primaryButtonText}>{t("languageSelection.continue")}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    textAlign: "center",
  },
  headerSpacer: {
    width: wp("10%"),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp("8%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("4%"),
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
  cardSection: {
    gap: hp("2%"),
  },
  languageCard: {
    borderColor: "#D8DADC",
    borderWidth: 1.5,
    borderRadius: wp("4%"),
    paddingVertical: hp("2.6%"),
    paddingHorizontal: wp("6%"),
    backgroundColor: "#FFFFFF",
  },
  languageCardSelected: {
    borderColor: "#965541",
    backgroundColor: "#FFF5F0",
  },
  languageTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
});

export default LanguageSelectionScreen;