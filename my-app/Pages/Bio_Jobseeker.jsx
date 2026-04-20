import React, { useState } from "react";
import { 
    View, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    StatusBar,
    TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";

export default () => {
    const navigation = useNavigation();
    
    // State to manage the user's bio input
    const [bioText, setBioText] = useState("");

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* HEADER ROW */}
            <View style={styles.headerRow}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {/* Placeholder for the profile/back icon */}
                    <View style={styles.backIconPlaceholder}>
                        <Text style={{ fontSize: wp('5%'), fontWeight: 'bold' }}>👤</Text>
                    </View>
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
                        Great! Now write a bio{"\n"}to tell the world about{"\n"}yourself.
                    </Text>
                    <Text style={styles.subHeading}>
                        Help people get to know you at a glance. What work are you best at? Tell them clearly, using paragraphs or bullet points.
                    </Text>
                </View>

                {/* BIO INPUT SECTION */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Your overview</Text>
                    
                    <TextInput
                        style={styles.bioInput}
                        multiline={true}
                        textAlignVertical="top" // Ensures text starts at the top on Android
                        placeholder="Enter your top skills, experiences, and interests. This is one of the first things clients will see on your profile. At least 100 characters"
                        placeholderTextColor="#A4A9B6"
                        value={bioText}
                        onChangeText={setBioText}
                    />
                </View>

                {/* FLEX SPACER - Pushes the button down on taller screens */}
                <View style={{ flex: 1 }} />

                {/* SET BIO BUTTON */}
                <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={() => {
                        if(bioText.length < 100 && bioText.length > 0) {
                            alert("Your bio should be at least 100 characters!");
                        } else {
                            console.log('Bio saved:', bioText);
                            navigation.navigate('ProfileScreen');
                        }
                    }}
                >
                    <Text style={styles.primaryButtonText}>Set this Bio</Text>
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
                        onPress={() => navigation.navigate('ProfileScreen')}
                    >
                        <Text style={styles.arrowText}>{'>'}</Text>
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
    backIconPlaceholder: {
        width: wp('10%'),
        height: wp('10%'),
        borderRadius: wp('5%'),
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: "#1E1E1E",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
    },
    headerSpacer: {
        width: wp('10%'), 
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
        marginBottom: hp('1.5%'),
    },
    bioInput: {
        borderColor: "#D8DADC",
        borderRadius: wp('3%'),
        borderWidth: 1,
        padding: wp('4%'),
        minHeight: hp('20%'), // Gives the box a nice, tall default height
        color: "#000000",
        fontSize: wp('4%'),
        backgroundColor: "#FFFFFF",
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
        width: '100%', // Assumed final step of profile creation based on context
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
    arrowText: {
        color: "#FFFFFF",
        fontSize: wp('5%'),
        fontWeight: "bold",
    },
});