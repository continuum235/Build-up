import React from "react";
import { View, ScrollView, Text, Image, TouchableOpacity, } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default (props) => {
const navigation = useNavigation();
	return (
		<SafeAreaProvider 
			style={{
				flex: 1,
				backgroundColor: "#FFFFFF",
			}}>
			<ScrollView  
				style={{
					flex: 1,
					backgroundColor: "#F2E1DA",
				}}>
				<View 
					style={{
						alignItems: "center",
						paddingBottom: 72,
					}}>
					<View 
						style={{
							alignSelf: "stretch",
							flexDirection: "row",
							marginBottom: 30,
							marginHorizontal: 27,
						}}>
						<View 
							style={{
								paddingVertical: 5,
								paddingHorizontal: 11,
								marginTop: 11,
								marginRight: 27,
							}}>
						
						</View>
						{/* <Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/349oadaf_expires_30_days.png"}} 
							resizeMode = {"stretch"}
							style={{
								height: 32,
								flex: 1,
								marginRight: 5,
							}}
						/> */}
						<View 
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 19,
							}}>
							{/* <Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/mozml383_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 18,
									height: 12,
									marginRight: 8,
								}}
							/> */}
							{/* <Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/1w2g1oww_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 17,
									height: 11,
									marginRight: 7,
								}}
							/> */}
							{/* <Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/3p44fzcp_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 27,
									height: 13,
								}}
							/> */}
						</View>
					</View>
					<View 
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 25,
						}}>
						<View 
							style={{
								backgroundColor: "#FFFFFF",
								padding: 8,
							}}>
							<Text 
								style={{
									color: "#965541",
									fontSize: 41,
									fontWeight: "bold",
								}}>
								{"build"}
							</Text>
						</View>
						<View 
							style={{
								borderColor: "#FFFFFF",
								borderWidth: 3,
								paddingVertical: 8,
								paddingHorizontal: 10,
							}}>
							<Text 
								style={{
									color: "#965541",
									fontSize: 41,
									fontWeight: "bold",
								}}>
								{"up"}
							</Text>
						</View>
					</View>
					<View 
						style={{
							paddingHorizontal: 28,
							marginBottom: 40,
						}}>
						<View 
							style={{
								alignSelf: "flex-start",
								marginBottom: 19,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/sdtazv35_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 99,
									height: 99,
								}}
							/>
							<View 
								style={{
									position: "absolute",
									bottom: -53,
									left: 22,
									width: 112,
									height: 77,
									backgroundColor: "#FFFFFF",
									borderRadius: 45,
								}}>
							</View>
						</View>
						<View 
							style={{
								alignSelf: "flex-start",
								marginBottom: 19,
								marginLeft: 63,
							}}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/xt5cwo1o_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 99,
									height: 99,
								}}
							/>
							<View 
								style={{
									position: "absolute",
									bottom: -54,
									left: 21,
									width: 112,
									height: 77,
									backgroundColor: "#FFFFFF",
									borderRadius: 45,
								}}>
							</View>
						</View>
						<Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Ud99L8lk74/of3c1w7v_expires_30_days.png"}} 
							resizeMode = {"stretch"}
							style={{
								width: 99,
								height: 99,
								marginLeft: 125,
							}}
						/>
					</View>
					<View 
						style={{
							alignSelf: "stretch",
							alignItems: "center",
							marginBottom: 25,
							marginHorizontal: 36,
						}}>
						<Text 
							style={{
								color: "#965541",
								fontSize: 36,
								fontWeight: "bold",
								marginBottom: 1,
							}}>
							{"A good headline"}
						</Text>
						<View 
							style={{
								alignItems: "center",
							}}>
							<Text 
								style={{
									color: "#000000",
									fontSize: 18,
									textAlign: "center",
									width: 209,
								}}>
								{"A simple app introduction \ngreeting audience."}
							</Text>
						</View>
					</View>
					<TouchableOpacity 
					 style={{
                        backgroundColor: "#1E1E1E",
                        borderRadius: 16,
                        paddingVertical: 17,
                        paddingHorizontal: 107,
                        }}
                    onPress={() => navigation.navigate("details")}
                    >
                    <Text
                    style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "bold",
                        }}
                    >
                    {"Log in"}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaProvider>
	)
}