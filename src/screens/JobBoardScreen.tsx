import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import routes, { RootStackParamList } from "../navigation/routes";
import jobsData from "../data/jobsSeedData.json";

const HeartIcon = require("../../assets/heart.png");
const LocationIcon = require("../../assets/location.png");
const YourJobsIcon = require("../../assets/yourjobs.png");
const GirlIcon = require("../../assets/Girl.png");
const MessageIcon = require("../../assets/message.png");

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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const JobBoardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
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

  const seedJobs: PostedJob[] = jobsData.jobs.map((job) => {
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

  const handleAddJob = () => {
    if (!newJob.title.trim()) return;
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
    setShowAddForm(false);
    setActiveTab("Jobs Posted");
  };

  const renderJobCard = (job: PostedJob) => (
    <View key={job.id} style={styles.jobCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleLike(job.id)}
        >
          <Image
            source={HeartIcon}
            style={[
              styles.heartIcon,
              likedIds.has(job.id) && styles.heartIconActive,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.postedText}>{job.posted}</Text>

      <View style={styles.locationRow}>
        <Image
          source={LocationIcon}
          style={styles.locationIcon}
          resizeMode="contain"
        />
        <Text style={styles.locationText}>{job.location}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Budget</Text>
          <Text style={styles.detailValue}>{job.budget}</Text>
        </View>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Applicants</Text>
          <Text style={styles.detailValue}>{job.applicants}</Text>
        </View>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Experience</Text>
          <Text style={styles.detailValue}>{job.experience}</Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {job.tags.map((tag, index) => (
          <View key={index} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAddJobForm = () => (
    <View style={styles.addFormContainer}>
      <Text style={styles.addFormTitle}>Post a New Job</Text>

      <Text style={styles.inputLabel}>Job Title *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. Carpenter Required"
        placeholderTextColor="#A4A9B6"
        value={newJob.title}
        onChangeText={(text) => setNewJob((prev) => ({ ...prev, title: text }))}
      />

      <Text style={styles.inputLabel}>Location</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. Thane, Mumbai"
        placeholderTextColor="#A4A9B6"
        value={newJob.location}
        onChangeText={(text) =>
          setNewJob((prev) => ({ ...prev, location: text }))
        }
      />

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={styles.inputLabel}>Budget ($)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 1000"
            placeholderTextColor="#A4A9B6"
            keyboardType="numeric"
            value={newJob.budget}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, budget: text }))
            }
          />
        </View>
        <View style={styles.formHalf}>
          <Text style={styles.inputLabel}>Experience</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Skilled"
            placeholderTextColor="#A4A9B6"
            value={newJob.experience}
            onChangeText={(text) =>
              setNewJob((prev) => ({ ...prev, experience: text }))
            }
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>Tags (comma separated)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. Tag 1, Tag 2"
        placeholderTextColor="#A4A9B6"
        value={newJob.tags}
        onChangeText={(text) => setNewJob((prev) => ({ ...prev, tags: text }))}
      />

      <View style={styles.addFormActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowAddForm(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddJob}>
          <Text style={styles.submitButtonText}>Post Job</Text>
        </TouchableOpacity>
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

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={YourJobsIcon}
            style={styles.navIconActive}
            resizeMode="contain"
          />
          <Text style={styles.navTextActive}>Job board</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate(routes.profile)}
        >
          <View style={styles.profileNavAvatar}>
            <Image
              source={GirlIcon}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.navTextInactive}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate(routes.messages)}
        >
          <Image
            source={MessageIcon}
            style={styles.navIconInactive}
            resizeMode="contain"
          />
          <Text style={styles.navTextInactive}>Messages</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.homeIndicatorWrapper}>
        <View style={styles.homeIndicator} />
      </View>
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
    flex: 1,
    borderColor: "#965541",
    borderWidth: 2,
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    marginRight: wp("3%"),
  },
  cancelButtonText: {
    color: "#965541",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#965541",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    marginLeft: wp("3%"),
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
