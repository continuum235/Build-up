import React, { useState } from "react";
import { 
    View, 
    ScrollView, 
    Text, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    StatusBar,
    TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";

export default (props) => {
    const navigation = useNavigation();
    
    // State to hold the user's typed input
    const [roleText, setRoleText] = useState("");

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
                {/* INSTRUCTION TEXT */}
                <View style={styles.textSection}>
                    <Text style={styles.mainHeading}>
                        Got it. Now, add a title{"\n"}to tell the world what you do.
                    </Text>
                    <Text style={styles.subHeading}>
                        It’s the very first thing that someone sees while connecting. Make sure to describe your expertise in a particular role.
                    </Text>
                </View>

                {/* INPUT FIELD */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>
                        Your professional role
                    </Text>
                    <TextInput
                        style={styles.inputBox}
                        placeholder="Plumber | Carpenter | Skilled Labour"
                        placeholderTextColor="#A4A9B6"
                        value={roleText}
                        onChangeText={setRoleText}
                    />
                </View>
                
                {/* FLEX SPACER - Pushes the button down if the screen is tall */}
                <View style={{ flex: 1 }} />

                {/* ADD EXPERTISE BUTTON */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => {
                        if (roleText.trim() === "") {
                            alert("Please enter a role first.");
                        } else {
                            console.log("Added role:", roleText);
                            navigation.navigate("Language_section");
                        }
                    }}
                >
                    <Text style={styles.addButtonText}>Add Expertise</Text>
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
                <Text style={styles.stepText}>2/4</Text>
                
                {/* Arrow Navigation (Left & Right) */}
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: "#965541",
                            width: wp('12%'),
                            height: wp('10%'),
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: wp('2%'),
                            marginRight: wp('2%')
                        }} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={{ color: "#FFFFFF", fontSize: wp('5%'), fontWeight: "bold" }}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: "#965541",
                            width: wp('12%'),
                            height: wp('10%'),
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: wp('2%')
                        }} 
                        onPress={() => navigation.navigate('Language_section')}
                    >
                        <Text style={{ color: "#FFFFFF", fontSize: wp('5%'), fontWeight: "bold" }}>{'>'}</Text>
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
        width: wp('8%'), 
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1, // Allows the flex:1 spacer above the button to stretch
        paddingHorizontal: wp('8%'),
        paddingTop: hp('2%'),
        paddingBottom: hp('3%'),
    },
    textSection: {
        marginBottom: hp('5%'),
    },
    mainHeading: {
        color: "#965541",
        fontSize: wp('7.5%'),
        lineHeight: wp('10%'),
        marginBottom: hp('2%'),
    },
    subHeading: {
        color: "#1E1E1E",
        fontSize: wp('3.8%'),
        lineHeight: wp('5.5%'),
        opacity: 0.8,
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
    inputBox: {
        borderColor: "#D8DADC",
        borderRadius: wp('3%'),
        borderWidth: 1,
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%'),
        color: "#000000",
        fontSize: wp('4%'),
        backgroundColor: "#FFFFFF",
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
        width: '75%', 
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
