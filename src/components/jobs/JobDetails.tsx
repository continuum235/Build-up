import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface JobDetailsCardData {
  id: string | number;
  title: string;
  company: string;
  verified: boolean;
  posted?: string;
  location: string;
  budget: string;
  experience?: string;
  tags: string[];
  isLiked?: boolean;
}

interface JobDetailMetric {
  label: string;
  value: string;
}

interface JobDetailsProps {
  job: JobDetailsCardData;
  onPress?: () => void;
  onLikePress?: () => void;
  isLiked?: boolean;
  details?: JobDetailMetric[];
  verifiedLabel?: string;
  postedPrefix?: string;
  leadingContent?: React.ReactNode;
  children?: React.ReactNode;
}

export default function JobDetails({
  job,
  onPress,
  onLikePress,
  isLiked,
  details,
  verifiedLabel = "User Verified",
  postedPrefix = "Posted",
  leadingContent,
  children,
}: JobDetailsProps) {
  const handleLikePress = () => {
    onLikePress?.();
  };
  const liked = isLiked ?? job.isLiked;
  const metrics =
    details ??
    [
      { label: "Budget", value: job.budget },
      { label: "Experience", value: job.experience ?? "" },
    ].filter((detail) => detail.value);

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {leadingContent}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        {onLikePress && (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleLikePress}
            activeOpacity={0.7}
          >
            <Text style={[styles.heartIcon, liked && styles.heartIconLiked]}>
              {liked ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.companyRow}>
        <Text style={styles.companyText}>{job.company} </Text>
        {job.verified && (
          <Text style={styles.verifiedText}>✓ {verifiedLabel}</Text>
        )}
        {job.posted && (
          <Text style={styles.postedText}>
            {" "}
            • {postedPrefix} {job.posted}
          </Text>
        )}
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{job.location}</Text>
      </View>

      <View style={styles.detailsRow}>
        {metrics.map((detail) => (
          <View key={detail.label} style={styles.detailBlock}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </View>
        ))}
      </View>

      {job.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {job.tags.map((tag, index) => (
            <View key={`${job.id}-${tag}-${index}`} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  jobCard: {
    borderColor: "#D8DADC",
    borderWidth: 1.5,
    borderRadius: wp("5%"),
    padding: wp("5%"),
    marginBottom: hp("2.5%"),
    backgroundColor: "#FFFFFF",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp("1%"),
  },
  jobTitle: {
    color: "#965541",
    fontSize: wp("5%"),
    fontWeight: "bold",
    width: "85%",
  },
  heartButton: {
    padding: wp("1%"),
    borderColor: "#965541",
    borderWidth: 1,
    borderRadius: wp("4%"),
    width: wp("8%"),
    height: wp("8%"),
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    color: "#965541",
    fontSize: wp("4%"),
  },
  heartIconLiked: {
    color: "#E74C3C",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.5%"),
    flexWrap: "wrap",
  },
  companyText: {
    color: "#1E1E1E",
    fontWeight: "600",
    fontSize: wp("3.5%"),
  },
  verifiedText: {
    color: "#007AFF",
    fontSize: wp("3.2%"),
    fontWeight: "600",
  },
  postedText: {
    color: "#888888",
    fontSize: wp("3.2%"),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  locationIcon: {
    fontSize: wp("4%"),
    marginRight: wp("1.5%"),
  },
  locationText: {
    color: "#666666",
    fontSize: wp("3.8%"),
    textDecorationLine: "underline",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
    paddingRight: wp("10%"),
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
    color: "#4A4A4A",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagPill: {
    borderColor: "#965541",
    borderWidth: 1,
    borderRadius: wp("4%"),
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("4%"),
    marginRight: wp("3%"),
  },
  tagText: {
    color: "#965541",
    fontSize: wp("3%"),
  },
});
