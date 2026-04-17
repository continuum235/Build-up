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
    
    // State to manage selected languages
    const [selectedLanguages, setSelectedLanguages] = useState(['Marathi', 'Hindi']);
    const [inputText, setInputText] = useState("");

    // Function to remove a language when the 'x' is tapped
    const removeLanguage = (langToRemove) => {
        setSelectedLanguages(selectedLanguages.filter(lang => lang !== langToRemove));
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
                {/* INSTRUCTION TEXT */}
                <View style={styles.textSection}>
                    <Text style={styles.mainHeading}>
                        Looking good. Next,{"\n"}tell us which languages you speak.
                    </Text>
                    <Text style={styles.subHeading}>
                        Build up is used by people across the country, with different languages. This data will help us to know you more and provide better experience.
                    </Text>
                </View>

                {/* LANGUAGES INPUT SECTION */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Your languages</Text>
                    <Text style={styles.inputNote}>*Choose max upto three languages</Text>

                    {/* Chip Input Box */}
                    <View style={styles.chipInputContainer}>
                        
                        {/* Map through selected languages to create pills */}
                        {selectedLanguages.map((lang, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.chip}
                                onPress={() => removeLanguage(lang)}
                            >
                                <Text style={styles.chipText}>{lang}</Text>
                                <Image
                                    source={require("../assets/Drop-down-arrow.png")}
                                    style={styles.chipIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        ))}

                        {/* Text input for the next language */}
                        {selectedLanguages.length < 3 && (
                            <TextInput
                                style={styles.textInput}
                                placeholder="English..."
                                placeholderTextColor="#A4A9B6"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={() => {
                                    if(inputText.trim() && selectedLanguages.length < 3) {
                                        setSelectedLanguages([...selectedLanguages, inputText.trim()]);
                                        setInputText("");
                                    }
                                }}
                            />
                        )}
                    </View>
                </View>

                {/* PUSH CONTENT UP */}
                <View style={{ flex: 1 }} />

                {/* ADD LANGUAGES BUTTON */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('AddSkill')}
                >
                    <Text style={styles.addButtonText}>Add Languages</Text>
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
                <Text style={styles.stepText}>3/4</Text>
                
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
                        <Image
                            source={require("../assets/Back-button.png")}
                            style={{ width: wp('6%'), height: wp('6%'), tintColor: "#FFFFFF" }}
                            resizeMode="contain"
                        />
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
                        onPress={() => navigation.navigate('AddSkill')}
                    >
                        <Image
                            source={require("../assets/Next-page-logo.png")}
                            style={{ width: wp('6%'), height: wp('6%'), tintColor: "#FFFFFF" }}
                            resizeMode="contain"
                        />
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
        marginBottom: hp('2%'),
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
    chipInputContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // Allows chips to wrap to the next line if they get too long
        alignItems: "center",
        borderColor: "#D8DADC",
        borderRadius: wp('3%'),
        borderWidth: 1,
        padding: wp('3%'),
        minHeight: hp('7%'),
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#965541",
        borderRadius: wp('4%'),
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        marginRight: wp('2%'),
        marginBottom: hp('1%'),
    },
    chipText: {
        color: "#FFFFFF",
        fontSize: wp('3.5%'),
        fontWeight: "bold",
        marginRight: wp('2%'),
    },
    chipIcon: {
        width: wp('3.5%'),
        height: wp('3.5%'),
        tintColor: "#FFFFFF", // Ensures the 'x' icon matches the text color
        transform: [{ rotate: "-90deg" }],
    },
    textInput: {
        flex: 1,
        minWidth: wp('20%'),
        color: "#000000",
        fontSize: wp('4%'),
        paddingVertical: hp('1%'),
        marginBottom: hp('1%'),
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
        width: '90%', // Approaching the end of the form flow
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
