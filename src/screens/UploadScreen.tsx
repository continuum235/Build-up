import React from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
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

const UploadScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, toggleDocument } = useProfile();
  const { t } = useLanguage();
  const { documents } = profile;

  const canContinue = documents.aadhaar || documents.doc1 || documents.doc2;

  const handleContinue = () => {
    if (!canContinue) {
      alert(t("validation.uploadDoc"));
      return;
    }
    navigation.navigate(routes.languages);
  };

  const renderUploadButton = (key: keyof typeof documents) => {
    const uploaded = documents[key];
    return (
      <TouchableOpacity
        style={[styles.uploadBtn, uploaded && styles.uploadBtnActive]}
        onPress={() => toggleDocument(key)}
      >
        <Image
          source={require("../../assets/Upload.png")}
          resizeMode="contain"
          style={[styles.uploadIcon, uploaded && styles.uploadIconActive]}
        />
        <Text style={[styles.uploadBtnText, uploaded && styles.uploadBtnTextActive]}>
          {uploaded ? t("common.uploaded") : t("common.upload")}
        </Text>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>{t("upload.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Image
            source={require("../../assets/Search.png")}
            resizeMode="contain"
            style={styles.heroIcon}
          />
          <Text style={styles.title}>{t("upload.heroTitle")}</Text>
          <Text style={styles.subtitle}>{t("upload.heroSubtitle")}</Text>
        </View>

        <View style={styles.uploadSection}>
          <View style={styles.uploadRow}>
            <Text style={styles.documentName}>{t("upload.aadhaar")}</Text>
            {renderUploadButton("aadhaar")}
          </View>

          <View style={styles.uploadRow}>
            <Text style={styles.documentName}>{t("upload.otherDoc")}</Text>
            {renderUploadButton("doc1")}
          </View>

          <View style={styles.uploadRow}>
            <Text style={styles.documentName}>{t("upload.otherDoc")}</Text>
            {renderUploadButton("doc2")}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>{t("upload.continue")}</Text>
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
    paddingHorizontal: wp("8%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("5%"),
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: wp("6%"),
    paddingVertical: hp("4%"),
    paddingHorizontal: wp("6%"),
    marginBottom: hp("4%"),
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
  uploadSection: {
    marginBottom: hp("5%"),
  },
  uploadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2.5%"),
  },
  documentName: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    flex: 1,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#965541",
    borderRadius: wp("4%"),
    borderWidth: 2,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("6%"),
  },
  uploadBtnActive: {
    backgroundColor: "#965541",
  },
  uploadIcon: {
    width: wp("5%"),
    height: wp("5%"),
    marginRight: wp("2%"),
    tintColor: "#965541",
  },
  uploadIconActive: {
    tintColor: "#FFFFFF",
  },
  uploadBtnText: {
    color: "#965541",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
  },
  uploadBtnTextActive: {
    color: "#FFFFFF",
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

export default UploadScreen;
