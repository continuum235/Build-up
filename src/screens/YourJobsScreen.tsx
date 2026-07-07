import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
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
import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../services/api";

const ChatIcon = require("../../assets/message.png");

interface YourJobsScreenProps {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    typeof routes.yourJobs
  >;
}

type JobTab = "Active Jobs" | "Completed Jobs";

interface EngagementItem {
  id: string;
  status: string;
  job: Record<string, unknown>;
}

const YourJobsScreen: React.FC<YourJobsScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { getMyWorkerJobs, updateEngagement } = useApi();
  const [activeTab, setActiveTab] = useState<JobTab>("Active Jobs");
  const [engagements, setEngagements] = useState<EngagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const [cancelModal, setCancelModal] = useState<{
    visible: boolean;
    engagementId: string;
  }>({ visible: false, engagementId: "" });
  const [cancelReason, setCancelReason] = useState("");

  const fetchJobs = useCallback(() => {
    getMyWorkerJobs()
      .then((data: Record<string, unknown>) => {
        setEngagements(
          ((data as { engagements: EngagementItem[] }).engagements ?? []) as EngagementItem[],
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getMyWorkerJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const activeEngagements = engagements.filter((e) => e.status === "ACTIVE");
  const completedEngagements = engagements.filter((e) => e.status === "COMPLETED");

  const getTabLabel = (tab: JobTab) => {
    switch (tab) {
      case "Active Jobs":
        return t("yourJobs.activeJobs");
      case "Completed Jobs":
        return t("yourJobs.completedJobs");
    }
  };

  const handleComplete = async (engagementId: string) => {
    setActingId(engagementId);
    try {
      await updateEngagement(engagementId, { status: "COMPLETED" });
      fetchJobs();
    } catch {
      Alert.alert("Error", "Failed to mark job as completed");
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = async () => {
    const { engagementId } = cancelModal;
    if (!cancelReason.trim()) {
      Alert.alert("Reason required", "Please provide a reason for cancellation");
      return;
    }
    setActingId(engagementId);
    setCancelModal({ visible: false, engagementId: "" });
    try {
      await updateEngagement(engagementId, {
        status: "CANCELLED",
        cancellationReason: cancelReason.trim(),
      });
      setCancelReason("");
      fetchJobs();
    } catch {
      Alert.alert("Error", "Failed to cancel engagement");
    } finally {
      setActingId(null);
    }
  };

  const renderJobCard = (engagement: EngagementItem) => {
    const job = engagement.job;
    const title = String(job.title ?? "");
    const hirerName = (job.hirer as Record<string, unknown> | undefined)?.name as string ?? "";
    const location = String(job.location ?? "");
    const budget = Number(job.budget ?? 0);
    const experience = String(job.experience ?? "");

    return (
      <View key={engagement.id} style={styles.card}>
        <JobDetails
          job={{
            id: String(job.id),
            title,
            company: hirerName,
            verified: false,
            posted: "",
            location,
            budget: `$${budget}`,
            experience,
            tags: [],
          }}
          verifiedLabel={t("yourJobs.userVerified")}
          postedPrefix=""
          onPress={() =>
            navigation.navigate(routes.jobDetails, { jobId: job.id as string })
          }
          details={[
            { label: t("yourJobs.budget"), value: `$${budget}` },
            { label: t("yourJobs.experience"), value: experience },
          ]}
        />

        {engagement.status === "ACTIVE" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              activeOpacity={0.8}
              onPress={() => handleComplete(engagement.id)}
              disabled={actingId === engagement.id}
            >
              {actingId === engagement.id ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>
                  {t("yourJobs.complete")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              activeOpacity={0.8}
              onPress={() =>
                setCancelModal({ visible: true, engagementId: engagement.id })
              }
              disabled={actingId === engagement.id}
            >
              <Text style={styles.cancelBtnText}>
                {t("yourJobs.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatBtn} activeOpacity={0.8}>
              <Image
                source={ChatIcon}
                style={styles.chatIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t("yourJobs.title")}</Text>
      </View>

      <View style={styles.tabsContainer}>
        {(["Active Jobs", "Completed Jobs"] as JobTab[]).map((tab) => (
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
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#965541"
            style={{ marginTop: hp("10%") }}
          />
        ) : (
          <View style={styles.cardsContainer}>
            {activeTab === "Active Jobs" && activeEngagements.length === 0 && (
              <Text style={styles.emptyText}>
                {t("yourJobs.noActiveJobs")}
              </Text>
            )}
            {activeTab === "Completed Jobs" &&
              completedEngagements.length === 0 && (
                <Text style={styles.emptyText}>
                  {t("yourJobs.noCompletedJobs")}
                </Text>
              )}

            {activeTab === "Active Jobs" &&
              activeEngagements.map(renderJobCard)}
            {activeTab === "Completed Jobs" &&
              completedEngagements.map(renderJobCard)}
          </View>
        )}
      </ScrollView>

      <BottomNavigation activeTab="yourJobs" />

      <Modal
        visible={cancelModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCancelModal({ visible: false, engagementId: "" })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("yourJobs.cancelReasonTitle")}
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder={t("yourJobs.cancelReasonPlaceholder")}
              placeholderTextColor="#A4A9B6"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setCancelModal({ visible: false, engagementId: "" });
                  setCancelReason("");
                }}
              >
                <Text style={styles.modalCancelBtnText}>
                  {t("yourJobs.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleCancel}
              >
                <Text style={styles.modalConfirmBtnText}>
                  {t("yourJobs.submitCancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-around",
    paddingHorizontal: wp("6%"),
    marginBottom: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabButton: {
    alignItems: "center",
    paddingBottom: hp("1%"),
    flex: 1,
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
  cardsContainer: {
    paddingHorizontal: wp("5%"),
  },
  emptyText: {
    textAlign: "center",
    color: "#A4A9B6",
    fontSize: wp("4%"),
    marginTop: hp("10%"),
  },
  card: {
    marginBottom: hp("2%"),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("1%"),
    gap: wp("2%"),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtn: {
    backgroundColor: "#965541",
    borderRadius: wp("3%"),
  },
  cancelBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#965541",
    borderRadius: wp("3%"),
  },
  cancelBtnText: {
    color: "#965541",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  chatBtn: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  chatIcon: {
    width: wp("5%"),
    height: wp("5%"),
    tintColor: "#965541",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp("85%"),
    backgroundColor: "#FFF",
    borderRadius: wp("4%"),
    padding: wp("6%"),
  },
  modalTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: hp("2%"),
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: wp("2%"),
    padding: wp("3%"),
    fontSize: wp("3.8%"),
    color: "#1E1E1E",
    minHeight: hp("12%"),
    marginBottom: hp("2%"),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp("3%"),
  },
  modalBtn: {
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("6%"),
    borderRadius: wp("2%"),
  },
  modalCancelBtn: {
    backgroundColor: "#F0F0F0",
  },
  modalCancelBtnText: {
    color: "#666",
    fontSize: wp("3.8%"),
    fontWeight: "500",
  },
  modalConfirmBtn: {
    backgroundColor: "#FF3B30",
  },
  modalConfirmBtnText: {
    color: "#FFF",
    fontSize: wp("3.8%"),
    fontWeight: "bold",
  },
});
