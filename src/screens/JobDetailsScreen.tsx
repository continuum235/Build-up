import React, { useState } from "react";
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import jobsData from "../data/jobsSeedData.json";

interface JobDetailsScreenProps {
    navigation: any;
    route: any;
}

export default ({ navigation, route }: JobDetailsScreenProps) => {
    const { jobId } = route.params;
    const job = jobsData.jobs.find((j) => j.id === jobId);
    const [isLiked, setIsLiked] = useState(job?.liked || false);

    if (!job) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Job not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* HEADER WITH BACK BUTTON */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <View style={{ width: wp('10%') }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* JOB TITLE */}
                <Text style={styles.jobTitle}>{job.title}</Text>

                {/* COMPANY & VERIFICATION INFO */}
                <View style={styles.companyInfoRow}>
                    <Text style={styles.companyName}>{job.company}</Text>
                    {job.verified && (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓</Text>
                            <Text style={styles.verifiedLabel}>User Verified</Text>
                        </View>
                    )}
                    <Text style={styles.postedTime}>• Posted {job.postedTime}</Text>
                </View>

                {/* DESCRIPTION */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        {job.description}
                    </Text>
                </View>

                {/* LOCATION */}
                <View style={styles.locationContainer}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>{job.location}</Text>
                </View>

                {/* TAGS */}
                <View style={styles.tagsContainer}>
                    {job.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                {/* WORK DETAILS SECTION */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Work Details:</Text>
                    
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Budget:</Text>
                            <Text style={styles.detailValue}>₹{job.budget}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Experience:</Text>
                            <Text style={styles.detailValue}>{job.experience}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Applicants:</Text>
                            <Text style={styles.detailValue}>{job.applicants}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Languages:</Text>
                            <Text style={styles.detailValue}>{job.languages}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* CLIENTS DETAILS SECTION */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Clients Details:</Text>
                    
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Profile:</Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓</Text>
                                <Text style={styles.verifiedLabel}>User Verified</Text>
                            </View>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Workorder:</Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓</Text>
                                <Text style={styles.verifiedLabel}>Verified</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Ratings:</Text>
                        <Text style={styles.ratingsText}>{job.ratings}/5</Text>
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* BOTTOM ACTION BAR */}
            <View style={styles.actionBar}>
                <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => {
                        alert("Job rejected");
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => alert("Job accepted! You have applied for this job.")}
                >
                    <Text style={styles.acceptButtonText}>Accept</Text>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    backButton: {
        fontSize: wp('8%'),
        color: "#1E1E1E",
        fontWeight: "bold",
    },
    headerTitle: {
        fontSize: wp('5%'),
        fontWeight: "bold",
        color: "#1E1E1E",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('2%'),
        paddingBottom: hp('10%'),
    },
    jobTitle: {
        fontSize: wp('6%'),
        fontWeight: "bold",
        color: "#1E1E1E",
        marginBottom: hp('1.5%'),
    },
    companyInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp('2%'),
        flexWrap: "wrap",
    },
    companyName: {
        fontSize: wp('3.5%'),
        fontWeight: "600",
        color: "#1E1E1E",
        marginRight: wp('2%'),
    },
    verifiedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        paddingHorizontal: wp('2%'),
        paddingVertical: hp('0.5%'),
        borderRadius: wp('2%'),
        marginRight: wp('2%'),
    },
    verifiedText: {
        color: "#4CAF50",
        fontWeight: "bold",
        marginRight: wp('1%'),
        fontSize: wp('3%'),
    },
    verifiedLabel: {
        color: "#4CAF50",
        fontSize: wp('3%'),
        fontWeight: "500",
    },
    postedTime: {
        fontSize: wp('3.5%'),
        color: "#888888",
        marginBottom: hp('0.5%'),
    },
    descriptionContainer: {
        backgroundColor: "#F9F9F9",
        padding: wp('4%'),
        borderRadius: wp('3%'),
        marginBottom: hp('2%'),
    },
    descriptionText: {
        fontSize: wp('3.5%'),
        color: "#555555",
        lineHeight: wp('5.5%'),
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp('2%'),
        paddingBottom: hp('1.5%'),
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    locationIcon: {
        fontSize: wp('5%'),
        marginRight: wp('2%'),
    },
    locationText: {
        fontSize: wp('4%'),
        color: "#1E1E1E",
        fontWeight: "500",
    },
    tagsContainer: {
        flexDirection: "row",
        marginBottom: hp('2%'),
        flexWrap: "wrap",
    },
    tag: {
        borderWidth: 1,
        borderColor: "#965541",
        borderRadius: wp('3%'),
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.8%'),
        marginRight: wp('2%'),
        marginBottom: hp('1%'),
    },
    tagText: {
        fontSize: wp('3.5%'),
        color: "#965541",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E5E5",
        marginVertical: hp('2.5%'),
    },
    sectionContainer: {
        marginBottom: hp('2%'),
    },
    sectionTitle: {
        fontSize: wp('4.5%'),
        fontWeight: "bold",
        color: "#1E1E1E",
        marginBottom: hp('1.5%'),
    },
    detailsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: hp('2%'),
    },
    detailItem: {
        flex: 1,
        marginRight: wp('2%'),
    },
    detailLabel: {
        fontSize: wp('3.5%'),
        color: "#888888",
        marginBottom: hp('0.5%'),
        fontWeight: "500",
    },
    detailValue: {
        fontSize: wp('4%'),
        color: "#1E1E1E",
        fontWeight: "600",
    },
    ratingsText: {
        fontSize: wp('4%'),
        color: "#FFB800",
        fontWeight: "600",
    },
    bottomSpacing: {
        height: hp('3%'),
    },
    actionBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('2%'),
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        backgroundColor: "#FFFFFF",
        gap: wp('4%'),
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingVertical: hp('2%'),
        borderRadius: wp('3%'),
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#965541",
    },
    rejectButtonText: {
        color: "#965541",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
    },
    acceptButton: {
        flex: 1,
        backgroundColor: "#965541",
        paddingVertical: hp('2%'),
        borderRadius: wp('3%'),
        alignItems: "center",
    },
    acceptButtonText: {
        color: "#FFFFFF",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
    },
});
