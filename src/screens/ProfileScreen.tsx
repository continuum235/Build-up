import React from "react";
import { View, ScrollView, Text, Image, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BottomNavigation from "../components/BottomNavigation";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { profile } = useProfile();
  const { t } = useLanguage();
  const isEmployer = profile.roleType === "employer";
  const displayName = profile.auth.name || "User";
  const location = [profile.details.city, profile.details.country].filter(Boolean).join(", ");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t("profile.viewTitle")}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileIntro}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>{profile.roleTitle || t("profile.roleFallback")}</Text>
            <Text style={styles.type}>
              {isEmployer ? t("profile.hirer") : t("profile.employee")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.detailsTitle")}</Text>
          <Text style={styles.detailText}>{location || t("profile.locationFallback")}</Text>
          <Text style={styles.detailText}>{profile.auth.email || t("profile.emailFallback")}</Text>
        </View>

        {!isEmployer && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("profile.skillsTitle")}</Text>
              <Text style={styles.detailText}>
                {profile.skills.length ? profile.skills.join(", ") : t("profile.skillsFallback")}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("profile.rateTitle")}</Text>
              <Text style={styles.detailText}>
                {profile.hourlyRate ? `₹${profile.hourlyRate}/hr` : t("profile.rateFallback")}
              </Text>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.documentsTitle")}</Text>
          <View style={styles.documentRow}>
            {Object.entries(profile.documents).map(([key, uploaded]) => (
              <View
                key={key}
                style={[styles.documentBadge, uploaded && styles.documentBadgeActive]}
              >
                <Image
                  source={require("../../assets/Upload.png")}
                  resizeMode="contain"
                  style={[styles.documentIcon, uploaded && styles.documentIconActive]}
                />
                <Text style={[styles.documentText, uploaded && styles.documentTextActive]}>
                  {uploaded ? t("common.uploaded") : t("common.upload")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
  },
  headerTitle: {
    color: "#1E1E1E",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp("6%"),
    paddingBottom: hp("4%"),
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("2%"),
    marginBottom: hp("2%"),
  },
  avatarCircle: {
    width: wp("22%"),
    height: wp("22%"),
    borderRadius: wp("11%"),
    backgroundColor: "#F3C2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("4%"),
  },
  avatarText: {
    color: "#7A3D64",
    fontSize: wp("8%"),
    fontWeight: "bold",
  },
  profileIntro: {
    flex: 1,
  },
  name: {
    color: "#1E1E1E",
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("0.5%"),
  },
  role: {
    color: "#965541",
    fontSize: wp("4%"),
    fontWeight: "700",
    marginBottom: hp("0.5%"),
  },
  type: {
    color: "#6F7685",
    fontSize: wp("3.5%"),
  },
  section: {
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: wp("3%"),
    padding: wp("4%"),
    marginBottom: hp("2%"),
  },
  sectionTitle: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
  },
  detailText: {
    color: "#4C5260",
    fontSize: wp("3.8%"),
    lineHeight: wp("5.5%"),
    marginBottom: hp("0.5%"),
  },
  documentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp("2%"),
  },
  documentBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderWidth: 1,
    borderRadius: wp("3%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
  },
  documentBadgeActive: {
    borderColor: "#965541",
    backgroundColor: "#FFF5F0",
  },
  documentIcon: {
    width: wp("4%"),
    height: wp("4%"),
    tintColor: "#A4A9B6",
    marginRight: wp("1.5%"),
  },
  documentIconActive: {
    tintColor: "#965541",
  },
  documentText: {
    color: "#6F7685",
    fontSize: wp("3%"),
    fontWeight: "700",
  },
  documentTextActive: {
    color: "#965541",
  },
});

export default ProfileScreen;
