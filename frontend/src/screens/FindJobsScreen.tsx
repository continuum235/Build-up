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

interface FindJobsScreenProps {
    navigation: any;
}

export default ({ navigation }: FindJobsScreenProps) => {
    // Interactive states for UI tabs and filters
    const [activeTab, setActiveTab] = useState("Best Matches");
    const [activeFilter, setActiveFilter] = useState("Painter");

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
        isBroadcasted: false
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
        isBroadcasted: true
    }));

    // Liked jobs data
    const likedJobListings = jobsData.jobs.slice(0, 1).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        verified: job.verified,
        posted: job.postedTime,
        location: job.location,
        budget: `$${job.budget}`,
        experience: job.experience,
        tags: job.tags,
        isBroadcasted: false
    }));

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
                    {displayedJobs.map((job) => (
                        <JobDetails
                            key={job.id} 
                            job={job}
                            onPress={() => navigation.navigate(routes.jobDetails, { jobId: job.id })}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* BOTTOM NAVIGATION BAR */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Image
                        source={require("../../assets/Search.png")}
                        style={styles.navIconImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.navTextActive}>Find Jobs</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Text style={styles.navIcon}>📄</Text>
                    <Text style={styles.navText}>Your Jobs</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    {/* Avatar Profile Icon */}
                    <Image
                        source={require("../../assets/Girl.png")}
                        style={styles.profileNavAvatar}
                        resizeMode="contain"
                    />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Text style={styles.navIcon}>🔔</Text>
                    <Text style={styles.navText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Text style={styles.navIcon}>💬</Text>
                    <Text style={styles.navText}>Messages</Text>
                </TouchableOpacity>
            </View>

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
    /* BOTTOM NAVIGATION BAR */
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderTopColor: "#E5E5E5",
        borderTopWidth: 1,
        paddingVertical: hp('1.5%'),
        paddingBottom: hp('3%'), // Extra padding for iOS home indicator
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    navIcon: {
        fontSize: wp('6%'),
        marginBottom: hp('0.5%'),
        opacity: 0.5,
    },
    navIconActive: {
        fontSize: wp('6%'),
        marginBottom: hp('0.5%'),
        color: "#965541",
    },
    navIconImage: {
        width: wp('6%'),
        height: wp('6%'),
        marginBottom: hp('0.5%'),
        tintColor: "#965541",
    },
    navText: {
        fontSize: wp('2.8%'),
        color: "#A4A9B6",
        fontWeight: "600",
    },
    navTextActive: {
        fontSize: wp('2.8%'),
        color: "#965541",
        fontWeight: "bold",
    },
    profileNavAvatar: {
        width: wp('7%'),
        height: wp('7%'),
        marginBottom: hp('0.5%'),
    }
});
