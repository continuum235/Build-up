import React, { useState } from "react";
import { 
  View, 
  ScrollView, 
  Text, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// 1. Import the hook
import { useNavigation } from "@react-navigation/native";

export default (props) => {
  // 2. Initialize navigation
  const navigation = useNavigation();
  const [textInput1, onChangeTextInput1] = useState('');
  const [textInput2, onChangeTextInput2] = useState('');
  const [textInput3, onChangeTextInput3] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.flex1} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
       {/* 3. Wrap the image in a TouchableOpacity */}
        <TouchableOpacity 
          style={styles.backButtonContainer} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Makes it easier to tap
        >
          <Image
            source={require('../assets/Back-button.png')}
            resizeMode={"contain"}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={styles.innerContainer}>
          
          {/* HEADER SECTION */}
          <View style={styles.headerWrapper}>
            <View style={styles.titleRow}>
              <View style={styles.titleBoxSolid}>
                <Text style={styles.titleTextWhite}>build</Text>
              </View>
              <View style={styles.titleBoxOutline}>
                <Text style={styles.titleTextBrown}>up</Text>
              </View>
            </View>
            
            <Text style={styles.headline}>
              Sign up to find work you{"\n"}want
            </Text>
          </View>

          {/* SOCIAL BUTTONS */}
          <View style={styles.socialSection}>
          <TouchableOpacity style={styles.socialButton} onPress={() => alert('Google Login')}>
              <Image
                source={require('../assets/Google-logo.png')}
                style={styles.googleIcon}
              />
              <Text style={[styles.socialButtonText, { color: "#4285F4" }]}>Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          {/* INPUT FIELDS */}
          <View style={styles.inputSection}>
            <TextInput
              placeholder={"Full Name"}
              placeholderTextColor="#A4A9B6"
              value={textInput1}
              onChangeText={onChangeTextInput1}
              style={styles.input}
            />
            <TextInput
              placeholder={"Email"}
              placeholderTextColor="#A4A9B6"
              value={textInput2}
              onChangeText={onChangeTextInput2}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder={"Password (8 or more characters)"}
              placeholderTextColor="#A4A9B6"
              value={textInput3}
              onChangeText={onChangeTextInput3}
              secureTextEntry={true}
              style={styles.input}
            />
            
            {/* LOCATION SELECTOR */}
            <TouchableOpacity style={styles.locationSelector}>
              <Text style={styles.locationText}>Select Location</Text>
              <Image
                source={require('../assets/Drop-down-arrow.png')}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity style={styles.submitButton} onPress={() => alert('Account Created!')}>
            <Text style={styles.submitButtonText}>Create my account</Text>
          </TouchableOpacity>

          {/* FOOTER TEXT */}
          <Text style={styles.footerTerms}>
            By creating an account or signing you agree to our 
            <Text style={{ fontWeight: 'bold' }}> Terms and Conditions</Text>
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp('5%'),
  },
  innerContainer: {
    alignItems: "center",
    paddingHorizontal: wp('8%'),
  },
  // Added a container for the back button to manage spacing better
  backButtonContainer: {
    paddingLeft: wp('6%'),
    paddingTop: hp('2%'),
    width: wp('20%'), // Gives a larger touch area
  },
  backIcon: {
    width: wp('8%'),
    height: wp('8%'),
    marginTop: hp('2%'),
    marginLeft: wp('8%'),
    marginBottom: hp('2%'),
  },
  headerWrapper: {
    alignItems: "center",
    marginBottom: hp('4%'),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp('3%'),
  },
  titleBoxSolid: {
    backgroundColor: "#965541",
    paddingHorizontal: wp('2%'),
    marginRight: wp('0.5%'),
  },
  titleBoxOutline: {
    borderColor: "#965541",
    borderWidth: 2,
    paddingHorizontal: wp('2%'),
  },
  titleTextWhite: {
    color: "#F2E1DA",
    fontSize: wp('9%'),
    fontWeight: "bold",
  },
  titleTextBrown: {
    color: "#965541",
    fontSize: wp('9%'),
    fontWeight: "bold",
  },
  headline: {
    color: "#965541",
    fontSize: wp('6.5%'),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: wp('9%'),
  },
  socialSection: {
    width: '100%',
    marginBottom: hp('3%'),
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#1E1E1E",
    borderRadius: wp('10%'),
    borderWidth: 1,
    paddingVertical: hp('1.8%'),
    marginBottom: hp('1.5%'),
  },
  socialButtonText: {
    color: "#000000",
    fontSize: wp('4%'),
    fontWeight: "bold",
  },
  appleLogo: {
    fontSize: wp('5%'),
    marginRight: wp('3%'),
  },
  googleIcon: {
    width: wp('4.5%'),
    height: wp('4.5%'),
    marginRight: wp('3%'),
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp('3%'),
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: "#D8DADC",
  },
  orText: {
    color: "#A4A9B6",
    fontSize: wp('3.5%'),
    marginHorizontal: wp('3%'),
  },
  inputSection: {
    width: '100%',
    marginBottom: hp('3%'),
  },
  input: {
    color: "#000000",
    fontSize: wp('4%'),
    borderColor: "#D8DADC",
    borderRadius: wp('3%'),
    borderWidth: 1,
    padding: wp('4.5%'),
    marginBottom: hp('1.5%'),
  },
  locationSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#D8DADC",
    borderRadius: wp('3%'),
    borderWidth: 1,
    padding: wp('4.5%'),
  },
  locationText: {
    color: "#000000",
    fontSize: wp('4%'),
  },
  chevronIcon: {
    width: wp('5%'),
    height: wp('5%'),
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#965541",
    borderRadius: wp('4%'),
    paddingVertical: hp('2.2%'),
    width: '100%',
    marginBottom: hp('3%'),
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: wp('4.5%'),
    fontWeight: "bold",
  },
  footerTerms: {
    color: "#666",
    fontSize: wp('3.2%'),
    textAlign: "center",
    paddingHorizontal: wp('5%'),
    lineHeight: wp('5%'),
  },
});