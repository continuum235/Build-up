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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import routes from "../navigation/routes";
import jobsData from "../data/jobsSeedData.json";
import BroadcastJobsEmptyState from "../components/BroadcastJobsEmptyState";
import BottomNavigation from "../components/BottomNavigation";

const SearchIcon = require("../../assets/Search.png");
const HeartIcon = require("../../assets/heart.png");
const LocationIcon = require("../../assets/location.png");
const VerifiedIcon = require("../../assets/tick.png");

interface FindJobsScreenProps {
    navigation: any;
}

export default ({ navigation }: FindJobsScreenProps) => {
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("Best Matches");
    const [activeFilter, setActiveFilter] = useState("All");
    const [likedJobIds, setLikedJobIds] = useState(
        () => new Set<number>(jobsData.jobs.filter((job) => job.liked).map((job) => job.id))
    );

    const filters = ["All", ...jobsData.categories];
    const normalizedSearch = searchText.trim().toLowerCase();
    const isBroadcastTab = activeTab === "Broadcasted Jobs";
    const isLikedTab = activeTab === "Liked Jobs";

    const toggleLike = (jobId: number) => {
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

    const filteredJobs = jobsData.jobs.filter((job) => {
        if (isLikedTab && !likedJobIds.has(job.id)) {
            return false;
        }
        if (activeFilter !== "All" && job.category !== activeFilter) {
            return false;
        }
        if (!normalizedSearch) {
            return true;
        }
        const haystack = `${job.title} ${job.company} ${job.location}`.toLowerCase();
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
                <Text style={styles.pageTitle}>Find Jobs</Text>

                {/* SEARCH BAR */}
                <View style={styles.searchBar}>
                    <Image source={SearchIcon} resizeMode="contain" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search for a job"
                        placeholderTextColor="#A4A9B6"
                        value={searchText}
                        onChangeText={setSearchText}
                        style={styles.searchInput}
                    />
                </View>

                {/* TABS */}
                <View style={styles.tabsContainer}>
                    {["Best Matches", "Broadcasted Jobs", "Liked Jobs"].map((tab) => (
                        <TouchableOpacity key={tab} style={styles.tabButton} onPress={() => setActiveTab(tab)}>
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                            {activeTab === tab && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FILTER CHIPS */}
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
                                activeFilter === filter ? styles.filterChipActive : styles.filterChipInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    activeFilter === filter ? styles.filterTextActive : styles.filterTextInactive,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* JOB LIST */}
                <View style={styles.cardsContainer}>
                    {isBroadcastTab && <BroadcastJobsEmptyState />}

                    {!isBroadcastTab && filteredJobs.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateTitle}>No jobs found</Text>
                            <Text style={styles.emptyStateText}>Try adjusting filters or search terms.</Text>
                        </View>
                    )}

                    {!isBroadcastTab &&
                        filteredJobs.map((job) => {
                            const isLiked = likedJobIds.has(job.id);
                            return (
                                <TouchableOpacity
                                    key={job.id}
                                    style={styles.jobCard}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate(routes.jobDetails, { jobId: job.id })}
                                >
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.jobTitle}>{job.title}</Text>
                                        <TouchableOpacity
                                            style={styles.heartButton}
                                            onPress={() => toggleLike(job.id)}
                                        >
                                            <Image
                                                source={HeartIcon}
                                                resizeMode="contain"
                                                style={[
                                                    styles.heartIcon,
                                                    isLiked ? styles.heartIconActive : styles.heartIconInactive,
                                                ]}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.companyRow}>
                                        <Text style={styles.companyName}>{job.company}</Text>
                                        {job.verified && (
                                            <View style={styles.verifiedBadge}>
                                                <Image source={VerifiedIcon} resizeMode="contain" style={styles.verifiedIcon} />
                                                <Text style={styles.verifiedText}>User Verified</Text>
                                            </View>
                                        )}
                                        <Text style={styles.postedText}> - Posted {job.postedTime}</Text>
                                    </View>

                                    <View style={styles.locationRow}>
                                        <Image source={LocationIcon} resizeMode="contain" style={styles.locationIcon} />
                                        <Text style={styles.locationText}>{job.location}</Text>
                                    </View>

                                    <View style={styles.detailsRow}>
                                        <View style={styles.detailBlock}>
                                            <Text style={styles.detailLabel}>Budget</Text>
                                            <Text style={styles.detailValue}>${job.budget}</Text>
                                        </View>
                                        <View style={styles.detailBlock}>
                                            <Text style={styles.detailLabel}>Experience</Text>
                                            <Text style={styles.detailValue}>{job.experience}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.tagsRow}>
                                        {job.tags.map((tag, idx) => (
                                            <View key={`${job.id}-${idx}`} style={styles.tagChip}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                </View>
            </ScrollView>

            <BottomNavigation navigation={navigation} activeTab="findJobs" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    pageTitle: {
        fontSize: wp("6%"),
        fontWeight: "700",
        color: "#000000",
        marginHorizontal: wp("5%"),
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
        paddingHorizontal: wp("5%"),
        marginBottom: hp("2%"),
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    tabButton: {
        marginRight: wp("4%"),
    },
    tabText: {
        fontSize: wp("3.5%"),
        color: "#A4A9B6",
        fontWeight: "500",
        paddingBottom: hp("1.5%"),
    },
    tabTextActive: {
        color: "#000000",
        fontWeight: "600",
    },
    activeIndicator: {
        width: "100%",
        height: 2,
        backgroundColor: "#FF6B35",
        borderRadius: 1,
        marginTop: -1,
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
        backgroundColor: "#FF6B35",
        borderColor: "#FF6B35",
    },
    filterChipInactive: {
        backgroundColor: "#FFFFFF",
        borderColor: "#FF6B35",
    },
    filterText: {
        fontSize: wp("3.6%"),
        fontWeight: "600",
    },
    filterTextActive: {
        color: "#FFFFFF",
    },
    filterTextInactive: {
        color: "#FF6B35",
    },
    cardsContainer: {
        paddingHorizontal: wp("5%"),
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
        tintColor: "#FF6B35",
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
        color: "#FF6B35",
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
        borderColor: "#FF6B35",
        borderRadius: wp("2%"),
        borderWidth: 1,
        paddingVertical: hp("0.8%"),
        paddingHorizontal: wp("3.5%"),
        marginRight: wp("2%"),
        marginBottom: hp("1%"),
    },
    tagText: {
        color: "#FF6B35",
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