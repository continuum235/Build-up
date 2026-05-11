import React, { useState } from "react";
import { 
    View, 
    ScrollView, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import routes from "../navigation/routes";
import jobsData from "../data/jobsSeedData.json";
import BottomNavigation from "../components/BottomNavigation";

interface YourJobsScreenProps {
    navigation: any;
}

interface JobWithStatus extends ReturnType<typeof mapJobData> {
    status: "Accepted" | "Standby" | "Rejected";
    appliedDate: string;
}

const mapJobData = (job: any) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    verified: job.verified,
    posted: job.postedTime,
    location: job.location,
    budget: `$${job.budget}`,
    experience: job.experience,
    tags: job.tags,
});

export default ({ navigation }: YourJobsScreenProps) => {
    // Interactive states for UI tabs
    const [activeTab, setActiveTab] = useState("Sent Proposals");

    // Create applied jobs data with status from seed data
    const appliedJobs: JobWithStatus[] = jobsData.jobs.slice(0, 3).map((job, index) => ({
        ...mapJobData(job),
        status: ["Accepted", "Standby", "Rejected"][index] as "Accepted" | "Standby" | "Rejected",
        appliedDate: job.postedTime,
    }));

    const activeJobs = appliedJobs.filter(job => job.status === "Accepted" || job.status === "Standby");
    const completedJobs = appliedJobs.filter(job => job.status === "Rejected");
    const sentProposals = appliedJobs;

    // Get jobs based on active tab
    const getJobsForTab = () => {
        switch(activeTab) {
            case "Active Jobs":
                return activeJobs;
            case "Completed Jobs":
                return completedJobs;
            default:
                return sentProposals;
        }
    };

    const displayedJobs = getJobsForTab();

    const getStatusColor = (status: string) => {
        switch(status) {
            case "Accepted":
                return "#4CAF50"; // Green
            case "Standby":
                return "#FF9800"; // Orange
            case "Rejected":
                return "#F44336"; // Red
            default:
                return "#666666";
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case "Accepted":
                return "●"; // Circle for accepted
            case "Standby":
                return "●"; // Circle for standby
            case "Rejected":
                return "●"; // Circle for rejected
            default:
                return "";
        }
    };

    const renderJobCard = (job: JobWithStatus) => (
        <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => navigation.navigate(routes.jobDetails, { jobId: job.id })}
            activeOpacity={0.7}
        >
            {/* Status Badge */}
            <View style={[styles.statusBadge, { borderLeftColor: getStatusColor(job.status) }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
                <Text style={styles.statusText}>{job.status}</Text>
            </View>

            {/* Job Title */}
            <Text style={styles.jobTitle}>{job.title}</Text>

            {/* Company Info */}
            <View style={styles.companyRow}>
                <Text style={styles.companyText}>{job.company} </Text>
                {job.verified && <Text style={styles.verifiedText}>✓ User Verified</Text>}
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{job.location}</Text>
            </View>

            {/* Budget and Experience */}
            <View style={styles.detailsRow}>
                <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Budget</Text>
                    <Text style={styles.detailValue}>{job.budget}</Text>
                </View>
                <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Experience</Text>
                    <Text style={styles.detailValue}>{job.experience}</Text>
                </View>
            </View>

            {/* Chat Button (for accepted jobs) */}
            {(job.status === "Accepted" || job.status === "Standby") && (
                <TouchableOpacity style={styles.chatButton}>
                    <Text style={styles.chatButtonIcon}>💬</Text>
                    <Text style={styles.chatButtonText}>Chat with {job.company}</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

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
                <Text style={styles.pageTitle}>Your Jobs</Text>

                {/* INFO BANNER */}
                {activeTab === "Sent Proposals" && (
                    <View style={styles.infoBanner}>
                        <Text style={styles.infoBannerText}>
                            All the sent proposals will be rejected as soon as one of them gets accepted.
                        </Text>
                    </View>
                )}

                {/* TEXT TABS */}
                <View style={styles.tabContainer}>
                    {["Sent Proposals", "Active Jobs", "Completed Jobs"].map((tab) => (
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

                {/* JOB CARDS LIST */}
                <View style={styles.cardsContainer}>
                    {displayedJobs.length === 0 && (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>
                                No {activeTab.toLowerCase()} yet
                            </Text>
                        </View>
                    )}
                    {displayedJobs.map((job) => renderJobCard(job))}
                </View>
            </ScrollView>

            {/* BOTTOM NAVIGATION BAR */}
            <BottomNavigation navigation={navigation} activeTab="yourJobs" />
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
        paddingBottom: hp("10%"),
    },
    pageTitle: {
        fontSize: wp("6%"),
        fontWeight: "700",
        color: "#000000",
        marginHorizontal: wp("5%"),
        marginTop: hp("1.5%"),
        marginBottom: hp("1%"),
    },
    infoBanner: {
        backgroundColor: "#FFF3E0",
        borderRadius: wp("3%"),
        padding: wp("4%"),
        marginHorizontal: wp("5%"),
        marginBottom: hp("2%"),
    },
    infoBannerText: {
        fontSize: wp("3.5%"),
        color: "#FF9800",
        lineHeight: wp("5%"),
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: wp("5%"),
        marginBottom: hp("2%"),
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    tabText: {
        fontSize: wp("3.5%"),
        color: "#A4A9B6",
        fontWeight: "500",
        paddingRight: wp("4%"),
        paddingBottom: hp("1.5%"),
    },
    tabTextActive: {
        color: "#000000",
        fontWeight: "600",
    },
    activeTabUnderline: {
        height: 2,
        backgroundColor: "#FF6B35",
        borderRadius: 1,
        position: "absolute",
        bottom: -1,
        left: 0,
        right: wp("4%"),
    },
    cardsContainer: {
        paddingHorizontal: wp("5%"),
    },
    jobCard: {
        borderColor: "#D8DADC",
        borderWidth: 1.5,
        borderRadius: wp("4%"),
        padding: wp("4%"),
        marginBottom: hp("2%"),
        backgroundColor: "#FFFFFF",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: wp("2%"),
        paddingVertical: hp("0.5%"),
        marginBottom: hp("1%"),
        borderLeftWidth: 3,
    },
    statusDot: {
        width: wp("2%"),
        height: wp("2%"),
        borderRadius: wp("1%"),
        marginRight: wp("2%"),
    },
    statusText: {
        fontSize: wp("3%"),
        fontWeight: "600",
        color: "#333333",
    },
    jobTitle: {
        fontSize: wp("4%"),
        fontWeight: "700",
        color: "#000000",
        marginBottom: hp("0.5%"),
        lineHeight: wp("5%"),
    },
    companyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp("1%"),
    },
    companyText: {
        fontSize: wp("3%"),
        color: "#333333",
        fontWeight: "500",
    },
    verifiedText: {
        fontSize: wp("2.8%"),
        color: "#4CAF50",
        fontWeight: "600",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: hp("1%"),
    },
    locationIcon: {
        marginRight: wp("1.5%"),
        fontSize: wp("4%"),
    },
    locationText: {
        fontSize: wp("3%"),
        color: "#333333",
        flex: 1,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: hp("1.5%"),
    },
    detailBlock: {
        flex: 1,
    },
    detailLabel: {
        fontSize: wp("2.8%"),
        color: "#A4A9B6",
        marginBottom: hp("0.3%"),
    },
    detailValue: {
        fontSize: wp("3.5%"),
        fontWeight: "600",
        color: "#000000",
    },
    chatButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: wp("3%"),
        paddingVertical: hp("1.2%"),
        marginTop: hp("1%"),
    },
    chatButtonIcon: {
        marginRight: wp("2%"),
        fontSize: wp("4%"),
    },
    chatButtonText: {
        fontSize: wp("3%"),
        color: "#333333",
        fontWeight: "500",
    },
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp("10%"),
    },
    emptyStateText: {
        fontSize: wp("4%"),
        color: "#A4A9B6",
        fontWeight: "500",
    },

});
