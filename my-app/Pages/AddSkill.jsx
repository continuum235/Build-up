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

export default () => {
    const navigation = useNavigation();
    
    // State to manage selected and available skills
    const [selectedSkills, setSelectedSkills] = useState(['Skill 1', 'Skill 2', 'Skill 3']);
    
    // Mock data for suggested skills
    const suggestedSkills = ['Skill 1', 'Skill fssds 1', 'Skillsdsa 1', 'Skill something 1'];

    // Function to add a skill
    const addSkill = (skill) => {
        if (selectedSkills.length < 3 && !selectedSkills.includes(skill)) {
            setSelectedSkills([...selectedSkills, skill]);
        } else if (selectedSkills.length >= 3) {
            alert("You can only select up to 3 skills.");
        }
    };

    // Function to remove a skill
    const removeSkill = (skillToRemove) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* HEADER ROW */}
            <View style={styles.headerRow}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Image
                        source={require("../assets/Back-button.png")}
                        resizeMode={"contain"}
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
                        Nearly there! What{"\n"}work are you here{"\n"}to do?
                    </Text>
                    <Text style={styles.subHeading}>
                        Your skills show clients what you can offer, and help us choose which jobs to recommend to you. Choose the tags below.
                    </Text>
                </View>

                {/* SKILLS SECTION */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Your skills</Text>
                    <Text style={styles.inputNote}>*Choose max upto three skills</Text>

                    {/* Selected Skills Box */}
                    <View style={styles.selectedBox}>
                        {selectedSkills.length === 0 && (
                            <Text style={styles.placeholderText}>Select skills from below...</Text>
                        )}
                        {selectedSkills.map((skill, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.selectedChip}
                                onPress={() => removeSkill(skill)}
                            >
                                <Text style={styles.selectedChipText}>{skill}</Text>
                                <Image
                                    source={require("../assets/Drop-down-arrow.png")}
                                    style={styles.chipIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Suggested Skills (Tags) */}
                    <View style={styles.suggestedContainer}>
                        {suggestedSkills.map((skill, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.suggestedChip}
                                onPress={() => addSkill(skill)}
                            >
                                <Text style={styles.suggestedChipText}>{skill}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* PUSH BUTTON TO BOTTOM IF NEEDED */}
                <View style={{ flex: 1 }} />

                {/* ADD SKILLS BUTTON */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => {
                        console.log('Skills saved:', selectedSkills);
                        navigation.navigate('Bio_Jobseeker');
                    }}
                >
                    <Text style={styles.addButtonText}>Add Skills</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
                </View>
            </View>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <Text style={styles.stepText}>4/4</Text>
                
                {/* Arrow Navigation (Left & Right) */}
                <View style={styles.navArrowsContainer}>
                    <TouchableOpacity 
                        style={styles.arrowButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Image
                            source={require("../assets/Back-button.png")}
                            style={styles.navIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.arrowButton} 
                        onPress={() => navigation.navigate('Bio_Jobseeker')}
                    >
                        <Image
                            source={require("../assets/Next-page-logo.png")}
                            style={styles.navIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
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
        width: wp('8%'), 
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
        marginBottom: hp('3%'),
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
        marginBottom: hp('3%'),
    },
    inputLabel: {
        color: "#1E1E1E",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
        marginBottom: hp('0.5%'),
    },
    inputNote: {
        color: "#666",
        fontSize: wp('3.2%'),
        marginBottom: hp('1.5%'),
    },
    selectedBox: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        borderColor: "#D8DADC",
        borderRadius: wp('3%'),
        borderWidth: 1,
        padding: wp('3%'),
        minHeight: hp('8%'),
        marginBottom: hp('2.5%'),
    },
    placeholderText: {
        color: "#A4A9B6",
        fontSize: wp('3.8%'),
        padding: wp('2%'),
    },
    selectedChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#965541",
        borderRadius: wp('6%'),
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('4%'),
        marginRight: wp('2%'),
        marginBottom: hp('1%'),
    },
    selectedChipText: {
        color: "#FFFFFF",
        fontSize: wp('3.8%'),
        fontWeight: "600",
        marginRight: wp('2%'),
    },
    chipIcon: {
        width: wp('3.5%'),
        height: wp('3.5%'),
        tintColor: "#FFFFFF",
        transform: [{ rotate: "-90deg" }],
    },
    suggestedContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    suggestedChip: {
        borderColor: "#965541",
        borderWidth: 1.5,
        backgroundColor: "#FFFFFF",
        borderRadius: wp('6%'),
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('4%'),
        marginRight: wp('2.5%'),
        marginBottom: hp('1.5%'),
    },
    suggestedChipText: {
        color: "#965541",
        fontSize: wp('3.8%'),
        fontWeight: "600",
    },
    addButton: {
        alignItems: "center",
        backgroundColor: "#965541",
        borderRadius: wp('4%'),
        paddingVertical: hp('2.2%'),
        width: '100%',
        marginBottom: hp('2%'),
    },
    addButtonText: {
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
        width: '95%', // Almost complete
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
        paddingBottom: hp('4%'),
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
    navIcon: {
        width: wp('6%'),
        height: wp('6%'),
        tintColor: "#FFFFFF",
    },
});