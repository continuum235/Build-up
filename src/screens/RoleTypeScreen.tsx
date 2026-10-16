import React, { useEffect, useState } from "react";
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
import { useApi, ApiError } from "../services/api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RoleTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, setRoleType } = useProfile();
  const { t } = useLanguage();
  const { updateProfile, getMe } = useApi();
  const [selectedRole, setSelectedRole] = useState<string>(profile.roleType);
  const [saving, setSaving] = useState(false);
  const [roleLocked, setRoleLocked] = useState(false);
  const [lockedRole, setLockedRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    // Never block the screen for longer than 5s — a cold backend must not
    // leave the user staring at an empty screen.
    const tooSlow = new Promise<void>((resolve) => setTimeout(resolve, 5000));
    Promise.race([
      getMe()
        .then(({ user }) => {
          if (!active) return;
          if (user.role && user.onboardingComplete) {
            // Role is locked — user should not be here
            setRoleLocked(true);
            setLockedRole(user.role as string);
          }
        })
        .catch(() => {
          // Backend unreachable — allow selection (will enforce server-side)
        }),
      tooSlow,
    ]).finally(() => {
      if (active) setChecking(false);
    });
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showLockedRole = async () => {
    try {
      const { user } = await getMe();
      setLockedRole((user.role as string) ?? null);
    } catch {
      setLockedRole(null);
    }
    setChecking(false);
    setRoleLocked(true);
  };

  const handleSelect = async (roleType: string) => {
    setSelectedRole(roleType);
    setRoleType(roleType);

    const dbRole = roleType === "employer" ? "HIRER" : "WORKER";
    setSaving(true);
    try {
      await updateProfile({ role: dbRole });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // Role is already set to something else — stop before the user
        // walks into an onboarding flow that can never be saved.
        setSaving(false);
        await showLockedRole();
        return;
      }
      // optimistic — data still saved in ProfileContext
    } finally {
      setSaving(false);
    }

    if (roleType === "employer") {
      navigation.navigate(routes.employerRoleTitle);
    } else {
      navigation.navigate(routes.roleTitle);
    }
  };

  if (checking) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#965541" />
      </SafeAreaView>
    );
  }

  if (roleLocked) {
    const roleLabel =
      lockedRole === "HIRER"
        ? "Employer / Hirer"
        : lockedRole === "WORKER"
          ? "Job Seeker / Worker"
          : "a BuildUp member";
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>Role Already Set</Text>
          <Text style={styles.lockedBody}>
            Your account is registered as{" "}
            <Text style={styles.lockedRoleText}>{roleLabel}</Text>.
            {"\n\n"}Roles cannot be changed after onboarding. If you believe
            this is a mistake or need to switch roles, please contact our
            support team.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => {
              // Navigate to main screen
              const dest = lockedRole === "HIRER" ? routes.jobBoard : routes.findJobs;
              navigation.reset({ index: 0, routes: [{ name: dest }] });
            }}
          >
            <Text style={styles.supportButtonText}>Go to my account</Text>
          </TouchableOpacity>
          <Text style={styles.supportEmail}>support@buildup.app</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.navigate(routes.welcome)}
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
        {saving && (
          <ActivityIndicator size="small" color="#965541" style={{ marginBottom: hp("2%") }} />
        )}

        <View style={styles.textSection}>
          <Text style={styles.mainQuestion}>{t("roleType.question")}</Text>
          <Text style={styles.subText}>{t("roleType.subtitle")}</Text>
        </View>

        <View style={styles.cardsSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.card,
              selectedRole === "jobSeeker" && styles.cardSelected,
            ]}
            onPress={() => handleSelect("jobSeeker")}
          >
            <Image
              source={require("../../assets/Search.png")}
              resizeMode="contain"
              style={styles.cardIcon}
            />
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>
                {t("roleType.jobSeekerTitle")}
              </Text>
              <Text style={styles.cardDesc}>{t("roleType.jobSeekerDesc")}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.card,
              selectedRole === "employer" && styles.cardSelected,
            ]}
            onPress={() => handleSelect("employer")}
          >
            <Image
              source={require("../../assets/Edit.png")}
              resizeMode="contain"
              style={styles.cardIcon}
            />
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>
                {t("roleType.employerTitle")}
              </Text>
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

export default RoleTypeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  // ── Locked role screen ──
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("10%"),
    paddingVertical: hp("6%"),
  },
  lockedIcon: {
    fontSize: wp("15%"),
    marginBottom: hp("3%"),
  },
  lockedTitle: {
    color: "#1E1E1E",
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
  },
  lockedBody: {
    color: "#4C5260",
    fontSize: wp("4%"),
    lineHeight: wp("6%"),
    textAlign: "center",
    marginBottom: hp("4%"),
  },
  lockedRoleText: {
    color: "#965541",
    fontWeight: "bold",
  },
  supportButton: {
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("10%"),
    marginBottom: hp("2%"),
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: wp("4.2%"),
    fontWeight: "bold",
  },
  supportEmail: {
    color: "#965541",
    fontSize: wp("3.5%"),
    textDecorationLine: "underline",
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
