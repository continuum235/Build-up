import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import routes from "../navigation/routes";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

const EmployerRoleTitleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profile, setRoleTitle, addSkill } = useProfile();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>(profile.roleTitle || "");
  const [currentStep, setCurrentStep] = useState(1);
  const [maxSteps] = useState(3);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const professionalRoles = [
    "Builder",
    "Contractor",
    "Architect",
    "Engineer",
    "Project Manager",
    "Surveyor",
    "Electrician",
    "Plumber",
    "Mason",
    "Carpenter",
    "Painter",
    "Laborer",
  ];

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setDropdownVisible(false);
  };

  const handleAddExpertise = () => {
    if (selectedRole) {
      // Store the role title
      setRoleTitle(selectedRole);
      // Move to next step
      if (currentStep < maxSteps) {
        setCurrentStep(currentStep + 1);
        setSelectedRole("");
      } else {
        // All expertise added, move to next screen
        navigation.navigate(routes.languages);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
      setSelectedRole("");
    } else {
      navigation.navigate(routes.languages);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
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
          <Text style={styles.mainQuestion}>{t("employerRole.question")}</Text>
          <Text style={styles.subText}>{t("employerRole.subtitle")}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>{t("employerRole.label")}</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownVisible(!dropdownVisible)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, !selectedRole && styles.placeholderText]}>
              {selectedRole || t("employerRole.placeholder")}
            </Text>
            <Text style={styles.dropdownIcon}>{dropdownVisible ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={styles.dropdownMenu}>
                <FlatList
                  data={professionalRoles}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectRole(item)}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled
                  nestedScrollEnabled
                  maxToRenderPerBatch={10}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.addButton, !selectedRole && styles.addButtonDisabled]}
          onPress={handleAddExpertise}
          disabled={!selectedRole}
        >
          <Text style={styles.addButtonText}>{t("common.addExpertise")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(currentStep / maxSteps) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>
          {currentStep}/{maxSteps}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevious}>
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
    fontSize: hp("2.2%"),
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: wp("8%"),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
  },
  textSection: {
    marginBottom: hp("3%"),
  },
  mainQuestion: {
    fontSize: hp("2.8%"),
    fontWeight: "700",
    color: "#A85B47",
    marginBottom: hp("1%"),
    lineHeight: hp("3.5%"),
  },
  subText: {
    fontSize: hp("1.8%"),
    color: "#4B5563",
    lineHeight: hp("2.5%"),
  },
  formSection: {
    marginBottom: hp("3%"),
  },
  inputLabel: {
    fontSize: hp("1.8%"),
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: hp("1.5%"),
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: wp("3%"),
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.8%"),
    backgroundColor: "#F9FAFB",
  },
  dropdownText: {
    fontSize: hp("1.8%"),
    color: "#1F2937",
    fontWeight: "500",
  },
  placeholderText: {
    color: "#A4A9B6",
  },
  dropdownIcon: {
    fontSize: hp("2%"),
    color: "#A85B47",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    maxHeight: hp("50%"),
    borderTopLeftRadius: wp("5%"),
    borderTopRightRadius: wp("5%"),
    paddingVertical: hp("1%"),
  },
  dropdownItem: {
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: hp("1.8%"),
    color: "#1F2937",
  },
  addButton: {
    backgroundColor: "#A85B47",
    paddingVertical: hp("2%"),
    borderRadius: wp("3%"),
    alignItems: "center",
    marginVertical: hp("2%"),
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: hp("1.9%"),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressContainer: {
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1%"),
  },
  progressTrack: {
    height: hp("0.5%"),
    backgroundColor: "#E5E7EB",
    borderRadius: wp("1%"),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A85B47",
    borderRadius: wp("1%"),
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  stepText: {
    fontSize: hp("1.8%"),
    fontWeight: "600",
    color: "#A85B47",
  },
  arrowButton: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
  },
  arrowText: {
    fontSize: hp("2.5%"),
    fontWeight: "700",
    color: "#A85B47",
  },
});

export default EmployerRoleTitleScreen;
