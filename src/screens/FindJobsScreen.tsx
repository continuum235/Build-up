import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
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
import { useApi } from "../services/api";

interface FindJobsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, typeof routes.findJobs>;
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

interface ApiJob {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  category: string;
  experience: number;
  createdAt: string;
  hirer?: { id?: string; name?: string };
}

function mapApiJob(j: ApiJob) {
  const title = j.title ?? "";
  return {
    id: j.id,
    title,
    company: j.hirer?.name ?? "Build Up",
    verified: false,
    location: j.location ?? "",
    budget: Number(j.budget ?? 0),
    category: j.category ?? "OTHER",
    liked: false,
    experience: `${j.experience ?? 0} years`,
    description: j.description ?? "",
    postedTime: relativeTime(j.createdAt ?? new Date().toISOString()),
  };
}

const CATEGORIES = [
  "All", "CARPENTER", "ELECTRICIAN", "PLUMBER", "PAINTER",
  "CLEANER", "GARDENER", "MASON", "DRIVER", "COOK", "SECURITY", "OTHER",
];

const FindJobsScreen: React.FC<FindJobsScreenProps> = ({ navigation }) => {
  const { listJobs, getMe, getMyWorkerJobs, acceptJob, rejectJob, createOrFindConversation } = useApi();

  const [jobs, setJobs] = useState<ReturnType<typeof mapApiJob>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [userCity, setUserCity] = useState<string>("");
  const [likedJobIds, setLikedJobIds] = useState<Set<string>>(new Set());
  const [actingJobId, setActingJobId] = useState<string | null>(null);

  const [acceptedJobIds, setAcceptedJobIds] = useState<Set<string>>(new Set());
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(
    async (city: string) => {
      setLoading(true);
      try {
        const params: Record<string, string> = { status: "OPEN", limit: "50" };
        if (city) params.userCity = city;
        const [jobsData, workerData] = await Promise.all([
          listJobs(params),
          getMyWorkerJobs(),
        ]);
        setJobs(
          ((jobsData as { jobs?: ApiJob[] }).jobs ?? []).map(mapApiJob),
        );
        const engagements = (workerData as { engagements?: { jobId: string }[] }).engagements ?? [];
        setAcceptedJobIds(new Set(engagements.map((e) => e.jobId)));
        const dismissed = (workerData as { dismissedJobIds?: string[] }).dismissedJobIds ?? [];
        setDismissedJobIds(new Set(dismissed));
      } catch {
        // keep existing
      } finally {
        setLoading(false);
      }
    },
    [listJobs, getMyWorkerJobs],
  );

  useEffect(() => {
    getMe()
      .then(({ user }: { user: { city?: string } }) => {
        const city = user.city ?? "";
        setUserCity(city);
        return fetchAll(city);
      })
      .catch(() => fetchAll(""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (jobId: string) => {
    setActingJobId(jobId);
    try {
      await acceptJob(jobId);
      setAcceptedJobIds((prev) => new Set(prev).add(jobId));
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to accept job. It may already be filled.");
    } finally {
      setActingJobId(null);
    }
  };

  const handleReject = async (jobId: string) => {
    setActingJobId(jobId);
    try {
      await rejectJob(jobId);
      setDismissedJobIds((prev) => new Set(prev).add(jobId));
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to reject job.");
    } finally {
      setActingJobId(null);
    }
  };

  const handleMessageHirer = async (jobId: string, jobTitle: string) => {
    setActingJobId(jobId);
    try {
      const data = await createOrFindConversation(jobId);
      const conv = (data as { conversation: { id: string } }).conversation;
      navigation.navigate(routes.chat, {
        conversationId: conv.id,
        title: jobTitle,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to start conversation.");
    } finally {
      setActingJobId(null);
    }
  };

  const toggleLike = (jobId: string) => {
    setLikedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    if (acceptedJobIds.has(job.id)) return false;
    if (dismissedJobIds.has(job.id)) return false;
    if (activeFilter !== "All" && job.category !== activeFilter) return false;
    if (!normalizedSearch) return true;
    const haystack =
      `${job.title} ${job.company} ${job.location} ${job.category}`.toLowerCase();
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>
            {userCity ? `Jobs near ${userCity}` : "Find Jobs"}
          </Text>
          {userCity ? (
            <Text style={styles.pageSubtitle}>Sorted by proximity to your city</Text>
          ) : null}
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search jobs, skills, location..."
            placeholderTextColor="#A4A9B6"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        {/* Category filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterScrollView}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveFilter(cat)}
              style={[
                styles.filterChip,
                activeFilter === cat ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === cat ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {cat === "All" ? "All Jobs" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Job list */}
        <View style={styles.cardsContainer}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#965541"
              style={{ marginTop: hp("5%") }}
            />
          )}

          {!loading && filteredJobs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No jobs found</Text>
              <Text style={styles.emptyStateText}>
                {acceptedJobIds.size > 0 || dismissedJobIds.size > 0
                  ? "All visible jobs have been actioned. Check Your Jobs for accepted ones."
                  : "Try adjusting your search or filters."}
              </Text>
            </View>
          )}

          {!loading &&
            filteredJobs.map((job) => {
              const isLiked = likedJobIds.has(job.id);
              const isAccepted = acceptedJobIds.has(job.id);
              const isActing = actingJobId === job.id;
              return (
                <View key={job.id}>
                  <JobDetails
                    job={{
                      id: job.id,
                      title: job.title,
                      company: job.company,
                      verified: job.verified,
                      posted: job.postedTime,
                      location: job.location,
                      budget: `₹${job.budget}`,
                      experience: job.experience,
                      tags: [],
                    }}
                    isLiked={isLiked}
                    verifiedLabel="User Verified"
                    postedPrefix="Posted"
                    onPress={() =>
                      navigation.navigate(routes.jobDetails, { jobId: job.id })
                    }
                    onLikePress={() => toggleLike(job.id)}
                    details={[
                      { label: "Budget", value: `₹${job.budget}` },
                      { label: "Experience", value: job.experience },
                      { label: "Location", value: job.location },
                    ]}
                  >
                    {isAccepted ? (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.messageBtn, isActing && { opacity: 0.5 }]}
                        activeOpacity={0.8}
                        onPress={() => handleMessageHirer(job.id, job.title)}
                        disabled={isActing}
                      >
                        {isActing ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={styles.actionBtnText}>Message Hirer</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.acceptBtn, isActing && { opacity: 0.5 }]}
                          activeOpacity={0.8}
                          onPress={() => handleAccept(job.id)}
                          disabled={isActing}
                        >
                          {isActing ? (
                            <ActivityIndicator color="#FFF" size="small" />
                          ) : (
                            <Text style={styles.actionBtnText}>Accept</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn, isActing && { opacity: 0.5 }]}
                          activeOpacity={0.8}
                          onPress={() => handleReject(job.id)}
                          disabled={isActing}
                        >
                          <Text style={styles.rejectBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </JobDetails>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {actingJobId && (
        <View style={styles.actingOverlay}>
          <View style={styles.actingCard}>
            <ActivityIndicator size="large" color="#965541" />
            <Text style={styles.actingText}>Processing...</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp("12%"),
  },
  header: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("1%"),
  },
  pageTitle: {
    fontSize: wp("6%"),
    fontWeight: "700",
    color: "#965541",
  },
  pageSubtitle: {
    fontSize: wp("3.2%"),
    color: "#A4A9B6",
    marginTop: hp("0.3%"),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    marginHorizontal: wp("5%"),
    marginBottom: hp("2%"),
    paddingHorizontal: wp("4%"),
    height: hp("6.5%"),
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    color: "#000000",
    fontSize: wp("4%"),
    height: "100%",
  },
  filterScrollView: {
    marginBottom: hp("2%"),
  },
  filterScrollContent: {
    paddingHorizontal: wp("5%"),
  },
  filterChip: {
    borderRadius: wp("4%"),
    borderWidth: 1.5,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    marginRight: wp("2.5%"),
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
    fontSize: wp("3.4%"),
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
  emptyState: {
    alignItems: "center",
    paddingVertical: hp("8%"),
  },
  emptyStateTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: hp("1%"),
  },
  emptyStateText: {
    fontSize: wp("3.8%"),
    color: "#666666",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: wp("2%"),
    marginTop: hp("1%"),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp("3%"),
  },
  acceptBtn: {
    backgroundColor: "#965541",
  },
  rejectBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#965541",
  },
  messageBtn: {
    backgroundColor: "#965541",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  rejectBtnText: {
    color: "#965541",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  actingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  actingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("4%"),
    padding: wp("8%"),
    alignItems: "center",
  },
  actingText: {
    marginTop: hp("1%"),
    color: "#965541",
    fontWeight: "600",
    fontSize: wp("4%"),
  },
});
