import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

interface BroadcastJobsEmptyStateProps {
    message?: string;
}

const defaultMessage =
    "Check here for real time jobs which will pop up here when recruiters will broadcast job opening.";

export default function BroadcastJobsEmptyState({
    message = defaultMessage,
}: BroadcastJobsEmptyStateProps) {
    return (
        <View style={styles.broadcastMessageContainer}>
            <View style={styles.broadcastIconCircles}>
                <View style={styles.broadcastCircle1} />
                <View style={styles.broadcastCircle2} />
                <View style={styles.broadcastCircle3} />
                <Text style={styles.globeIcon}>🌐</Text>
            </View>
            <Text style={styles.broadcastMessageText}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    broadcastMessageContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp("6%"),
        marginBottom: hp("3%"),
    },
    broadcastIconCircles: {
        position: "relative",
        width: wp("40%"),
        height: wp("40%"),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp("2%"),
    },
    broadcastCircle1: {
        position: "absolute",
        width: wp("40%"),
        height: wp("40%"),
        borderRadius: wp("20%"),
        backgroundColor: "#D4A5A0",
        opacity: 0.3,
    },
    broadcastCircle2: {
        position: "absolute",
        width: wp("28%"),
        height: wp("28%"),
        borderRadius: wp("14%"),
        backgroundColor: "#C08B81",
        opacity: 0.5,
    },
    broadcastCircle3: {
        position: "absolute",
        width: wp("16%"),
        height: wp("16%"),
        borderRadius: wp("8%"),
        backgroundColor: "#A8714F",
        opacity: 0.7,
    },
    globeIcon: {
        fontSize: wp("10%"),
        position: "absolute",
    },
    broadcastMessageText: {
        fontSize: wp("3.8%"),
        color: "#4A4A4A",
        textAlign: "center",
        lineHeight: hp("2.5%"),
        paddingHorizontal: wp("6%"),
    },
});
