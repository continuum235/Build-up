import React, { useState } from "react";
import { 
    View, 
    ScrollView, 
    Text, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    StatusBar,
    TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import routes from "../navigation/routes";
import jobsData from "../data/jobsSeedData.json";
import JobDetails from "../components/JobDetails";
import BroadcastJobsEmptyState from "../components/BroadcastJobsEmptyState";
import BottomNavigation from "../components/BottomNavigation";

interface FindJobsScreenProps {
    navigation: any;
}

export default ({ navigation }: FindJobsScreenProps) => {
    // Interactive states for UI tabs and filters
    const [activeTab, setActiveTab] = useState("Best Matches");
    const [activeFilter, setActiveFilter] = useState("Painter");
    const [likedJobIds, setLikedJobIds] = useState<(string | number)[]>([]);

    // Use the first two jobs from the seed data
    const jobListings = jobsData.jobs.slice(0, 2).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        verified: job.verified,
        posted: job.postedTime,
        location: job.location,
        budget: `$${job.budget}`,
        experience: job.experience,
        tags: job.tags,
        isBroadcasted: false,
        isLiked: likedJobIds.includes(job.id)
    }));

    // Broadcasted jobs data
    const broadcastedJobListings = jobsData.jobs.slice(2, 4).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        verified: job.verified,
        posted: job.postedTime,
        location: job.location,
        budget: `$${job.budget}`,
        experience: job.experience,
        tags: job.tags,
        isBroadcasted: true,
        isLiked: likedJobIds.includes(job.id)
    }));

    // Get all liked jobs data
    const allJobs = jobsData.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        verified: job.verified,
        posted: job.postedTime,
        location: job.location,
        budget: `$${job.budget}`,
        experience: job.experience,
        tags: job.tags,
        isBroadcasted: false,
        isLiked: likedJobIds.includes(job.id)
    }));

    const likedJobListings = allJobs.filter(job => job.isLiked);

    // Handle like button press
    const handleLikePress = (jobId: string | number) => {
        setLikedJobIds(prevLikedIds => 
            prevLikedIds.includes(jobId) 
                ? prevLikedIds.filter(id => id !== jobId)
                : [...prevLikedIds, jobId]
        );
    };

    // Get jobs based on active tab
    const getJobsForTab = () => {
        switch(activeTab) {
            case "Broadcasted Jobs":
                return broadcastedJobListings;
            case "Liked Jobs":
                return likedJobListings;
            default:
                return jobListings;
        }
    };

    const displayedJobs = getJobsForTab();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* MAIN SCROLL VIEW */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* PAGE TITLE */}
                <Text style={styles.pageTitle}>Find Jobs</Text>

                {/* SEARCH BAR */}
                <View style={styles.searchContainer}>
                    <Image
                        source={require("../../assets/Search.png")}
                        style={styles.searchIconImage}
                        resizeMode="contain"
                    />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search for a job"
                        placeholderTextColor="#A4A9B6"
                    />
                </View>

                {/* TEXT TABS */}
                <View style={styles.tabContainer}>
                    {["Best Matches", "Broadcasted Jobs", "Liked Jobs"].map((tab) => (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                            <Text style={[
                                styles.tabText, 
                                activeTab === tab && styles.tabTextActive
                            ]}>
                                {tab}
                            </Text>
                            {activeTab === tab && <View style={styles.activeTabUnderline} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* HORIZONTAL FILTER PILLS */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                    style={styles.filterContainer}
                >
                    {["Painter", "Carpenter", "Labourer", "Mason"].map((filter) => (
                        <TouchableOpacity 
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            style={[
                                styles.filterPill, 
                                activeFilter === filter ? styles.filterPillActive : styles.filterPillInactive
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter ? styles.filterTextActive : styles.filterTextInactive
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* JOB CARDS LIST */}
                <View style={styles.cardsContainer}>
                    {activeTab === "Broadcasted Jobs" && (
                        <BroadcastJobsEmptyState />
                    )}
                    {displayedJobs.length === 0 && activeTab === "Liked Jobs" && (
                        <View style={styles.emptyLikedJobsContainer}>
                            <Text style={styles.emptyLikedJobsText}>No liked jobs yet</Text>
                        </View>
                    )}
                    {displayedJobs.map((job) => (
                        <JobDetails
                            key={job.id} 
                            job={job}
                            isLiked={job.isLiked}
                            onPress={() => navigation.navigate(routes.jobDetails, { jobId: job.id })}
                            onLikePress={() => handleLikePress(job.id)}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* BOTTOM NAVIGATION BAR */}
            <BottomNavigation navigation={navigation} activeTab="findJobs" />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: hp('2%'),
        paddingBottom: hp('10%'), // Gives room for the bottom nav
    },
    pageTitle: {
        fontSize: wp('6%'),
        fontWeight: "bold",
        color: "#1E1E1E",
        textAlign: "center",
        marginBottom: hp('3%'),
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#E5E5E5",
        borderWidth: 1.5,
        borderRadius: wp('4%'),
        marginHorizontal: wp('6%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
        marginBottom: hp('3%'),
    },
    searchIconImage: {
        width: wp('5%'),
        height: wp('5%'),
        marginRight: wp('3%'),
        tintColor: "#965541",
    },
    searchInput: {
        flex: 1,
        fontSize: wp('4%'),
        color: "#1E1E1E",
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: wp('6%'),
        marginBottom: hp('2.5%'),
        justifyContent: 'space-between',
    },
    tabText: {
        fontSize: wp('4%'),
        color: "#888888",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#965541",
        fontWeight: "bold",
    },
    activeTabUnderline: {
        height: 2,
        backgroundColor: "#965541",
        marginTop: hp('1%'),
        width: '100%',
    },
    filterContainer: {
        marginBottom: hp('3%'),
    },
    filterScrollContent: {
        paddingHorizontal: wp('6%'),
        gap: wp('3%'), // Adds space between items without needing margins
    },
    filterPill: {
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('6%'),
        borderRadius: wp('6%'),
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
        marginRight: wp('3%'),
    },
    filterPillActive: {
        backgroundColor: "#965541",
        borderColor: "#965541",
    },
    filterPillInactive: {
        backgroundColor: "#FFFFFF",
        borderColor: "#965541",
    },
    filterText: {
        fontSize: wp('4%'),
        fontWeight: "600",
    },
    filterTextActive: {
        color: "#FFFFFF",
    },
    filterTextInactive: {
        color: "#965541",
    },
    cardsContainer: {
        paddingHorizontal: wp('6%'),
    },
    emptyLikedJobsContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp('8%'),
        marginBottom: hp('3%'),
    },
    emptyLikedJobsText: {
        fontSize: wp('4%'),
        color: "#A4A9B6",
        fontWeight: "500",
    },
});
