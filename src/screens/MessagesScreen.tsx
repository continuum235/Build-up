import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BottomNavigation from "../components/BottomNavigation";

interface MessageScreenProps {
  navigation: any;
}

export default function MessagesScreen({ navigation }: MessageScreenProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const inboxMessages = [
    {
      id: 1,
      name: "Erin Steed",
      time: "9:28 AM",
      preview:
        "(Sad fact: you cannot search for a gif of the word \"gif\", just gives",
    },
    { id: 2, name: "Erin Steed", time: "9:28 AM", preview: "(Sad fact: you cannot search for a gif of the word \"gif\", just gives" },
    { id: 3, name: "Erin Steed", time: "9:28 AM", preview: "(Sad fact: you cannot search for a gif of the word \"gif\", just gives" },
    { id: 4, name: "Erin Steed", time: "9:28 AM", preview: "(Sad fact: you cannot search for a gif of the word \"gif\", just gives" },
    { id: 5, name: "Erin Steed", time: "9:28 AM", preview: "(Sad fact: you cannot search for a gif of the word \"gif\", just gives" },
  ];

  const chatHistory = [
    { id: 1, sender: "me", text: "Let's get lunch. How about pizza?" },
    { id: 2, sender: "them", text: "Let's do it! I'm in a meeting until noon." },
    { id: 3, sender: "me", text: "That's perfect. There's a new place on Main St I've been wanting to check out. I hear their hawaiian pizza is awesome!" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center justify-center py-[2.5%] px-[6%]" style={{ paddingVertical: hp("2.5%"), paddingHorizontal: wp("6%") }}>
          {activeChat ? (
            <>
              <TouchableOpacity
                className="absolute left-[6%] z-10"
                style={{ left: wp("6%") }}
                onPress={() => setActiveChat(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="font-bold text-[#1E1E1E]" style={{ fontSize: wp("6%") }}>〈</Text>
              </TouchableOpacity>
              <Text className="font-bold text-[#1E1E1E]" style={{ fontSize: wp("4.5%") }}>{activeChat}</Text>
              <View style={{ width: wp("6%") }} />
            </>
          ) : (
            <Text className="font-bold text-[#1E1E1E]" style={{ fontSize: wp("5.5%") }}>Messages</Text>
          )}
        </View>

        {!activeChat ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: wp("6%"), paddingBottom: hp("3%") }}
            showsVerticalScrollIndicator={false}
          >
            {inboxMessages.map((msg, index) => (
              <TouchableOpacity
                key={`${msg.id}-${index}`}
                className="flex-row items-center py-[2%] border-b border-[#F0F0F0]"
                style={{ paddingVertical: hp("2%") }}
                onPress={() => setActiveChat("Kalpataru")}
              >
                <View
                  className="bg-[#D8DADC] mr-[4%]"
                  style={{
                    width: wp("13%"),
                    height: wp("13%"),
                    borderRadius: wp("6.5%"),
                    marginRight: wp("4%"),
                  }}
                />
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-[0.5%]" style={{ marginBottom: hp("0.5%") }}>
                    <Text className="font-bold text-[#965541]" style={{ fontSize: wp("4.2%") }}>{msg.name}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-[#A4A9B6]" style={{ fontSize: wp("3.2%") }}>{msg.time}</Text>
                      <Text className="text-[#A4A9B6] ml-[1%] mt-[0.2%]" style={{ fontSize: wp("3.5%") }}> 〉</Text>
                    </View>
                  </View>
                  <Text
                    className="text-[#A4A9B6]"
                    style={{ fontSize: wp("3.5%"), lineHeight: wp("5%") }}
                    numberOfLines={2}
                  >
                    {msg.preview}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: wp("5%"), paddingTop: hp("2%"), paddingBottom: hp("4%") }}
              showsVerticalScrollIndicator={false}
            >
              {chatHistory.map((chat) => (
                <View
                  key={chat.id}
                  className={`max-w-[80%] px-[4%] mb-[2%] ${chat.sender === "me" ? "self-end bg-[#965541]" : "self-start bg-[#E5E5EA]"}`}
                  style={{
                    paddingVertical: hp("1.5%"),
                    paddingHorizontal: wp("4%"),
                    marginBottom: hp("2%"),
                    borderTopLeftRadius: wp("4%"),
                    borderTopRightRadius: wp("4%"),
                    borderBottomLeftRadius: chat.sender === "me" ? wp("4%") : 0,
                    borderBottomRightRadius: chat.sender === "me" ? 0 : wp("4%"),
                  }}
                >
                  <Text
                    className={chat.sender === "me" ? "text-white" : "text-[#1E1E1E]"}
                    style={{ fontSize: wp("4%"), lineHeight: wp("5.8%") }}
                  >
                    {chat.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View className="px-[5%] py-[1.5%] bg-white" style={{ paddingHorizontal: wp("5%"), paddingVertical: hp("1.5%") }}>
              <View className="flex-row items-end border border-[#D8DADC] rounded-[30px] px-[4%] py-[0.8%] bg-white" style={{ borderRadius: wp("6%"), paddingHorizontal: wp("4%"), paddingVertical: hp("0.8%") }}>
                <TextInput
                  className="flex-1 text-[#1E1E1E]"
                  style={{
                    fontSize: wp("4%"),
                    minHeight: hp("4.5%"),
                    maxHeight: hp("12%"),
                    paddingTop: hp("1%"),
                  }}
                  placeholder="Write your message"
                  placeholderTextColor="#A4A9B6"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <TouchableOpacity
                  className="bg-[#965541] rounded-full items-center justify-center ml-[2%] mb-[0.3%]"
                  style={{
                    width: wp("8%"),
                    height: wp("8%"),
                    borderRadius: wp("4%"),
                    marginLeft: wp("2%"),
                    marginBottom: hp("0.3%"),
                  }}
                >
                  <Text className="text-white font-bold ml-[0.5%]" style={{ fontSize: wp("3.5%") }}>〉</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <BottomNavigation navigation={navigation} activeTab="messages" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
