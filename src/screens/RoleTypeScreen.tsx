import React, { useState } from "react";
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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

const RoleTypeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, setRoleType } = useProfile();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>(profile.roleType);

  const handleSelect = (roleType: string) => {
    setSelectedRole(roleType);
    setRoleType(roleType);
    
    if (roleType === "employer") {
      navigation.navigate(routes.employerRoleTitle);
    } else {
      navigation.navigate(routes.roleTitle);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Image source={require("../../assets/Back-button.png")} resizeMode="contain" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.headerTitle")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.textSection}>
          <Text style={styles.mainQuestion}>{t("roleType.question")}</Text>
          <Text style={styles.subText}>{t("roleType.subtitle")}</Text>
        </View>

        <View style={styles.cardsSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.card, selectedRole === "jobSeeker" && styles.cardSelected]}
            onPress={() => handleSelect("jobSeeker")}
          >
            <Image source={require("../../assets/Search.png")} resizeMode="contain" style={styles.cardIcon} />
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>{t("roleType.jobSeekerTitle")}</Text>
              <Text style={styles.cardDesc}>{t("roleType.jobSeekerDesc")}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.card, selectedRole === "employer" && styles.cardSelected]}
            onPress={() => handleSelect("employer")}
          >
            <Image source={require("../../assets/Edit.png")} resizeMode="contain" style={styles.cardIcon} />
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>{t("roleType.employerTitle")}</Text>
              <Text style={styles.cardDesc}>{t("roleType.employerDesc")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
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
    paddingHorizontal: wp("8%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("5%"),
  },
  textSection: {
    marginBottom: hp("5%"),
  },
  mainQuestion: {
    color: "#965541",
    fontSize: wp("8%"),
    fontWeight: "bold",
    lineHeight: wp("10%"),
    marginBottom: hp("1.5%"),
  },
  subText: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
    lineHeight: wp("6%"),
    opacity: 0.8,
  },
  cardsSection: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#A4A9B6",
    borderRadius: wp("5%"),
    borderWidth: 2,
    paddingVertical: hp("3%"),
    paddingHorizontal: wp("5%"),
    marginBottom: hp("2.5%"),
  },
  cardSelected: {
    borderColor: "#965541",
    backgroundColor: "#FFF5F0",
  },
  cardIcon: {
    width: wp("12%"),
    height: wp("12%"),
    marginRight: wp("4%"),
  },
  cardTextContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    color: "#965541",
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("0.5%"),
  },
  cardDesc: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
  },
  progressContainer: {
    backgroundColor: "#F2E1DA",
    width: "100%",
    height: hp("0.6%"),
  },
  progressTrack: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: "100%",
  },
  progressFill: {
    backgroundColor: "#965541",
    width: "33%",
    height: "100%",
    borderRadius: wp("1%"),
  },
});

export default RoleTypeScreen;
