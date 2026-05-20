import React, { useState } from "react";
import { 
    View, 
    ScrollView, 
    Text, 
    Image,
    TouchableOpacity, 
    StyleSheet, 
    StatusBar 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";

const professionRoles = [
    "Builder",
    "Contractor",
    "Architect",
    "Civil Engineer",
    "Structural Engineer",
    "Project Manager",
    "Surveyor",
    "Interior Designer",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Welder",
    "Mason",
    "Tile Installer",
    "HVAC Technician",
    "Site Supervisor",
    "Safety Officer",
    "Quantity Surveyor",
    "Construction Laborer",
    "Landscape Designer",
    "Roofer",
];

export default () => {
    const navigation = useNavigation();
    
    // State to hold the selected role
    const [selectedRole, setSelectedRole] = useState("Builder");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* HEADER ROW */}
            <View style={styles.headerRow}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Image
                        source={require("../../assets/Back-button.png")}
                        resizeMode="contain"
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Your Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* TEXT SECTION */}
                <View style={styles.textSection}>
                    <Text style={styles.mainHeading}>
                        Choose a title{"\n"}to tell the world what{"\n"}you do.
                    </Text>
                    <Text style={styles.subHeading}>
                        It’s the very first thing that someone sees while connecting. Make sure to describe your expertise in a particular role.
                    </Text>
                </View>

                {/* DROPDOWN INPUT SECTION */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Your professional role</Text>
                    
                    {/* Simulated Dropdown Button */}
                    <TouchableOpacity 
                        style={styles.dropdownBox}
                        onPress={() => setIsDropdownOpen((isOpen) => !isOpen)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.dropdownText}>{selectedRole}</Text>
                        <Image
                            source={require("../../assets/Drop-down-arrow.png")}
                            resizeMode="contain"
                            style={[
                                styles.dropdownIcon,
                                isDropdownOpen && styles.dropdownIconOpen,
                            ]}
                        />
                    </TouchableOpacity>
                    {isDropdownOpen && (
                        <View style={styles.dropdownMenu}>
                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                {professionRoles.map((role) => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[
                                            styles.dropdownOption,
                                            selectedRole === role && styles.dropdownOptionSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedRole(role);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownOptionText,
                                                selectedRole === role && styles.dropdownOptionTextSelected,
                                            ]}
                                        >
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
                
                {/* FLEX SPACER - Pushes the button to the bottom of the scroll view */}
                <View style={{ flex: 1 }} />

                {/* ADD EXPERTISE BUTTON */}
                <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={() => {
                        console.log("Role selected:", selectedRole);
                        // navigation.navigate('NextScreen');
                    }}
                >
                    <Text style={styles.primaryButtonText}>Add Expertise</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
                </View>
            </View>

            {/* BOTTOM NAVIGATION FOOTER */}
            <View style={styles.bottomNav}>
                <Text style={styles.stepText}>1/n</Text>
                
                {/* Arrow Navigation (Left & Right) */}
                <View style={styles.navArrowsContainer}>
                    <TouchableOpacity 
                        style={styles.arrowButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.arrowText}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.arrowButton} 
                        onPress={() => console.log('Next Step')}
                    >
                        <Text style={styles.arrowText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('2%'),
    },
    backIcon: {
        width: wp('8%'),
        height: wp('8%'),
    },
    headerTitle: {
        color: "#1E1E1E",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
    },
    headerSpacer: {
        width: wp('8%'), // Ensures title is perfectly centered
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1, 
        paddingHorizontal: wp('8%'),
        paddingTop: hp('2%'),
        paddingBottom: hp('3%'),
    },
    textSection: {
        marginBottom: hp('4%'),
    },
    mainHeading: {
        color: "#965541",
        fontSize: wp('8%'),
        lineHeight: wp('10.5%'),
        marginBottom: hp('2%'),
    },
    subHeading: {
        color: "#1E1E1E",
        fontSize: wp('4%'),
        lineHeight: wp('6%'),
        opacity: 0.9,
    },
    inputSection: {
        marginBottom: hp('4%'),
    },
    inputLabel: {
        color: "#1E1E1E",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
        marginBottom: hp('1.5%'),
    },
    dropdownBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "#D8DADC",
        borderRadius: wp('3%'),
        borderWidth: 1,
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%'),
        backgroundColor: "#FFFFFF",
    },
    dropdownText: {
        color: "#1E1E1E",
        fontSize: wp('4.2%'),
    },
    dropdownIcon: {
        width: wp('4.5%'),
        height: wp('4.5%'),
    },
    dropdownIconOpen: {
        transform: [{ rotate: "180deg" }],
    },
    dropdownMenu: {
        maxHeight: hp('28%'),
        borderColor: "#D8DADC",
        borderRadius: wp('3%'),
        borderWidth: 1,
        marginTop: hp('1%'),
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
    },
    dropdownOption: {
        paddingVertical: hp('1.6%'),
        paddingHorizontal: wp('4%'),
        borderBottomColor: "#EEF0F2",
        borderBottomWidth: 1,
    },
    dropdownOptionSelected: {
        backgroundColor: "#F2E1DA",
    },
    dropdownOptionText: {
        color: "#1E1E1E",
        fontSize: wp('4%'),
    },
    dropdownOptionTextSelected: {
        color: "#965541",
        fontWeight: "bold",
    },
    primaryButton: {
        alignItems: "center",
        backgroundColor: "#965541",
        borderRadius: wp('4%'),
        paddingVertical: hp('2.2%'),
        width: '100%',
        marginBottom: hp('2%'),
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
    },
    progressContainer: {
        backgroundColor: "#E6E6E6",
        width: '100%',
        height: hp('0.5%'),
    },
    progressTrack: {
        width: '100%',
        height: '100%',
    },
    progressFill: {
        backgroundColor: "#965541",
        width: '30%', // Adjusted based on step
        height: '100%',
        borderRadius: wp('1%'),
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F2E1DA",
        paddingHorizontal: wp('8%'),
        paddingTop: hp('2.5%'),
        paddingBottom: hp('4%'), // Extra padding for safe area/home indicator
    },
    stepText: {
        color: "#965541",
        fontSize: wp('7%'),
        fontWeight: "bold",
    },
    navArrowsContainer: {
        flexDirection: 'row',
    },
    arrowButton: {
        backgroundColor: "#965541",
        width: wp('12%'),
        height: wp('10%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp('2%'),
        marginLeft: wp('2%'),
    },
    arrowText: {
        color: "#FFFFFF",
        fontSize: wp('5%'),
        fontWeight: "bold",
    },
}); 
