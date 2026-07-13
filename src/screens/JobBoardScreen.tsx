import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useJobs } from "../hooks/useJobs";
import { useApi } from "../services/api";
import { CATEGORIES, CATEGORY_MIN_WAGE, CATEGORY_LABELS, Category } from "../data/categoryWages";
import BottomNavigation from "../components/layout/BottomNavigation";
import JobDetails from "../components/jobs/JobDetails";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import CityDropdown from "../components/ui/CityDropdown";
import { jobPostSchema } from "../utils/schemas";

const BUDGET_TYPES = ["HOURLY", "DAILY", "FIXED"] as const;

interface PostedJob {
  id: number;
  title: string;
  posted: string;
  location: string;
  budget: string;
  experience: string;
  tags: string[];
  liked: boolean;
  applicants: string;
}

const JobBoardScreen: React.FC = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState("Jobs Posted");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
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
  const [customJobs, setCustomJobs] = useState<PostedJob[]>([]);
  const [posting, setPosting] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const { createJob } = useApi();

  const seedJobs: PostedJob[] = jobs.map((job) => {
    const localized = job.translations.en;
    return {
      id: job.id,
      title: localized.title,
      posted: `Posted ${localized.postedTime}`,
      location: job.location,
      budget: `$${job.budget}`,
      experience: localized.experience,
      tags: localized.tags,
      liked: likedIds.has(job.id),
      applicants: job.applicants,
    };
  });

  const allJobs = [...seedJobs, ...customJobs];

  const postedJobs = allJobs.filter((job) =>
    activeTab === "Active Contracts" ? likedIds.has(job.id) : true,
  );

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const minWage = CATEGORY_MIN_WAGE[newJob.category] || 0;
  const positions = parseInt(newJob.positions, 10) || 1;
  const totalMinWage = minWage * positions;
  const budgetVal = parseInt(newJob.budget, 10) || 0;
  const budgetTooLow = budgetVal > 0 && budgetVal < totalMinWage;

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
        location: newJob.location || "Not specified",
        budget: budgetVal,
        budgetType: newJob.budgetType,
        experience: parseInt(newJob.experience, 10) || 0,
        category: newJob.category,
        startDate: newJob.startDate || new Date().toISOString(),
        endDate: newJob.endDate || undefined,
        minWage: minWageVal,
        positions,
      });
    } catch {
      // job still added locally below
    }
    const job: PostedJob = {
      id: Date.now(),
      title: newJob.title,
      posted: "Just now",
      location: newJob.location || "Location not specified",
      budget: newJob.budget ? `₹${newJob.budget}` : "Negotiable",
      experience: newJob.experience ? `${newJob.experience} yrs` : "Not specified",
      tags: [],
      liked: false,
      applicants: "0",
    };
    setCustomJobs((prev) => [job, ...prev]);
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
    setPosting(false);
    setShowAddForm(false);
    setActiveTab("Jobs Posted");
  };

  const renderJobCard = (job: PostedJob) => (
    <JobDetails
      key={job.id}
      job={{
        id: job.id,
        title: job.title,
        company: "Build Up",
        verified: false,
        posted: job.posted.replace(/^Posted\s+/i, ""),
        location: job.location,
        budget: job.budget,
        experience: job.experience,
        tags: job.tags,
      }}
      isLiked={likedIds.has(job.id)}
      onLikePress={() => toggleLike(job.id)}
      details={[
        { label: "Budget", value: job.budget },
        { label: "Applicants", value: job.applicants },
        { label: "Experience", value: job.experience },
      ]}
    />
  );

  const renderAddJobForm = () => (
    <View style={styles.addFormContainer}>
      <Text style={styles.addFormTitle}>Post a New Job</Text>

      <TextInput
        style={styles.textInput}
        label="Job Title *"
        placeholder="e.g. Carpenter Required"
        value={newJob.title}
        onChangeText={(text) => setNewJob((prev) => ({ ...prev, title: text }))}
      />

      <TextInput
        style={styles.textInput}
        label="Description"
        placeholder="Describe the job requirements..."
        value={newJob.description}
        onChangeText={(text) =>
          setNewJob((prev) => ({ ...prev, description: text }))
        }
        multiline
      />

      <CityDropdown
        label="Location *"
        value={newJob.location}
        onChange={(city) => {
          setNewJob((prev) => ({ ...prev, location: city }));
          if (formErrors.location) setFormErrors((p) => ({ ...p, location: "" }));
        }}
        placeholder="Select job city"
        error={formErrors.location}
      />

      {/* Category Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.inputLabel}>Category *</Text>
        <TouchableOpacity
          style={styles.dropdownBox}
          onPress={() => setCategoryDropdownOpen((o) => !o)}
          activeOpacity={0.85}
        >
          <Text style={styles.dropdownText}>
            {CATEGORY_LABELS[newJob.category]}
          </Text>
          <Image
            source={require("../../assets/Drop-down-arrow.png")}
            resizeMode="contain"
            style={[
              styles.dropdownIcon,
              categoryDropdownOpen && styles.dropdownIconOpen,
            ]}
          />
        </TouchableOpacity>
        {categoryDropdownOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.dropdownOption,
                    newJob.category === cat && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      newJob.category === cat && styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]} — ₹{CATEGORY_MIN_WAGE[cat]}/day
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <TextInput
            style={styles.textInput}
            label="Budget *"
            placeholder="e.g. 1000"
            keyboardType="numeric"
            value={newJob.budget}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, budget: text }))
            }
          />
        </View>
        <View style={styles.formHalf}>
          <TextInput
            style={styles.textInput}
            label="Experience (years)"
            placeholder="e.g. 3"
            keyboardType="numeric"
            value={newJob.experience}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, experience: text }))
            }
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={styles.inputLabel}>Budget Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BUDGET_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt}
                style={[
                  styles.chip,
                  newJob.budgetType === bt && styles.chipActive,
                ]}
                onPress={() =>
                  setNewJob((prev) => ({ ...prev, budgetType: bt }))
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    newJob.budgetType === bt && styles.chipTextActive,
                  ]}
                >
                  {bt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.formHalf}>
          <TextInput
            style={styles.textInput}
            label="Workers Needed *"
            placeholder="e.g. 2"
            keyboardType="numeric"
            value={newJob.positions}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, positions: text }))
            }
          />
        </View>
      </View>

      {/* Minimum Wage Summary */}
      {minWage > 0 && (
        <View style={styles.minWageSummary}>
          <Text style={styles.minWageText}>
            Min wage per worker: <Text style={styles.minWageBold}>₹{minWage}/day</Text>
          </Text>
          <Text style={styles.minWageText}>
            Workers: <Text style={styles.minWageBold}>{positions}</Text>
          </Text>
          <Text style={styles.minWageText}>
            Total minimum required: <Text style={styles.minWageBold}>₹{totalMinWage}</Text>
          </Text>
          {budgetTooLow && (
            <Text style={styles.minWageError}>
              Budget must be at least ₹{totalMinWage}
            </Text>
          )}
        </View>
      )}

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <TextInput
            style={styles.textInput}
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={newJob.startDate}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, startDate: text }))
            }
          />
        </View>
        <View style={styles.formHalf}>
          <TextInput
            style={styles.textInput}
            label="End Date (optional)"
            placeholder="YYYY-MM-DD"
            value={newJob.endDate}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, endDate: text }))
            }
          />
        </View>
      </View>

      <View style={styles.addFormActions}>
        <Button
          title="Cancel"
          variant="outline"
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
          onPress={() => setShowAddForm(false)}
        />
        <Button
          title={posting ? "Posting..." : "Post Job"}
          variant="secondary"
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
          onPress={handleAddJob}
          disabled={posting}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Job board</Text>
      </View>

      <View style={styles.tabsContainer}>
        {["Jobs Posted", "Active Contracts"].map((tab) => (
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {activeTab === "Active Contracts" && postedJobs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No active contracts</Text>
              <Text style={styles.emptySubtext}>
                Tap the heart icon on a posted job to move it here
              </Text>
            </View>
          )}

          {postedJobs.map(renderJobCard)}
        </View>
      </ScrollView>

      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderAddJobForm()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FAB — Post a new job */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddForm(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <BottomNavigation activeTab="jobBoard" />
    </SafeAreaView>
  );
};

export default JobBoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // FAB
  fab: {
    position: "absolute",
    right: wp("6%"),
    bottom: hp("10%"),
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    backgroundColor: "#965541",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#965541",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    zIndex: 10,
  },
  fabIcon: {
    color: "#FFFFFF",
    fontSize: wp("8%"),
    fontWeight: "bold",
    lineHeight: wp("10%"),
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
    marginBottom: hp("1.5%"),
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
    paddingTop: hp("1%"),
    paddingBottom: hp("12%"),
  },
  cardsContainer: {
    paddingHorizontal: wp("5%"),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: hp("8%"),
  },
  emptyTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: hp("1%"),
  },
  emptySubtext: {
    fontSize: wp("3.5%"),
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: wp("10%"),
  },
  /* Add Job Form */
  addFormContainer: {
    padding: wp("2%"),
  },
  addFormTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: hp("2.5%"),
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: hp("1.5%"),
  },
  inputLabel: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginBottom: hp("0.8%"),
    marginTop: hp("1%"),
  },
  textInput: {
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    color: "#1E1E1E",
    fontSize: wp("4%"),
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formHalf: {
    width: "48%",
  },
  addFormActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("3%"),
  },
  cancelButton: {
    width: "48%",
    borderColor: "#965541",
    borderWidth: 2,
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#965541",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  submitButton: {
    width: "48%",
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  chip: {
    borderColor: "#D8DADC",
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.8%"),
    marginRight: wp("2%"),
    marginBottom: hp("0.5%"),
  },
  chipActive: {
    borderColor: "#965541",
    backgroundColor: "#FFF5F0",
  },
  chipText: {
    color: "#666666",
    fontSize: wp("3%"),
  },
  chipTextActive: {
    color: "#965541",
    fontWeight: "bold",
  },
  dropdownBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("4%"),
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
  },
  dropdownIcon: {
    width: wp("4.5%"),
    height: wp("4.5%"),
  },
  dropdownIconOpen: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownMenu: {
    maxHeight: hp("28%"),
    borderColor: "#D8DADC",
    borderRadius: wp("3%"),
    borderWidth: 1,
    marginTop: hp("0.5%"),
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dropdownOption: {
    paddingVertical: hp("1.6%"),
    paddingHorizontal: wp("4%"),
    borderBottomColor: "#EEF0F2",
    borderBottomWidth: 1,
  },
  dropdownOptionSelected: {
    backgroundColor: "#F2E1DA",
  },
  dropdownOptionText: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
  },
  dropdownOptionTextSelected: {
    color: "#965541",
    fontWeight: "bold",
  },
  minWageSummary: {
    backgroundColor: "#FFF5F0",
    borderRadius: wp("3%"),
    padding: wp("4%"),
    marginTop: hp("1.5%"),
    borderWidth: 1,
    borderColor: "#965541",
  },
  minWageText: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    marginBottom: hp("0.5%"),
  },
  minWageBold: {
    fontWeight: "bold",
    color: "#965541",
  },
  minWageError: {
    color: "#D32F2F",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    marginTop: hp("0.5%"),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: wp("6%"),
    borderTopRightRadius: wp("6%"),
    padding: wp("6%"),
    maxHeight: hp("80%"),
  },
  /* BOTTOM NAVIGATION */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderTopWidth: 1,
    borderColor: "#E5E5E5",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: hp("3%"),
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIconInactive: {
    width: wp("6%"),
    height: wp("6%"),
    marginBottom: hp("0.5%"),
    opacity: 0.4,
  },
  navIconActive: {
    width: wp("6%"),
    height: wp("6%"),
    marginBottom: hp("0.5%"),
    tintColor: "#965541",
  },
  navTextInactive: {
    fontSize: wp("2.5%"),
    fontWeight: "bold",
    color: "#A4A9B6",
  },
  navTextActive: {
    fontSize: wp("2.5%"),
    fontWeight: "bold",
    color: "#965541",
  },
  profileNavAvatar: {
    width: wp("7%"),
    height: wp("7%"),
    backgroundColor: "#FFD1DC",
    borderRadius: wp("3.5%"),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  homeIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingBottom: hp("1%"),
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  homeIndicator: {
    width: wp("35%"),
    height: hp("0.6%"),
    backgroundColor: "#000000",
    borderRadius: wp("1%"),
  },
});
