import React, { useState } from "react";
import { 
    View, 
    ScrollView, 
    Text, 
    Image, 
    StyleSheet, 
    TouchableOpacity,
    StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";

export default (props) => {
    const navigation = useNavigation();
    
    // Added state to track which card is selected
    const [selectedRole, setSelectedRole] = useState(null); 

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* TOP HEADER */}
            <View style={styles.headerRow}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Image
                        source={require ("../assets/Profile-logo.png")} 
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
                {/* QUESTION SECTION */}
                <View style={styles.textSection}>
                    <Text style={styles.mainQuestion}>
                        A few quick questions: Who are you?
                    </Text>
                    <Text style={styles.subText}>
                        This will let us know what you expect from our platform and match you with your desired fellow users.
                    </Text>
                </View>

                {/* SELECTION CARDS */}
                <View style={styles.cardsSection}>
                    
                    {/* Card 1: Looking for jobs */}
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        style={[
                            styles.card, 
                            selectedRole === 'jobSeeker' && styles.cardSelected // Applies highlight if selected
                        ]}
                        onPress={() => {
                            setSelectedRole('jobSeeker');
                            navigation.navigate("Upload_Cred");
                        }}
                    >
                        <Image
                            source={require("../assets/Search.png")}
                            resizeMode={"contain"}
                            style={styles.cardIcon}
                        />
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle}>I am looking for jobs</Text>
                            <Text style={styles.cardDesc}>Plumbers, labourers, etc....</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Card 2: Want to hire */}
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        style={[
                            styles.card, 
                            selectedRole === 'employer' && styles.cardSelected
                        ]}
                        onPress={() => setSelectedRole('employer')}
                    >
                        <Image
                            source={require("../assets/Edit.png")} 
                            resizeMode={"contain"}
                            style={styles.cardIcon}
                        />
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle}>I want to hire</Text>
                            <Text style={styles.cardDesc}>Plumbers, labourers, etc....</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
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
        width: wp('8%'), // Matches backIcon width to ensure perfect centering of title
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp('8%'),
        paddingTop: hp('2%'),
        paddingBottom: hp('5%'),
    },
    textSection: {
        marginBottom: hp('5%'),
    },
    mainQuestion: {
        color: "#965541",
        fontSize: wp('8%'),
        fontWeight: "bold",
        lineHeight: wp('10%'),
        marginBottom: hp('1.5%'),
    },
    subText: {
        color: "#1E1E1E",
        fontSize: wp('4%'),
        lineHeight: wp('6%'),
        opacity: 0.8,
    },
    cardsSection: {
        flex: 1,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderColor: "#A4A9B6",
        borderRadius: wp('5%'),
        borderWidth: 2,
        paddingVertical: hp('3%'),
        paddingHorizontal: wp('5%'),
        marginBottom: hp('2.5%'),
    },
    cardSelected: {
        borderColor: "#965541",
        backgroundColor: "#FFF5F0", // Very light tint to show selection
    },
    cardIcon: {
        width: wp('12%'),
        height: wp('12%'),
        marginRight: wp('4%'),
    },
    cardTextContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        color: "#965541",
        fontSize: wp('5%'),
        fontWeight: "bold",
        marginBottom: hp('0.5%'),
    },
    cardDesc: {
        color: "#1E1E1E",
        fontSize: wp('3.5%'),
    },
    progressContainer: {
        backgroundColor: "#F2E1DA",
        width: '100%',
        height: hp('0.6%'),
    },
    progressTrack: {
        backgroundColor: "#E6E6E6", // Light grey background
        width: '100%',
        height: '100%',
    },
    progressFill: {
        backgroundColor: "#965541", // Brown fill
        width: '33%', // Since it's 1/n, assuming around 3 steps
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
        paddingBottom: hp('4%'), // Extra padding for bottom swiper on iOS
    },
    stepText: {
        color: "#965541",
        fontSize: wp('7%'),
        fontWeight: "bold",
    },
    nextIcon: {
        width: wp('22%'),
        height: hp('5%'),
    },
});
