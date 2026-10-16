import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
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
import { detailsSchema } from "../utils/schemas";
import KeyboardSafeWrapper from "../components/layout/KeyboardSafeWrapper";
import TextInput from "../components/ui/TextInput";
import CityDropdown from "../components/ui/CityDropdown";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EnterDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, setDetails, setRoleType } = useProfile();
  const { t } = useLanguage();
  const { updateProfile, getMe } = useApi();
  const [country] = useState<string>(profile.details.country);
  const [addressLine1, setAddressLine1] = useState<string>(
    profile.details.addressLine1,
  );
  const [addressLine2, setAddressLine2] = useState<string>(
    profile.details.addressLine2,
  );
  const [city, setCity] = useState<string>(profile.details.city);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const parseResult = detailsSchema.safeParse({ addressLine1, addressLine2, city });
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((e) => {
        const field = e.path[0] as string;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const updatedDetails = { country, addressLine1, addressLine2, city };
    setDetails(updatedDetails);
    setSubmitting(true);

    try {
      let dbRole =
        profile.roleType === "employer"
          ? "HIRER"
          : profile.roleType === "jobSeeker" || profile.roleType === "worker"
            ? "WORKER"
            : undefined;

      if (!dbRole) {
        const { user } = await getMe();
        if (user.role === "HIRER" || user.role === "WORKER") {
          dbRole = user.role;
          setRoleType(user.role === "HIRER" ? "employer" : "jobSeeker");
        }
      }

      if (!dbRole) {
        alert("Please choose whether you want to hire or find jobs first.");
        navigation.navigate(routes.roleType);
        return;
      }

      await updateProfile({
        role: dbRole,
        roleTitle: profile.roleTitle,
        documents: profile.documents,
        languages: profile.languages,
        skills: profile.skills,
        bio: profile.bio,
        country: updatedDetails.country,
        addressLine1: updatedDetails.addressLine1,
        addressLine2: updatedDetails.addressLine2,
        city: updatedDetails.city,
        onboardingComplete: true,
      });

      const destRoute = dbRole === "HIRER" ? routes.jobBoard : routes.findJobs;
      navigation.reset({
        index: 0,
        routes: [{ name: destRoute }],
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save profile. Please check your connection and try again.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
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
            source={require("../../assets/Profile-logo.png")}
            resizeMode="contain"
            style={styles.profileIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("details.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardSafeWrapper
        scrollStyle={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.textSection}>
          <Text style={styles.mainHeading}>{t("details.heading")}</Text>
          <Text style={styles.subHeading}>{t("details.subtitle")}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>{t("details.country")}</Text>
          <TextInput
            placeholder={t("details.countryPlaceholder")}
            value={country}
            editable={false}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>{t("details.address1")}</Text>
          <TextInput
            placeholder={t("details.address1Placeholder")}
            value={addressLine1}
            onChangeText={setAddressLine1}
            style={styles.input}
            error={errors.addressLine1}
          />

          <Text style={styles.inputLabel}>{t("details.address2")}</Text>
          <TextInput
            placeholder={t("details.address2Placeholder")}
            value={addressLine2}
            onChangeText={setAddressLine2}
            style={styles.input}
          />

          <CityDropdown
            label={t("details.city")}
            value={city}
            onChange={setCity}
            placeholder="Select your city"
            error={errors.city}
          />
        </View>

        <View style={{ flex: 1 }} />

        {submitting ? (
          <View style={styles.submittingContainer}>
            <ActivityIndicator size="large" color="#965541" />
            <Text style={styles.submittingText}>Saving profile...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>{t("details.submit")}</Text>
          </TouchableOpacity>
        )}
      </KeyboardSafeWrapper>
    </SafeAreaView>
  );
};

export default EnterDetailsScreen;

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
  profileIcon: {
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
  formSection: {
    marginBottom: hp("4%"),
  },
  inputLabel: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
    marginTop: hp("2%"),
  },
  input: {
    fontSize: wp("4%"),
    borderRadius: wp("3%"),
    borderWidth: 1,
    borderColor: "#D8DADC",
    padding: wp("4%"),
  },
  submitBtn: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2.2%"),
    width: "100%",
    marginBottom: hp("2%"),
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  submittingContainer: {
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  submittingText: {
    color: "#965541",
    fontSize: wp("4%"),
    marginTop: hp("1%"),
  },
});
