import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useJobs } from "../hooks/useJobs";
import { useApi } from "../services/api";
import BottomNavigation from "../components/layout/BottomNavigation";
import JobDetails from "../components/jobs/JobDetails";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

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
    location: "",
    budget: "",
    experience: "",
    tags: "",
  });
  const [customJobs, setCustomJobs] = useState<PostedJob[]>([]);
  const [posting, setPosting] = useState(false);
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

  const handleAddJob = async () => {
    if (!newJob.title.trim()) return;
    setPosting(true);
    try {
      await createJob({
        title: newJob.title,
        description: newJob.title,
        location: newJob.location || "Not specified",
        budget: parseInt(newJob.budget, 10) || 0,
        budgetType: "FIXED",
        experience: 0,
        category: "OTHER",
        startDate: new Date().toISOString(),
      });
    } catch {
      // job still added locally below
    }
    const job: PostedJob = {
      id: Date.now(),
      title: newJob.title,
      posted: "Just now",
      location: newJob.location || "Location not specified",
      budget: newJob.budget ? `$${newJob.budget}` : "Negotiable",
      experience: newJob.experience || "Not specified",
      tags: newJob.tags
        ? newJob.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      liked: false,
      applicants: "0",
    };
    setCustomJobs((prev) => [job, ...prev]);
    setNewJob({
      title: "",
      location: "",
      budget: "",
      experience: "",
      tags: "",
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
        label="Location"
        placeholder="e.g. Thane, Mumbai"
        value={newJob.location}
        onChangeText={(text) =>
          setNewJob((prev) => ({ ...prev, location: text }))
        }
      />

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <TextInput
            style={styles.textInput}
            label="Budget ($)"
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
            label="Experience"
            placeholder="e.g. Skilled"
            value={newJob.experience}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, experience: text }))
            }
          />
        </View>
      </View>

      <TextInput
        style={styles.textInput}
        label="Tags (comma separated)"
        placeholder="e.g. Tag 1, Tag 2"
        value={newJob.tags}
        onChangeText={(text) => setNewJob((prev) => ({ ...prev, tags: text }))}
      />

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
        {["Jobs Posted", "Active Contracts", "Add Job"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => {
              setActiveTab(tab);
              if (tab === "Add Job") setShowAddForm(true);
            }}
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

          {activeTab !== "Add Job" && postedJobs.map(renderJobCard)}
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
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#965541",
    borderRadius: wp("6%"),
    borderWidth: 1,
    padding: wp("5%"),
    marginBottom: hp("2%"),
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp("0.5%"),
  },
  jobTitle: {
    color: "#965541",
    fontSize: wp("5%"),
    fontWeight: "bold",
    flex: 1,
    marginRight: wp("3%"),
    lineHeight: wp("6.5%"),
  },
  heartButton: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    borderWidth: 1,
    borderColor: "#965541",
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    width: wp("4%"),
    height: wp("4%"),
    tintColor: "#965541",
  },
  heartIconActive: {
    tintColor: "#FF3B30",
  },
  postedText: {
    color: "#666666",
    fontSize: wp("3.5%"),
    marginBottom: hp("1.5%"),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  locationIcon: {
    width: wp("4%"),
    height: wp("4%"),
    marginRight: wp("1.5%"),
    tintColor: "#965541",
  },
  locationText: {
    color: "#1E1E1E",
    fontSize: wp("3.8%"),
    textDecorationLine: "underline",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  detailBlock: {
    flexDirection: "column",
  },
  detailLabel: {
    color: "#965541",
    fontSize: wp("3.5%"),
    marginBottom: hp("0.5%"),
  },
  detailValue: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: wp("4.8%"),
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagPill: {
    borderColor: "#965541",
    borderRadius: wp("2.5%"),
    borderWidth: 1,
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("4%"),
    marginRight: wp("2%"),
  },
  tagText: {
    color: "#965541",
    fontSize: wp("3%"),
    fontWeight: "bold",
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
