import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useLanguage } from "../context/LanguageContext";
import seedData from "../data/jobsSeedData.json";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  budget: number;
  experience: string;
  tags: string[];
  postedTime: string;
  verified: boolean;
  liked: boolean;
  category: string;
  coordinates: { lat: number; lng: number };
}

interface Coordinates {
  lat: number;
  lng: number;
}

const { jobs: JOBS_SEED_DATA, categories: CATEGORIES, cityCoordinates: CITY_COORDINATES } = seedData;

// Helper function to calculate distance between two coordinates
const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FindJobsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("best");
  const [jobs, setJobs] = useState<Job[]>(JOBS_SEED_DATA);
  const [userLocation] = useState<Coordinates>({ lat: 19.2183, lng: 72.9781 }); // Default: Thane

  // Toggle like for a job
  const handleLikeToggle = (jobId: number) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, liked: !job.liked } : job
      )
    );
  };

  // Filter and sort jobs based on search, category, and tab
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((job) => job.category === selectedCategory);
    }

    // Filter by tab
    if (activeTab === "liked") {
      result = result.filter((job) => job.liked);
    }

    // Sort based on tab
    if (activeTab === "best") {
      // Best matches: sort by distance (closest first) and then by budget (highest first)
      result = result.sort((a, b) => {
        const distA = calculateDistance(userLocation, a.coordinates);
        const distB = calculateDistance(userLocation, b.coordinates);
        if (distA !== distB) return distA - distB;
        return b.budget - a.budget;
      });
    } else if (activeTab === "high-paying") {
      // High paying: sort by budget (highest first)
      result = result.sort((a, b) => b.budget - a.budget);
    } else if (activeTab === "broadcasted") {
      // Broadcasted: keep original order
      result = result;
    }

    return result;
  }, [jobs, searchQuery, selectedCategory, activeTab, userLocation]);

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.companyRow}>
            <Text style={styles.companyName}>{item.company}</Text>
            {item.verified && (
              <Image
                source={require("../../assets/Profile-logo.png")}
                style={styles.verifiedIcon}
                resizeMode="contain"
              />
            )}
            <Text style={styles.postedTime}>{item.postedTime}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleLikeToggle(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.likeButton}>{item.liked ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationRow}>
        <Image
          source={require("../../assets/Profile-logo.png")}
          style={styles.locationIcon}
          resizeMode="contain"
        />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Budget</Text>
          <Text style={styles.detailsValue}>${item.budget}</Text>
        </View>
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Experience</Text>
          <Text style={styles.detailsValue}>{item.experience}</Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {item.tags.map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Jobs</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require("../../assets/Profile-logo.png")}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a job"
          placeholderTextColor="#A4A9B6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === category ? null : category
              )
            }
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category &&
                  styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "best" && styles.tabActive]}
          onPress={() => setActiveTab("best")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "best" && styles.tabTextActive,
            ]}
          >
            Best Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "broadcasted" && styles.tabActive,
          ]}
          onPress={() => setActiveTab("broadcasted")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "broadcasted" && styles.tabTextActive,
            ]}
          >
            Broadcasted Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "liked" && styles.tabActive]}
          onPress={() => setActiveTab("liked")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "liked" && styles.tabTextActive,
            ]}
          >
            Liked Jobs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No jobs found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(5),
    marginVertical: hp(2),
    paddingHorizontal: wp(3),
    backgroundColor: "#FFFFFF",
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  searchIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    paddingVertical: hp(1.5),
    fontSize: wp(3.5),
    color: "#1A1A1A",
  },
  categoriesScroll: {
    marginVertical: hp(1),
    paddingLeft: wp(5),
  },
  categoriesContent: {
    paddingRight: wp(5),
  },
  categoryButton: {
    minHeight: hp(5),
    width: wp(28),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginRight: wp(2),
    borderRadius: wp(5),
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#A55A4C",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonActive: {
    backgroundColor: "#A55A4C",
    borderColor: "#A55A4C",
  },
  categoryButtonText: {
    fontSize: wp(3.2),
    fontWeight: "500",
    color: "#7A3529",
    textAlign: "center",
  },
  categoryButtonTextActive: {
    color: "#FFFFFF",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    backgroundColor: "#FFFFFF",
  },
  tab: {
    flex: 1,
    paddingVertical: hp(2),
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#A55A4C",
  },
  tabText: {
    fontSize: wp(3),
    fontWeight: "500",
    color: "#A4A9B6",
  },
  tabTextActive: {
    color: "#A55A4C",
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(1.5),
  },
  titleSection: {
    flex: 1,
    marginRight: wp(2),
  },
  jobTitle: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: hp(0.5),
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyName: {
    fontSize: wp(2.8),
    fontWeight: "500",
    color: "#4A5568",
  },
  verifiedIcon: {
    width: wp(3),
    height: wp(3),
    marginHorizontal: wp(1),
  },
  postedTime: {
    fontSize: wp(2.5),
    color: "#A4A9B6",
    marginLeft: wp(1),
  },
  likeButton: {
    fontSize: wp(5),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  locationIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(1.5),
  },
  locationText: {
    fontSize: wp(2.8),
    color: "#A55A4C",
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.5),
    paddingVertical: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  detailsItem: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: wp(2.5),
    color: "#A4A9B6",
    marginBottom: hp(0.3),
  },
  detailsValue: {
    fontSize: wp(3.2),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  tag: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.6),
    marginRight: wp(1.5),
    backgroundColor: "#FBF4F4",
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: "#E8D9D9",
  },
  tagText: {
    fontSize: wp(2.3),
    color: "#A55A4C",
    fontWeight: "500",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(10),
  },
  emptyStateText: {
    fontSize: wp(3.5),
    color: "#A4A9B6",
    fontWeight: "500",
  },
});

export default FindJobsScreen;
