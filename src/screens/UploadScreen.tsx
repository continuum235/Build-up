import React from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
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
import { useApi } from "../services/api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UploadScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, toggleDocument } = useProfile();
  const { t } = useLanguage();
  const { updateProfile } = useApi();
  const { documents } = profile;
  const [saving, setSaving] = React.useState(false);

  const canContinue = documents.aadhaar || documents.doc1 || documents.doc2;

  const handleContinue = async () => {
    if (!canContinue) {
      alert(t("validation.uploadDoc"));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ documents });
    } catch {
      // optimistic
    } finally {
      setSaving(false);
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
        <Text
          style={[styles.uploadBtnText, uploaded && styles.uploadBtnTextActive]}
        >
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
        <Text style={styles.headerTitle}>{t("profile.headerTitle")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.textSection}>
          <Text style={styles.heading}>{t("upload.heading")}</Text>
          <Text style={styles.subHeading}>{t("upload.subtitle")}</Text>
        </View>

        <View style={styles.uploadSection}>
          {renderUploadButton("aadhaar")}
          {renderUploadButton("doc1")}
          {renderUploadButton("doc2")}
        </View>

        <View style={{ flex: 1 }} />

        {saving ? (
          <ActivityIndicator size="large" color="#965541" />
        ) : (
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>
              {t("common.continue")}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UploadScreen;

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
    paddingBottom: hp("5%"),
  },
  textSection: {
    marginBottom: hp("5%"),
  },
  heading: {
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
  uploadSection: {
    marginBottom: hp("4%"),
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingVertical: hp("4%"),
    marginBottom: hp("2.5%"),
    backgroundColor: "#FAFAFA",
  },
  uploadBtnActive: {
    borderColor: "#965541",
    backgroundColor: "#FFF5F0",
  },
  uploadIcon: {
    width: wp("6%"),
    height: wp("6%"),
    tintColor: "#A4A9B6",
    marginRight: wp("2%"),
  },
  uploadIconActive: {
    tintColor: "#965541",
  },
  uploadBtnText: {
    color: "#6F7685",
    fontSize: wp("4%"),
    fontWeight: "700",
  },
  uploadBtnTextActive: {
    color: "#965541",
  },
  continueBtn: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
    marginBottom: hp("2%"),
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
});
