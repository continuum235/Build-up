import React from "react";
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

export default (props) => {
    const navigation = useNavigation();

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
                        source={require("../assets/Profile-logo.png")}
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
                {/* TEXT INSTRUCTIONS */}
                <View style={styles.textSection}>
                    <Text style={styles.mainHeading}>
                        Please upload the{"\n"}following documents{"\n"}to verify your profile
                    </Text>
                    <Text style={styles.subHeading}>
                        This will help us to cross verify your mentioned details with your Government IDs.
                    </Text>
                </View>

                {/* UPLOAD ROWS */}
                <View style={styles.uploadSection}>
                    
                    {/* Aadhaar Card */}
                    <View style={styles.uploadRow}>
                        <Text style={styles.documentName}>Adhaar Card*</Text>
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => alert('Upload Aadhaar!')}>
                            <Image
                                source={require("../assets/Upload.png")} 
                                resizeMode={"contain"}
                                style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Other Document 1 */}
                    <View style={styles.uploadRow}>
                        <Text style={styles.documentName}>Other Document</Text>
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => alert('Upload Document 1!')}>
                            <Image
                                source={require("../assets/Upload.png")}
                                resizeMode={"contain"}
                                style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Other Document 2 */}
                    <View style={styles.uploadRow}>
                        <Text style={styles.documentName}>Other Document</Text>
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => alert('Upload Document 2!')}>
                            <Image
                                source={require("../assets/Upload.png")}
                                resizeMode={"contain"}
                                style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadBtnText}>Upload</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* NEXT BUTTON */}
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => navigation.navigate("Choose_Job")}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>

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
        width: wp('8%'), // Mirrors back icon to keep title dead center
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
    mainHeading: {
        color: "#965541",
        fontSize: wp('7.5%'),
        fontWeight: "bold",
        marginBottom: hp('2%'),
        lineHeight: wp('10%'),
    },
    subHeading: {
        color: "#1E1E1E",
        fontSize: wp('3.8%'),
        lineHeight: wp('5.5%'),
        opacity: 0.8,
    },
    uploadSection: {
        marginBottom: hp('6%'),
    },
    uploadRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp('3%'),
    },
    documentName: {
        color: "#1E1E1E",
        fontSize: wp('4.5%'),
        fontWeight: "bold",
        flex: 1, 
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#965541",
        borderRadius: wp('4%'),
        borderWidth: 2,
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('6%'),
    },
    uploadIcon: {
        width: wp('5%'),
        height: wp('5%'),
        marginRight: wp('2%'),
    },
    uploadBtnText: {
        color: "#965541",
        fontSize: wp('3.5%'),
        fontWeight: "bold",
    },
    nextButton: {
        alignItems: "center",
        backgroundColor: "#965541",
        borderRadius: wp('4%'),
        paddingVertical: hp('2%'),
        width: '100%',
    },
    nextButtonText: {
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
        width: '50%', // Adjusted fill to show progress
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
    nextIcon: {
        width: wp('22%'),
        height: hp('5%'),
    },
});
