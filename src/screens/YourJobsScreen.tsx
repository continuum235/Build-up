import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import routes from "../navigation/routes";
import jobsData from "../data/jobsSeedData.json";
import BottomNavigation from "../components/BottomNavigation";
import { useLanguage } from "../context/LanguageContext";

const VerifiedIcon = require("../../assets/tick.png");
const LocationIcon = require("../../assets/location.png");
const ChatIcon = require("../../assets/message.png");

interface YourJobsScreenProps {
  navigation: any;
}

type JobTab = "Sent Proposals" | "Active Jobs" | "Completed Jobs";
type JobStatus = "Accepted" | "standby" | "Rejected" | "Active" | "Completed";
type SupportedLanguage = "en" | "hi";

interface JobCardData {
  id: number;
  status: JobStatus;
  source: (typeof jobsData.jobs)[number];
  company: string;
  verified: boolean;
  location: string;
  budget: string;
  showChat: boolean;
}

const buildJobCard = (
  job: (typeof jobsData.jobs)[number],
  status: JobStatus,
  showChat: boolean,
): JobCardData => ({
  id: job.id,
  status,
  source: job,
  company: job.company,
  verified: job.verified,
  location: job.location,
  budget: `$${job.budget}`,
  showChat,
});

const YourJobsScreen: React.FC<YourJobsScreenProps> = ({ navigation }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<JobTab>("Sent Proposals");
  const currentLanguage = language as SupportedLanguage;

  const jobsByTab: Record<JobTab, JobCardData[]> = {
    "Sent Proposals": [
      buildJobCard(jobsData.jobs[0], "Accepted", true),
      buildJobCard(jobsData.jobs[1], "standby", false),
      buildJobCard(jobsData.jobs[2], "Rejected", false),
    ],
    "Active Jobs": [
      buildJobCard(jobsData.jobs[0], "Active", true),
      buildJobCard(jobsData.jobs[3], "standby", true),
      buildJobCard(jobsData.jobs[4], "Accepted", true),
    ],
    "Completed Jobs": [
      buildJobCard(jobsData.jobs[1], "Completed", false),
      buildJobCard(jobsData.jobs[5], "Completed", false),
      buildJobCard(jobsData.jobs[8], "Completed", false),
    ],
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "active":
      case "completed":
        return "#34C759";
      case "standby":
        return "#FF9500";
      case "rejected":
        return "#FF3B30";
      default:
        return "#D8DADC";
    }
  };

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case "Accepted":
        return t("yourJobs.accepted");
      case "standby":
        return t("yourJobs.standby");
      case "Rejected":
        return t("yourJobs.rejected");
      case "Active":
        return t("yourJobs.active");
      case "Completed":
        return t("yourJobs.completed");
      default:
        return status;
    }
  };

  const getTabLabel = (tab: JobTab) => {
    switch (tab) {
      case "Sent Proposals":
        return t("yourJobs.sentProposals");
      case "Active Jobs":
        return t("yourJobs.activeJobs");
      case "Completed Jobs":
        return t("yourJobs.completedJobs");
      default:
        return tab;
    }
  };

  const renderJobCard = (job: JobCardData) => {
    const localizedJob =
      job.source.translations[currentLanguage] ?? job.source.translations.en;
    return (
      <TouchableOpacity
        key={`${activeTab}-${job.id}-${job.status}`}
        style={styles.jobCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(routes.jobDetails, { jobId: job.id })
        }
      >
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(job.status) },
            ]}
          />
          <Text style={styles.statusText}>{getStatusLabel(job.status)}</Text>
        </View>

        <Text style={styles.jobTitle}>{localizedJob.title}</Text>

        <View style={styles.companyRow}>
          <Text style={styles.companyName}>{job.company}</Text>
          {job.verified && (
            <View style={styles.verifiedBadge}>
              <Image
                source={VerifiedIcon}
                style={styles.verifiedIcon}
                resizeMode="contain"
              />
              <Text style={styles.verifiedText}>
                {t("yourJobs.userVerified")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.locationBudgetRow}>
          <View style={styles.locationWrapper}>
            <Image
              source={LocationIcon}
              style={styles.locationPin}
              resizeMode="contain"
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {job.location}
            </Text>
          </View>
          <Text style={styles.budgetLabel}>
            {t("yourJobs.budget")}{" "}
            <Text style={styles.budgetValue}>{job.budget}</Text>
          </Text>
        </View>

        {job.showChat && (
          <TouchableOpacity style={styles.chatButton} activeOpacity={0.8}>
            <Image
              source={ChatIcon}
              style={styles.chatIcon}
              resizeMode="contain"
            />
            <Text style={styles.chatButtonText}>
              {t("yourJobs.chatWith", { company: job.company })}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t("yourJobs.title")}</Text>
      </View>

      <View style={styles.tabsContainer}>
        {(Object.keys(jobsByTab) as JobTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {getTabLabel(tab)}
            </Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "Sent Proposals" && (
          <Text style={styles.warningText}>
            {t("yourJobs.proposalWarningLine1")}
            {"\n"}
            {t("yourJobs.proposalWarningLine2")}
          </Text>
        )}

        <View style={styles.cardsContainer}>
          {jobsByTab[activeTab].map((job) => renderJobCard(job))}
        </View>
      </ScrollView>

      <BottomNavigation activeTab="yourJobs" />
    </SafeAreaView>
  );
};

export default YourJobsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  pageTitle: {
    color: "#1E1E1E",
    fontSize: wp("5.5%"),
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("6%"),
    marginBottom: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabButton: {
    alignItems: "center",
    paddingBottom: hp("1%"),
  },
  tabText: {
    fontSize: wp("3.8%"),
    color: "#666666",
  },
  tabTextActive: {
    color: "#965541",
    fontWeight: "bold",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    height: hp("0.3%"),
    backgroundColor: "#965541",
    borderRadius: wp("1%"),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp("2%"),
  },
  warningText: {
    color: "#FFAA00",
    textAlign: "center",
    fontSize: wp("3.8%"),
    marginVertical: hp("2.5%"),
    paddingHorizontal: wp("10%"),
  },
  cardsContainer: {
    paddingHorizontal: wp("5%"),
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#A4A9B6",
    borderRadius: wp("5%"),
    borderWidth: 1,
    padding: wp("5%"),
    marginBottom: hp("2%"),
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  statusDot: {
    width: wp("2.5%"),
    height: wp("2.5%"),
    borderRadius: wp("1.25%"),
    marginRight: wp("2%"),
  },
  statusText: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
    fontWeight: "500",
  },
  jobTitle: {
    color: "#000000",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
    lineHeight: wp("6%"),
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  companyName: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    marginRight: wp("2%"),
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedIcon: {
    width: wp("3.5%"),
    height: wp("3.5%"),
    marginRight: wp("1%"),
    tintColor: "#007AFF",
  },
  verifiedText: {
    color: "#007AFF",
    fontSize: wp("3.2%"),
    fontWeight: "bold",
  },
  locationBudgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: wp("2%"),
  },
  locationPin: {
    width: wp("3.5%"),
    height: wp("3.5%"),
    marginRight: wp("1.5%"),
    tintColor: "#965541",
  },
  locationText: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
    textDecorationLine: "underline",
    flex: 1,
  },
  budgetLabel: {
    color: "#965541",
    fontSize: wp("3.5%"),
  },
  budgetValue: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: wp("3.8%"),
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("1%"),
  },
  chatIcon: {
    width: wp("4.5%"),
    height: wp("4.5%"),
    marginRight: wp("2%"),
    tintColor: "#965541",
  },
  chatButtonText: {
    color: "#965541",
    fontSize: wp("3.5%"),
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
