import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import routes from "../navigation/routes";

const SearchIcon = require("../../assets/Search.png");
const GirlIcon = require("../../assets/Girl.png");

interface BottomNavigationProps {
    navigation: any;
    activeTab: "findJobs" | "yourJobs" | "profile" | "notifications" | "messages";
}

export default function BottomNavigation({ navigation, activeTab }: BottomNavigationProps) {
    const renderIcon = (tabId: string): React.ReactNode => {
        switch (tabId) {
            case "findJobs":
                return (
                    <Image
                        source={SearchIcon}
                        style={styles.navIconImage}
                        resizeMode="contain"
                    />
                );
            case "profile":
                return (
                    <Image
                        source={GirlIcon}
                        style={[styles.navIconImage, styles.profileNavAvatar]}
                        resizeMode="contain"
                    />
                );
            case "yourJobs":
                return <Text style={styles.navIcon}>📄</Text>;
            case "notifications":
                return <Text style={styles.navIcon}>🔔</Text>;
            case "messages":
                return <Text style={styles.navIcon}>💬</Text>;
            default:
                return null;
        }
    };

    const handlePress = (tabId: string) => {
        const routeMap: Record<string, any> = {
            findJobs: routes.findJobs,
            yourJobs: routes.yourJobs,
            profile: routes.profile,
            notifications: routes.notifications,
            messages: routes.messages,
        };
        const route = routeMap[tabId];
        if (route) {
            navigation.navigate(route);
        }
    };

    const tabs = [
        { id: "findJobs", label: "Find Jobs" },
        { id: "yourJobs", label: "Your Jobs" },
        { id: "profile", label: "Profile" },
        { id: "notifications", label: "Notifications" },
        { id: "messages", label: "Messages" },
    ];

    return (
        <View style={styles.bottomNav}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={styles.navItem}
                    onPress={() => handlePress(tab.id)}
                >
                    {renderIcon(tab.id)}
                    <Text
                        style={[
                            styles.navText,
                            activeTab === tab.id && styles.navTextActive,
                        ]}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        paddingVertical: hp("1%"),
        backgroundColor: "#FFFFFF",
    },
    navItem: {
        alignItems: "center",
        paddingVertical: hp("1%"),
    },
    navIcon: {
        fontSize: wp("6%"),
        marginBottom: hp("0.3%"),
    },
    navIconImage: {
        width: wp("5%"),
        height: wp("5%"),
        marginBottom: hp("0.3%"),
        tintColor: "#A4A9B6",
    },
    profileNavAvatar: {
        width: wp("6%"),
        height: wp("6%"),
        tintColor: undefined,
        borderRadius: wp("3%"),
    },
    navText: {
        fontSize: wp("2.5%"),
        color: "#A4A9B6",
        fontWeight: "500",
    },
    navTextActive: {
        color: "#FF6B35",
        fontWeight: "600",
    },
});
