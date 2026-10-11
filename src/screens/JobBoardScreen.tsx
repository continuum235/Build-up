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
import { useApi } from "../services/api";
import { CATEGORIES, CATEGORY_MIN_WAGE, CATEGORY_LABELS, Category } from "../data/categoryWages";
import BottomNavigation from "../components/layout/BottomNavigation";
import JobDetails from "../components/jobs/JobDetails";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";
import CityDropdown from "../components/ui/CityDropdown";
import { jobPostSchema } from "../utils/schemas";

const BUDGET_TYPES = ["HOURLY", "DAILY", "FIXED"] as const;

interface ApiJob {
  id: string;
  title: string;
  location: string;
  budget: number | string;
  budgetType: string;
  experience: number;
  category: string;
  status: string;
  positions: number;
  filledCount: number;
  createdAt: string;
  hirer: { id: string; name: string } | any;
}

const JobBoardScreen: React.FC = () => {
  const { getMyHirerJobs, createJob, updateJob, deleteJob, updateEngagement, createReview, createOrFindConversation } = useApi();
  const [activeTab, setActiveTab] = useState("Jobs Posted");
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
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ visible: boolean; engagementId: string; workerName: string }>({ visible: false, engagementId: "", workerName: "" });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyHirerJobs();
      const j = (data as any).jobs ?? [];
      setJobs(j);
      const engs: any[] = [];
      for (const job of j) {
        if (job.engagements) {
          for (const e of job.engagements) {
            engs.push({ ...e, job: job });
          }
        }
      }
      setEngagements(engs);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getMyHirerJobs]);

  useEffect(() => {
    fetchData();
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
      setShowAddForm(false);
      fetchData();
    } catch (e: any) {
      const msg = e?.errors?.[0]?.message || e?.message || "Failed to post job";
      Alert.alert("Error", msg);
    } finally {
      setPosting(false);
    }
  };

  const minWage = CATEGORY_MIN_WAGE[newJob.category] || 0;
  const positions = parseInt(newJob.positions, 10) || 1;
  const totalMinWage = minWage * positions;
  const budgetValCalc = parseInt(newJob.budget, 10) || 0;
  const budgetTooLow = budgetValCalc > 0 && budgetValCalc < totalMinWage;

  return null;
};

export default JobBoardScreen;
