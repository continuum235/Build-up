import React from "react";
import { 
  View, 
  ScrollView, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";


export default () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>

          {/* TITLE SECTION */}
          <View style={styles.titleWrapper}>
            <View style={styles.titleBoxSolid}>
              <Text style={styles.titleText}>build</Text>
            </View>
            <View style={styles.titleBoxTint}>
              <Text style={styles.titleText}>up</Text>
            </View>
          </View>

          {/* HEXAGONAL IMAGE SECTION */}
          <View style={styles.hexagonGrid}>
            {/* Top Avatar */}
            <Image source={require('../assets/Boy-1.png')} style={[styles.hexImage, styles.posTop]} resizeMode="contain" />
            
            {/* Middle Row */}
            <View style={[styles.hexBlank, styles.posMidLeft]} />
            <Image source={require('../assets/Boy-2.png')} style={[styles.hexImage, styles.posMidCenter]} resizeMode="contain" />
            <View style={[styles.hexBlank, styles.posMidRight]} />
            
            {/* Bottom Row */}
            <View style={[styles.hexBlank, styles.posBottomLeft]} />
            <Image source={require('../assets/Girl.png')} style={[styles.hexImage, styles.posBottomRight]} resizeMode="contain" />
          </View>

          {/* TEXT SECTION */}
          <View style={styles.textSection}>
            <Text style={styles.headline}>A good headline</Text>
            <Text style={styles.subheadline}>
              A simple app introduction {"\n"} greeting audience.
            </Text>
          </View>

          {/* BUTTONS */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.loginButton}
              onPress={() => navigation.navigate("login")}
            >
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.signupContainer}
                onPress={() => navigation.navigate("signup")}
            >
              <Text style={styles.signupText}>
                New to Buildup? <Text style={styles.signupLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2E1DA", 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
  },
  innerContainer: {
    alignItems: "center",
    paddingVertical: hp('4%'),
  },
  titleWrapper: {
    flexDirection: "row",
    backgroundColor: '#FFFFFF',
    padding: wp('1%'),
    marginBottom: hp('5%'),
  },
  titleBoxSolid: {
    paddingHorizontal: wp('3%'),
  },
  titleBoxTint: {
    backgroundColor: "#F2E1DA", // Slight tint like in image
    paddingHorizontal: wp('3%'),
  },
  titleText: {
    color: "#965541",
    fontSize: wp('11%'),
    fontWeight: "bold",
    textTransform: 'lowercase'
  },
  
  /* HEX GRID LOGIC */
  hexagonGrid: {
    width: wp('80%'),
    height: hp('35%'),
    marginBottom: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexImage: {
    width: wp('22%'),
    height: wp('22%'),
    position: 'absolute',
  },
  hexBlank: {
    width: wp('20%'),
    height: wp('20%'),
    backgroundColor: 'rgba(255,255,255,0.5)', // The white hexagonal shapes
    borderRadius: wp('4%'),
    position: 'absolute',
    transform: [{ rotate: '45deg' }] // Basic shape approximation
  },
  // Positioning based on the provided design image
  posTop: { top: 0, left: wp('15%') },
  posMidLeft: { top: hp('8%'), left: wp('5%') },
  posMidCenter: { top: hp('10%'), left: wp('30%') },
  posMidRight: { top: hp('12%'), left: wp('55%') },
  posBottomLeft: { top: hp('20%'), left: wp('22%') },
  posBottomRight: { top: hp('22%'), left: wp('48%') },

  textSection: {
    alignItems: "center",
    width: "85%",
    marginBottom: hp('5%'),
  },
  headline: {
    color: "#965541",
    fontSize: wp('9%'),
    fontWeight: "bold",
    textAlign: "center",
  },
  subheadline: {
    color: "#555",
    fontSize: wp('4.5%'),
    textAlign: "center",
    marginTop: hp('1.5%'),
    lineHeight: wp('6%'),
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: "#1E1E1E",
    borderRadius: wp('5%'),
    paddingVertical: hp('2.2%'),
    width: wp('70%'),
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: wp('4.5%'),
    fontWeight: "bold",
  },
  signupContainer: {
    padding: wp('2%'),
  },
  signupText: {
    fontSize: wp('4.5%'),
    color: "#333",
  },
  signupLink: {
    color: "#007AFF", // Standard blue link color from your image
    fontWeight: "600",
  },
});