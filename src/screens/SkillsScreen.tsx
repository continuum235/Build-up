import React from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
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
import { hasAtLeastOne } from "../utils/validation";
import { useApi } from "../services/api";

const suggestedSkills = ["Skill 1", "Skill 2", "Skill 3", "Skill 4"];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SkillsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, addSkill, removeSkill } = useProfile();
  const { t } = useLanguage();
  const { updateProfile } = useApi();
  const { skills } = profile;
  const [saving, setSaving] = React.useState(false);

  const handleAddSkill = (skill: string) => {
    if (skills.length >= 3) {
      alert(t("validation.maxSkills"));
      return;
    }
    addSkill(skill);
  };

  const handleNext = async () => {
    if (!hasAtLeastOne(skills)) {
      alert(t("validation.addSkill"));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ skills });
    } catch {
      // optimistic
    } finally {
      setSaving(false);
    }
    navigation.navigate(routes.bio);
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
          <Text style={styles.mainHeading}>{t("skills.heading")}</Text>
          <Text style={styles.subHeading}>{t("skills.subtitle")}</Text>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.skillsLabel}>{t("skills.suggested")}</Text>
          <View style={styles.skillsRow}>
            {suggestedSkills.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    isSelected && styles.skillChipSelected,
                  ]}
                  onPress={() =>
                    isSelected ? removeSkill(skill) : handleAddSkill(skill)
                  }
                >
                  <Text
                    style={[
                      styles.skillChipText,
                      isSelected && styles.skillChipTextSelected,
                    ]}
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {skills.length > 0 && (
            <Text style={styles.selectedCount}>
              {skills.length}/3 {t("skills.selected")}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {saving ? (
          <ActivityIndicator size="large" color="#965541" />
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{t("skills.continue")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SkillsScreen;

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
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  subHeading: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    lineHeight: wp("5.5%"),
    opacity: 0.8,
  },
  skillsSection: {
    marginBottom: hp("4%"),
  },
  skillsLabel: {
    color: "#965541",
    fontSize: wp("4%"),
    fontWeight: "600",
    marginBottom: hp("2%"),
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    borderColor: "#965541",
    borderRadius: wp("3%"),
    borderWidth: 1.5,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    marginRight: wp("3%"),
    marginBottom: hp("2%"),
  },
  skillChipSelected: {
    backgroundColor: "#965541",
  },
  skillChipText: {
    color: "#965541",
    fontSize: wp("4%"),
    fontWeight: "700",
  },
  skillChipTextSelected: {
    color: "#FFFFFF",
  },
  selectedCount: {
    color: "#965541",
    fontSize: wp("3.5%"),
    fontWeight: "600",
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
