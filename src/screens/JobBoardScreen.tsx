import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useApi } from "../services/api";
import {
  CATEGORIES,
  CATEGORY_MIN_WAGE,
  CATEGORY_LABELS,
  Category,
} from "../data/categoryWages";
import BottomNavigation from "../components/layout/BottomNavigation";
import JobDetails from "../components/jobs/JobDetails";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import CityDropdown from "../components/ui/CityDropdown";
import { jobPostSchema } from "../utils/schemas";
import routes, { RootStackParamList } from "../navigation/routes";

const BUDGET_TYPES = ["HOURLY", "DAILY", "FIXED"] as const;
type JobTab = "Jobs Posted" | "Engaged Workers";
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ApiEngagement {
  id: string;
  status: string;
  worker?: { id: string; name?: string; phone?: string } | null;
  review?: { id: string } | null;
  job?: ApiJob;
}

interface ApiJob {
  id: string;
  title: string;
  description?: string;
  location: string;
  budget: number | string;
  budgetType: string;
  experience: number;
  category: string;
  status: string;
  positions: number;
  filledCount: number;
  createdAt: string;
  hirer?: { id: string; name?: string } | null;
  engagements?: ApiEngagement[];
}

const formatBudget = (budget: number | string, budgetType?: string) => {
  const amount = Number(budget) || 0;
  const suffix =
    budgetType === "HOURLY" ? "/hr" : budgetType === "DAILY" ? "/day" : "";
  return `₹${amount}${suffix}`;
};

const JobBoardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    getMyHirerJobs,
    createJob,
    deleteJob,
    updateEngagement,
    createReview,
    createOrFindConversation,
  } = useApi();
  const [activeTab, setActiveTab] = useState<JobTab>("Jobs Posted");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    experience: "",
    category: "OTHER" as Category,
    budgetType: "FIXED" as "HOURLY" | "DAILY" | "FIXED",
    startDate: "",
    endDate: "",
    minWage: "",
    positions: "1",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [engagements, setEngagements] = useState<ApiEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    visible: boolean;
    engagementId: string;
    workerName: string;
  }>({ visible: false, engagementId: "", workerName: "" });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyHirerJobs();
      const fetchedJobs = ((data as { jobs?: ApiJob[] }).jobs ?? []) as ApiJob[];
      setJobs(fetchedJobs);
      setEngagements(
        fetchedJobs.flatMap((job) =>
          (job.engagements ?? []).map((engagement) => ({
            ...engagement,
            job,
          })),
        ),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getMyHirerJobs]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 0);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCategorySelect = (cat: Category) => {
    setNewJob((prev) => ({
      ...prev,
      category: cat,
      minWage: String(CATEGORY_MIN_WAGE[cat] || 0),
    }));
    setCategoryDropdownOpen(false);
  };

  const handleAddJob = async () => {
    const budgetVal = parseFloat(newJob.budget) || 0;
    const positions = parseInt(newJob.positions, 10) || 1;
    const minWageVal = CATEGORY_MIN_WAGE[newJob.category] || 0;

    const parseResult = jobPostSchema.safeParse({
      title: newJob.title,
      description: newJob.description || newJob.title,
      location: newJob.location,
      budget: budgetVal,
      minWage: minWageVal,
      positions,
      experience: parseInt(newJob.experience, 10) || 0,
      category: newJob.category,
      budgetType: newJob.budgetType,
      startDate: newJob.startDate || new Date().toISOString(),
      endDate: newJob.endDate || undefined,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((e) => {
        const field = e.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});
    setPosting(true);
    try {
      await createJob({
        title: newJob.title,
        description: newJob.description || newJob.title,
        location: newJob.location,
        budget: budgetVal,
        budgetType: newJob.budgetType,
        experience: parseInt(newJob.experience, 10) || 0,
        category: newJob.category,
        startDate: newJob.startDate || new Date().toISOString(),
        endDate: newJob.endDate || undefined,
        minWage: minWageVal,
        positions,
      });
      setNewJob({
        title: "",
        description: "",
        location: "",
        budget: "",
        experience: "",
        category: "OTHER",
        budgetType: "FIXED",
        startDate: "",
        endDate: "",
        minWage: "",
        positions: "1",
      });
      setShowAddForm(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e?.errors?.[0]?.message || e?.message || "Failed to post job");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    Alert.alert("Delete job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setActingId(jobId);
          try {
            await deleteJob(jobId);
            fetchData();
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to delete job");
          } finally {
            setActingId(null);
          }
        },
      },
    ]);
  };

  const handleEngagementStatus = async (engagementId: string, status: string) => {
    setActingId(engagementId);
    try {
      await updateEngagement(engagementId, { status });
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update worker");
    } finally {
      setActingId(null);
    }
  };

  const handleChat = async (engagement: ApiEngagement) => {
    const job = engagement.job;
    if (!job) return;

    setChatLoadingId(engagement.id);
    try {
      const data = await createOrFindConversation(job.id, engagement.worker?.id);
      const conv = (data as { conversation: { id: string } }).conversation;
      navigation.navigate(routes.chat, {
        conversationId: conv.id,
        title: engagement.worker?.name || job.title,
      });
    } catch {
      Alert.alert("Error", "Failed to start conversation.");
    } finally {
      setChatLoadingId(null);
    }
  };

  const handleReview = async () => {
    if (!reviewModal.engagementId) return;

    setReviewing(true);
    try {
      await createReview(reviewModal.engagementId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewModal({ visible: false, engagementId: "", workerName: "" });
      setReviewComment("");
      setReviewRating(5);
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit review");
    } finally {
      setReviewing(false);
    }
  };

  const minWage = CATEGORY_MIN_WAGE[newJob.category] || 0;
  const positions = parseInt(newJob.positions, 10) || 1;
  const totalMinWage = minWage * positions;
  const budgetValCalc = parseInt(newJob.budget, 10) || 0;
  const budgetTooLow = budgetValCalc > 0 && budgetValCalc < totalMinWage;

  const renderJob = (job: ApiJob) => (
    <View key={job.id} style={styles.cardWrap}>
      <JobDetails
        job={{
          id: job.id,
          title: job.title,
          company: job.hirer?.name || "You",
          verified: false,
          posted: new Date(job.createdAt).toLocaleDateString(),
          location: job.location,
          budget: formatBudget(job.budget, job.budgetType),
          experience: `${job.experience || 0} yrs`,
          tags: [
            CATEGORY_LABELS[job.category as Category] ?? job.category,
            job.status,
          ],
        }}
        details={[
          { label: "Budget", value: formatBudget(job.budget, job.budgetType) },
          { label: "Workers", value: `${job.filledCount || 0}/${job.positions || 1}` },
        ]}
      >
        <View style={styles.jobActions}>
          <TouchableOpacity
            style={[styles.smallButton, styles.outlineButton]}
            onPress={() => navigation.navigate(routes.jobDetails, { jobId: job.id })}
          >
            <Text style={styles.outlineText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, styles.dangerButton]}
            onPress={() => handleDeleteJob(job.id)}
            disabled={actingId === job.id}
          >
            {actingId === job.id ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.filledText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </JobDetails>
    </View>
  );

  const renderEngagement = (engagement: ApiEngagement) => {
    const workerName = engagement.worker?.name || "Worker";
    const jobTitle = engagement.job?.title || "Job";
    const isActive = engagement.status === "ACTIVE";
    const isCompleted = engagement.status === "COMPLETED";

    return (
      <View key={engagement.id} style={styles.workerCard}>
        <View style={styles.workerHeader}>
          <View>
            <Text style={styles.workerName}>{workerName}</Text>
            <Text style={styles.workerJob}>{jobTitle}</Text>
          </View>
          <Text style={styles.statusPill}>{engagement.status}</Text>
        </View>

        <View style={styles.jobActions}>
          <TouchableOpacity
            style={[styles.smallButton, styles.outlineButton]}
            onPress={() => handleChat(engagement)}
            disabled={chatLoadingId === engagement.id}
          >
            {chatLoadingId === engagement.id ? (
              <ActivityIndicator color="#965541" size="small" />
            ) : (
              <Text style={styles.outlineText}>Message</Text>
            )}
          </TouchableOpacity>
          {isActive && (
            <TouchableOpacity
              style={[styles.smallButton, styles.primaryButton]}
              onPress={() => handleEngagementStatus(engagement.id, "COMPLETED")}
              disabled={actingId === engagement.id}
            >
              <Text style={styles.filledText}>Complete</Text>
            </TouchableOpacity>
          )}
          {isCompleted && !engagement.review && (
            <TouchableOpacity
              style={[styles.smallButton, styles.primaryButton]}
              onPress={() =>
                setReviewModal({
                  visible: true,
                  engagementId: engagement.id,
                  workerName,
                })
              }
            >
              <Text style={styles.filledText}>Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Job Board</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Post Job</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {(["Jobs Posted", "Engaged Workers"] as JobTab[]).map((tab) => (
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
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#965541"
            style={styles.loader}
          />
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Could not load job board</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Button title="Try again" variant="secondary" onPress={fetchData} />
          </View>
        ) : activeTab === "Jobs Posted" ? (
          jobs.length ? (
            jobs.map(renderJob)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No jobs posted yet</Text>
              <Text style={styles.emptyText}>
                Post your first job to start receiving worker applications.
              </Text>
            </View>
          )
        ) : engagements.length ? (
          engagements.map(renderEngagement)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No engaged workers yet</Text>
            <Text style={styles.emptyText}>
              Workers you accept for posted jobs will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation activeTab="jobBoard" />

      <Modal
        visible={showAddForm}
        animationType="slide"
        onRequestClose={() => setShowAddForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post a Job</Text>
            <TouchableOpacity onPress={() => setShowAddForm(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              label="Job title"
              placeholder="Painter, mason, electrician..."
              value={newJob.title}
              onChangeText={(title) => setNewJob((prev) => ({ ...prev, title }))}
              error={formErrors.title}
            />
            <TextInput
              label="Description"
              placeholder="Describe the work"
              value={newJob.description}
              onChangeText={(description) =>
                setNewJob((prev) => ({ ...prev, description }))
              }
              multiline
              style={styles.multilineInput}
              error={formErrors.description}
            />
            <CityDropdown
              label="Location"
              value={newJob.location}
              onChange={(location) => setNewJob((prev) => ({ ...prev, location }))}
              error={formErrors.location}
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity
              style={[
                styles.selectBox,
                formErrors.category ? styles.selectBoxError : null,
              ]}
              onPress={() => setCategoryDropdownOpen((open) => !open)}
            >
              <Text style={styles.selectText}>
                {CATEGORY_LABELS[newJob.category] ?? newJob.category}
              </Text>
              <Text style={styles.selectArrow}>
                {categoryDropdownOpen ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {formErrors.category ? (
              <Text style={styles.errorText}>{formErrors.category}</Text>
            ) : null}
            {categoryDropdownOpen && (
              <View style={styles.categoryMenu}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoryOption}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <Text style={styles.categoryOptionText}>
                      {CATEGORY_LABELS[cat] ?? cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.segmentedRow}>
              {BUDGET_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.segment,
                    newJob.budgetType === type && styles.segmentActive,
                  ]}
                  onPress={() =>
                    setNewJob((prev) => ({ ...prev, budgetType: type }))
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      newJob.budgetType === type && styles.segmentTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              label="Budget"
              placeholder={`Minimum ₹${totalMinWage}`}
              value={newJob.budget}
              onChangeText={(budget) => setNewJob((prev) => ({ ...prev, budget }))}
              keyboardType="numeric"
              error={formErrors.budget}
            />
            {budgetTooLow && (
              <Text style={styles.warningText}>
                Budget is below the minimum wage total of ₹{totalMinWage}.
              </Text>
            )}
            <TextInput
              label="Experience required"
              placeholder="0"
              value={newJob.experience}
              onChangeText={(experience) =>
                setNewJob((prev) => ({ ...prev, experience }))
              }
              keyboardType="numeric"
              error={formErrors.experience}
            />
            <TextInput
              label="Positions"
              placeholder="1"
              value={newJob.positions}
              onChangeText={(nextPositions) =>
                setNewJob((prev) => ({ ...prev, positions: nextPositions }))
              }
              keyboardType="numeric"
              error={formErrors.positions}
            />
            <TextInput
              label="Start date"
              placeholder="YYYY-MM-DD"
              value={newJob.startDate}
              onChangeText={(startDate) =>
                setNewJob((prev) => ({ ...prev, startDate }))
              }
              error={formErrors.startDate}
            />
            <TextInput
              label="End date"
              placeholder="YYYY-MM-DD (optional)"
              value={newJob.endDate}
              onChangeText={(endDate) =>
                setNewJob((prev) => ({ ...prev, endDate }))
              }
              error={formErrors.endDate}
            />

            <View style={styles.minimumBox}>
              <Text style={styles.minimumText}>
                Minimum wage: ₹{minWage} x {positions} position
                {positions === 1 ? "" : "s"} = ₹{totalMinWage}
              </Text>
            </View>

            <Button
              title="Post Job"
              variant="secondary"
              loading={posting}
              disabled={budgetTooLow}
              onPress={handleAddJob}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={reviewModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setReviewModal({ visible: false, engagementId: "", workerName: "" })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewContent}>
            <Text style={styles.modalTitle}>Review {reviewModal.workerName}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => setReviewRating(rating)}
                >
                  <Text
                    style={[
                      styles.star,
                      rating <= reviewRating && styles.starActive,
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Comment (optional)"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              style={styles.multilineInput}
            />
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.smallButton, styles.outlineButton]}
                onPress={() =>
                  setReviewModal({
                    visible: false,
                    engagementId: "",
                    workerName: "",
                  })
                }
              >
                <Text style={styles.outlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, styles.primaryButton]}
                onPress={handleReview}
                disabled={reviewing}
              >
                {reviewing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.filledText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JobBoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
  },
  pageTitle: {
    color: "#1E1E1E",
    fontSize: wp("5.5%"),
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#965541",
    borderRadius: 8,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.2%"),
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: wp("3.6%"),
    fontWeight: "700",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingHorizontal: wp("5%"),
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
    paddingBottom: hp("1.2%"),
  },
  tabText: {
    color: "#666666",
    fontSize: wp("3.8%"),
  },
  tabTextActive: {
    color: "#965541",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    height: 3,
    backgroundColor: "#965541",
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("3%"),
  },
  loader: {
    marginTop: hp("12%"),
  },
  cardWrap: {
    marginBottom: hp("1%"),
  },
  jobActions: {
    flexDirection: "row",
    gap: wp("2%"),
    marginTop: hp("2%"),
  },
  smallButton: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp("5%"),
    paddingHorizontal: wp("3%"),
  },
  primaryButton: {
    backgroundColor: "#965541",
  },
  outlineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#965541",
  },
  dangerButton: {
    backgroundColor: "#D64545",
  },
  outlineText: {
    color: "#965541",
    fontSize: wp("3.7%"),
    fontWeight: "700",
  },
  filledText: {
    color: "#FFFFFF",
    fontSize: wp("3.7%"),
    fontWeight: "700",
  },
  workerCard: {
    borderColor: "#D8DADC",
    borderWidth: 1.5,
    borderRadius: 8,
    padding: wp("4%"),
    marginBottom: hp("2%"),
    backgroundColor: "#FFFFFF",
  },
  workerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: wp("3%"),
  },
  workerName: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "700",
  },
  workerJob: {
    color: "#666666",
    fontSize: wp("3.5%"),
    marginTop: hp("0.5%"),
  },
  statusPill: {
    color: "#965541",
    borderColor: "#965541",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.6%"),
    fontSize: wp("3%"),
    fontWeight: "700",
    overflow: "hidden",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingTop: hp("8%"),
  },
  emptyTitle: {
    color: "#1E1E1E",
    fontSize: wp("4.8%"),
    fontWeight: "700",
    marginBottom: hp("1%"),
    textAlign: "center",
  },
  emptyText: {
    color: "#6A6F7D",
    fontSize: wp("3.8%"),
    lineHeight: wp("5.5%"),
    marginBottom: hp("3%"),
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    color: "#1E1E1E",
    fontSize: wp("4.8%"),
    fontWeight: "700",
  },
  closeText: {
    color: "#965541",
    fontSize: wp("3.8%"),
    fontWeight: "700",
  },
  formContent: {
    padding: wp("5%"),
    paddingBottom: hp("5%"),
  },
  multilineInput: {
    minHeight: hp("12%"),
    textAlignVertical: "top",
  },
  fieldLabel: {
    color: "#1E1E1E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  selectBoxError: {
    borderColor: "red",
  },
  selectText: {
    color: "#1E1E1E",
    fontSize: 16,
  },
  selectArrow: {
    color: "#965541",
    fontSize: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  categoryMenu: {
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    overflow: "hidden",
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryOptionText: {
    color: "#1E1E1E",
    fontSize: 15,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: wp("2%"),
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: hp("1.2%"),
  },
  segmentActive: {
    backgroundColor: "#965541",
    borderColor: "#965541",
  },
  segmentText: {
    color: "#6A6F7D",
    fontSize: wp("3.2%"),
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  warningText: {
    color: "#D64545",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  minimumBox: {
    backgroundColor: "#F7F2EF",
    borderRadius: 8,
    padding: wp("4%"),
    marginBottom: hp("2%"),
  },
  minimumText: {
    color: "#965541",
    fontSize: wp("3.5%"),
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: wp("5%"),
  },
  reviewContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: wp("5%"),
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: hp("2%"),
  },
  star: {
    color: "#D8DADC",
    fontSize: wp("9%"),
    paddingHorizontal: wp("1%"),
  },
  starActive: {
    color: "#F5A623",
  },
  reviewActions: {
    flexDirection: "row",
    gap: wp("2%"),
    marginTop: hp("1%"),
  },
});
