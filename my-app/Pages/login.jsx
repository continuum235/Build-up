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
import { useNavigation } from "@react-navigation/native";

export default () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/Back-button.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.innerContainer}>
          
          {/* BRANDING */}
          <View style={styles.brandWrapper}>
            <View style={styles.brandSolid}>
              <Text style={styles.brandTextWhite}>build</Text>
            </View>
            <View style={styles.brandOutline}>
              <Text style={styles.brandTextBrown}>up</Text>
            </View>
          </View>

          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subText}>Log in to continue your journey</Text>

          {/* INPUT FIELDS */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#A4A9B6"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              placeholder="Password"
              placeholderTextColor="#A4A9B6"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <Text style={styles.loginBtnText}>Log in</Text>
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>or login with</Text>
            <View style={styles.line} />
          </View>

          {/* SOCIAL LOGINS */}
          <View style={styles.socialRow}>    
            <TouchableOpacity style={styles.socialCircle}>
               <Image 
                source={require('../assets/Google-logo.png')} 
                style={styles.googleIcon}
               />
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          {/* Using TouchableOpacity for the entire footer to make it more tappable */}
          <TouchableOpacity 
            style={styles.footerBtn}
            onPress={() => navigation.navigate("signup")}
          >
            <Text style={styles.footerText}>
              Don't have an account ??  <Text style={styles.signupLink}>Sign up</Text>
            </Text>

          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2E1DA", // Using your theme's soft background
  },
  scrollContent: {
    flexGrow: 1,
  },
  backBtn: {
    padding: wp('5%'),
    width: wp('20%'),
  },
  backIcon: {
    width: wp('8%'),
    height: wp('8%'),
  },
  innerContainer: {
    alignItems: "center",
    paddingHorizontal: wp('10%'),
  },
  brandWrapper: {
    flexDirection: "row",
    marginBottom: hp('4%'),
  },
  brandSolid: {
    backgroundColor: "#965541",
    paddingHorizontal: wp('2%'),
  },
  brandOutline: {
    borderColor: "#965541",
    borderWidth: 2,
    paddingHorizontal: wp('2%'),
    marginLeft: wp('1%'),
  },
  brandTextWhite: {
    color: "#FFF",
    fontSize: wp('10%'),
    fontWeight: "bold",
  },
  brandTextBrown: {
    color: "#965541",
    fontSize: wp('10%'),
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: wp('7.5%'),
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  subText: {
    fontSize: wp('4%'),
    color: "#666",
    marginBottom: hp('5%'),
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: wp('3%'),
    padding: wp('4.5%'),
    fontSize: wp('4%'),
    color: "#000",
    marginBottom: hp('2%'),
    // Soft shadow for inputs
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: hp('4%'),
  },
  forgotText: {
    color: "#965541",
    fontWeight: "600",
    fontSize: wp('3.5%'),
  },
  loginBtn: {
    backgroundColor: "#1E1E1E",
    width: '100%',
    paddingVertical: hp('2.2%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  loginBtnText: {
    color: "#FFF",
    fontSize: wp('4.5%'),
    fontWeight: "bold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp('3%'),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8DADC",
  },
  orText: {
    marginHorizontal: wp('3%'),
    color: "#A4A9B6",
    fontSize: wp('3.5%'),
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp('5%'),
  },
  socialCircle: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: "#FFF",
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp('3%'),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  googleIcon: {
    width: wp('6%'),
    height: wp('6%'),
  },
  footerText: {
    fontSize: wp('4%'),
    color: "#1E1E1E",
  },
  signupLink: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});
