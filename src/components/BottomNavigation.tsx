import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import routes from "../navigation/routes";

const SearchIcon = require("../../assets/Search.png");
const YourJobsIcon = require("../../assets/yourjobs.png");
const ProfileIcon = require("../../assets/Profile-logo.png");
const MessageIcon = require("../../assets/message.png");

type BottomTabId = "findJobs" | "yourJobs" | "profile" | "messages";

interface BottomNavigationProps {
  activeTab: BottomTabId;
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const navigation = useNavigation<any>();
  const renderIcon = (
    tabId: BottomTabId,
    isActive: boolean,
  ): React.ReactNode => {
    const iconTint = isActive ? styles.navIconActive : styles.navIconInactive;
    switch (tabId) {
      case "findJobs":
        return (
          <Image
            source={SearchIcon}
            style={[styles.navIconImage, iconTint]}
            resizeMode="contain"
          />
        );
      case "yourJobs":
        return (
          <Image
            source={YourJobsIcon}
            style={[styles.navIconImage, iconTint]}
            resizeMode="contain"
          />
        );
      case "profile":
        return (
          <Image
            source={ProfileIcon}
            style={[styles.navIconImage, iconTint]}
            resizeMode="contain"
          />
        );
      case "messages":
        return (
          <Image
            source={MessageIcon}
            style={[styles.navIconImage, iconTint]}
            resizeMode="contain"
          />
        );
      default:
        return null;
    }
  };

  const handlePress = (tabId: BottomTabId) => {
    const routeMap: Record<BottomTabId, any> = {
      findJobs: routes.findJobs,
      yourJobs: routes.yourJobs,
      profile: routes.profile,
      messages: routes.messages,
    };
    const route = routeMap[tabId];
    if (route) {
      navigation.navigate(route);
    }
  };

  const tabs: { id: BottomTabId; label: string }[] = [
    { id: "findJobs", label: "Find Jobs" },
    { id: "yourJobs", label: "Your Jobs" },
    { id: "profile", label: "Profile" },
    { id: "messages", label: "Messages" },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => handlePress(tab.id)}
          >
            {renderIcon(tab.id, isActive)}
            <Text
              style={[
                styles.navText,
                isActive ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    backgroundColor: "#F9F9F9",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIconImage: {
    width: wp("6%"),
    height: wp("6%"),
    marginBottom: hp("0.5%"),
  },
  navIconActive: {
    tintColor: "#965541",
  },
  navIconInactive: {
    tintColor: "#A4A9B6",
  },
  navText: {
    fontSize: wp("2.5%"),
    fontWeight: "700",
    textAlign: "center",
  },
  navTextActive: {
    color: "#965541",
  },
  navTextInactive: {
    color: "#A4A9B6",
  },
});
