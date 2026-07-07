import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import routes, { RootStackParamList } from "../navigation/routes";
import BottomNavigation from "../components/layout/BottomNavigation";
import JobDetails from "../components/jobs/JobDetails";
import { useLanguage } from "../context/LanguageContext";
import { useJobs } from "../hooks/useJobs";
import { useApi } from "../services/api";

const SearchIcon = require("../../assets/Search.png");

interface FindJobsScreenProps {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    typeof routes.findJobs
  >;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function mapApiJob(j: Record<string, unknown>) {
  const hirer = j.hirer as { name?: string } | undefined;
  const title = String(j.title ?? "");
  return {
    id: String(j.id),
    title,
    company: hirer?.name ?? "Build Up",
    verified: false,
    location: String(j.location ?? ""),
    budget: Number(j.budget ?? 0),
    applicants: "0",
    category: String(j.category ?? "OTHER"),
    liked: false,
    translations: {
      en: {
        title,
        postedTime: relativeTime(String(j.createdAt ?? new Date().toISOString())),
        experience: `${j.experience ?? 0} years`,
        tags: [] as string[],
        description: String(j.description ?? ""),
      },
      hi: {
        title,
        postedTime: relativeTime(String(j.createdAt ?? new Date().toISOString())),
        experience: `${j.experience ?? 0} years`,
        tags: [] as string[],
        description: String(j.description ?? ""),
      },
    },
  };
}

const FindJobsScreen: React.FC<FindJobsScreenProps> = ({ navigation }) => {
  const { language, t } = useLanguage();
  const { jobs: seedJobs, categories, categoryTranslations } = useJobs();
  const { getMyWorkerJobs, acceptJob, rejectJob } = useApi();
  const [apiJobs, setApiJobs] = useState<Record<string, unknown>[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [actingOnJob, setActingOnJob] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("Broadcasted Jobs");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingJobs(true);
    getMyWorkerJobs()
      .then((data) => {
        if (!cancelled) {
          setApiJobs((data as { openJobs: Record<string, unknown>[] }).openJobs ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });
    return () => { cancelled = true; };
  }, [getMyWorkerJobs]);

  const jobs = [...seedJobs, ...apiJobs.map(mapApiJob)];
  const [likedJobIds, setLikedJobIds] = useState<Set<string | number>>(
    () => new Set(jobs.filter((job) => "liked" in job && job.liked).map((job) => job.id)),
  );

  const filters = ["All", ...categories];
  const tabs = [
    { id: "Best Matches", label: t("findJobs.bestMatches") },
    { id: "Broadcasted Jobs", label: t("findJobs.broadcastedJobs") },
    { id: "Liked Jobs", label: t("findJobs.likedJobs") },
  ];
  const normalizedSearch = searchText.trim().toLowerCase();
  const isBroadcastTab = activeTab === "Broadcasted Jobs";
  const isLikedTab = activeTab === "Liked Jobs";
  const currentLanguage = language as "en" | "hi";
  const broadcastJob = jobs[0];
  const localizedBroadcastJob =
    broadcastJob.translations[currentLanguage] ?? broadcastJob.translations.en;

  const getCategoryLabel = (category: string) =>
    categoryTranslations[category as keyof typeof categoryTranslations]?.[
      currentLanguage
    ] ?? category;

  const toggleLike = (jobId: string | number) => {
    setLikedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const filteredJobs = jobs.filter((job) => {
    if (isLikedTab && !likedJobIds.has(job.id)) {
      return false;
    }
    if (activeFilter !== "All" && job.category !== activeFilter) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const localizedJob =
      job.translations[currentLanguage] ?? job.translations.en;
    const haystack =
      `${localizedJob.title} ${job.title} ${job.company} ${job.location} ${getCategoryLabel(job.category)}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{t("findJobs.title")}</Text>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Image
            source={SearchIcon}
            resizeMode="contain"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder={t("findJobs.searchPlaceholder")}
            placeholderTextColor="#A4A9B6"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {!isBroadcastTab && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            style={styles.filterScrollView}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  activeFilter === filter
                    ? styles.filterChipActive
                    : styles.filterChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter
                      ? styles.filterTextActive
                      : styles.filterTextInactive,
                  ]}
                >
                  {getCategoryLabel(filter)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* JOB LIST */}
        <View style={styles.cardsContainer}>
          {isBroadcastTab && (
            <View style={styles.broadcastContent}>
              <Text style={styles.broadcastInfoText}>
                {t("findJobs.broadcastEmpty")}
              </Text>

              <View style={styles.radarContainer}>
                <View style={styles.circleOuter}>
                  <View style={styles.circleMiddle}>
                    <TouchableOpacity
                      style={styles.circleInner}
                      activeOpacity={0.8}
                      onPress={() => setShowNewJobModal(true)}
                    >
                      <Text style={styles.globeIcon}>🌐</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {!isBroadcastTab && filteredJobs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {t("findJobs.noJobsTitle")}
              </Text>
              <Text style={styles.emptyStateText}>
                {t("findJobs.noJobsText")}
              </Text>
            </View>
          )}

          {!isBroadcastTab &&
            filteredJobs.map((job) => {
              const isLiked = likedJobIds.has(job.id);
              const localizedJob =
                job.translations[currentLanguage] ?? job.translations.en;
              return (
                <JobDetails
                  key={job.id}
                  job={{
                    id: job.id,
                    title: localizedJob.title,
                    company: job.company,
                    verified: job.verified,
                    posted: localizedJob.postedTime,
                    location: job.location,
                    budget: `$${job.budget}`,
                    experience: localizedJob.experience,
                    tags: localizedJob.tags,
                  }}
                  isLiked={isLiked}
                  verifiedLabel={t("findJobs.userVerified")}
                  postedPrefix={t("findJobs.postedPrefix")}
                  onPress={() =>
                    navigation.navigate(routes.jobDetails, { jobId: job.id })
                  }
                  onLikePress={() => toggleLike(job.id)}
                  details={[
                    { label: t("findJobs.budget"), value: `$${job.budget}` },
                    {
                      label: t("findJobs.experience"),
                      value: localizedJob.experience,
                    },
                  ]}
                />
              );
            })}
        </View>
      </ScrollView>

      {showNewJobModal && (
        <View style={styles.broadcastOverlay}>
          <View style={styles.broadcastModalCard}>
            <Text style={styles.broadcastModalTitle}>
              {localizedBroadcastJob.title}
            </Text>

            <View style={styles.broadcastCompanyRow}>
              <Text style={styles.broadcastCompanyName}>
                {broadcastJob.company}
              </Text>
              <Text style={styles.broadcastVerifiedCheck}> ✓ </Text>
              <Text style={styles.broadcastVerifiedText}>
                {t("findJobs.userVerified")}
              </Text>
            </View>

            <View style={styles.mapBox}>
              <View style={styles.mapTop}>
                <Text style={styles.mapText}>{t("findJobs.maps")}</Text>
              </View>
              <View style={styles.mapBottom}>
                <Text style={styles.mapLocationText}>
                  📍 {broadcastJob.location}
                </Text>
              </View>
            </View>

            <View style={styles.broadcastDetailsRow}>
              <Text style={styles.broadcastDetailLabel}>
                {t("findJobs.budget")}{" "}
                <Text style={styles.broadcastDetailValue}>
                  ${broadcastJob.budget}
                </Text>
              </Text>
              <Text style={styles.broadcastDetailLabel}>
                {t("findJobs.experience")}{" "}
                <Text style={styles.broadcastDetailValue}>
                  {localizedBroadcastJob.experience}
                </Text>
              </Text>
            </View>

            <View style={styles.broadcastActionRow}>
              <TouchableOpacity
                style={[styles.approveButton, actingOnJob && { opacity: 0.5 }]}
                onPress={async () => {
                  if (actingOnJob) return;
                  setActingOnJob(true);
                  try {
                    await acceptJob(String(broadcastJob.id));
                    setShowNewJobModal(false);
                  } catch {
                    alert("Failed to accept job. Try again.");
                  } finally {
                    setActingOnJob(false);
                  }
                }}
              >
                <Text style={styles.approveText}>
                  {actingOnJob ? "..." : t("findJobs.approve")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.declineButton, actingOnJob && { opacity: 0.5 }]}
                onPress={async () => {
                  if (actingOnJob) return;
                  setActingOnJob(true);
                  try {
                    await rejectJob(String(broadcastJob.id));
                    setShowNewJobModal(false);
                  } catch {
                    alert("Failed to decline job. Try again.");
                  } finally {
                    setActingOnJob(false);
                  }
                }}
              >
                <Text style={styles.declineText}>
                  {actingOnJob ? "..." : t("findJobs.decline")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <BottomNavigation activeTab="findJobs" />
    </SafeAreaView>
  );
};

export default FindJobsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  pageTitle: {
    fontSize: wp("6%"),
    fontWeight: "700",
    color: "#965541",
    alignSelf: "center",
    textAlign: "center",
    marginTop: hp("1.5%"),
    marginBottom: hp("1%"),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp("10%"),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    marginHorizontal: wp("5%"),
    marginBottom: hp("2.5%"),
    paddingHorizontal: wp("4%"),
    height: hp("6.5%"),
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    width: wp("5%"),
    height: wp("5%"),
    marginRight: wp("3%"),
    tintColor: "#A4A9B6",
  },
  searchInput: {
    flex: 1,
    color: "#000000",
    fontSize: wp("4%"),
    height: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("6%"),
    paddingTop: hp("2%"),
    marginBottom: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tabButton: {
    alignItems: "center",
    paddingBottom: hp("1.5%"),
  },
  tabText: {
    fontSize: wp("4%"),
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
    height: hp("0.35%"),
    backgroundColor: "#965541",
    borderRadius: wp("1%"),
  },
  filterScrollView: {
    marginBottom: hp("2.5%"),
  },
  filterScrollContent: {
    paddingHorizontal: wp("5%"),
  },
  filterChip: {
    borderRadius: wp("4%"),
    borderWidth: 1.5,
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("5%"),
    marginRight: wp("3%"),
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#965541",
    borderColor: "#965541",
  },
  filterChipInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#965541",
  },
  filterText: {
    fontSize: wp("3.6%"),
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterTextInactive: {
    color: "#965541",
  },
  cardsContainer: {
    paddingHorizontal: wp("5%"),
  },
  broadcastContent: {
    flex: 1,
    alignItems: "center",
    minHeight: hp("58%"),
    position: "relative",
  },
  broadcastInfoText: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    textAlign: "center",
    lineHeight: wp("5.5%"),
    marginTop: hp("5%"),
    marginBottom: hp("8%"),
    paddingHorizontal: wp("4%"),
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleOuter: {
    width: wp("70%"),
    height: wp("70%"),
    borderRadius: wp("35%"),
    backgroundColor: "#D8C4BC",
    justifyContent: "center",
    alignItems: "center",
  },
  circleMiddle: {
    width: wp("50%"),
    height: wp("50%"),
    borderRadius: wp("25%"),
    backgroundColor: "#A67C6D",
    justifyContent: "center",
    alignItems: "center",
  },
  circleInner: {
    width: wp("30%"),
    height: wp("30%"),
    borderRadius: wp("15%"),
    backgroundColor: "#965541",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  globeIcon: {
    fontSize: wp("12%"),
    color: "#FFFFFF",
  },
  broadcastOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  broadcastModalCard: {
    width: wp("85%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("6%"),
    padding: wp("6%"),
    alignItems: "center",
  },
  broadcastModalTitle: {
    color: "#000000",
    fontSize: wp("5%"),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: wp("6.5%"),
    marginBottom: hp("1%"),
  },
  broadcastCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  broadcastCompanyName: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
  },
  broadcastVerifiedCheck: {
    color: "#FFFFFF",
    fontSize: wp("3%"),
    fontWeight: "bold",
  },
  broadcastVerifiedText: {
    color: "#FFFFFF",
    fontSize: wp("3.2%"),
  },
  mapBox: {
    width: "100%",
    height: hp("12%"),
    borderColor: "#1E1E1E",
    borderWidth: 1,
    borderRadius: wp("3%"),
    overflow: "hidden",
    marginBottom: hp("2%"),
  },
  mapTop: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
  },
  mapBottom: {
    backgroundColor: "#B88B7D",
    paddingVertical: hp("0.5%"),
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#1E1E1E",
  },
  mapLocationText: {
    color: "#FFFFFF",
    fontSize: wp("2.8%"),
  },
  broadcastDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: hp("3%"),
  },
  broadcastDetailLabel: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
  },
  broadcastDetailValue: {
    fontWeight: "bold",
    color: "#000000",
  },
  broadcastActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#965541",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("6%"),
    alignItems: "center",
    marginRight: wp("2%"),
  },
  approveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#965541",
    borderWidth: 2,
    paddingVertical: hp("1.8%"),
    borderRadius: wp("6%"),
    alignItems: "center",
    marginLeft: wp("2%"),
  },
  declineText: {
    color: "#965541",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DADC",
    borderRadius: wp("4%"),
    borderWidth: 1,
    padding: wp("5%"),
    marginBottom: hp("2%"),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  jobTitle: {
    color: "#1E1E1E",
    fontSize: wp("4.7%"),
    fontWeight: "700",
    flex: 1,
    marginRight: wp("3%"),
  },
  heartButton: {
    padding: wp("1%"),
  },
  heartIcon: {
    width: wp("6%"),
    height: wp("6%"),
  },
  heartIconActive: {
    tintColor: "#965541",
  },
  heartIconInactive: {
    tintColor: "#A4A9B6",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.2%"),
    flexWrap: "wrap",
  },
  companyName: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
    fontWeight: "700",
    marginRight: wp("1.5%"),
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.4%"),
    borderRadius: wp("2%"),
    marginRight: wp("2%"),
  },
  verifiedIcon: {
    width: wp("3.2%"),
    height: wp("3.2%"),
    marginRight: wp("1%"),
    tintColor: "#4CAF50",
  },
  verifiedText: {
    color: "#4CAF50",
    fontSize: wp("3%"),
    fontWeight: "600",
  },
  postedText: {
    color: "#888888",
    fontSize: wp("3%"),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  locationIcon: {
    width: wp("4%"),
    height: wp("4%"),
    marginRight: wp("2%"),
    tintColor: "#1E1E1E",
  },
  locationText: {
    color: "#1E1E1E",
    fontSize: wp("3.6%"),
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
    paddingRight: wp("8%"),
  },
  detailBlock: {
    flexDirection: "column",
  },
  detailLabel: {
    color: "#965541",
    fontSize: wp("3.4%"),
    marginBottom: hp("0.5%"),
  },
  detailValue: {
    color: "#1E1E1E",
    fontSize: wp("4.6%"),
    fontWeight: "700",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagChip: {
    borderColor: "#965541",
    borderRadius: wp("2%"),
    borderWidth: 1,
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("3.5%"),
    marginRight: wp("2%"),
    marginBottom: hp("1%"),
  },
  tagText: {
    color: "#965541",
    fontSize: wp("2.8%"),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("6%"),
  },
  emptyStateTitle: {
    fontSize: wp("4%"),
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: hp("1%"),
  },
  emptyStateText: {
    fontSize: wp("3.4%"),
    color: "#888888",
    textAlign: "center",
    paddingHorizontal: wp("8%"),
  },
});
