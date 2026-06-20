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
  StyleSheet,
  Image,
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
        '(Sad fact: you cannot search for a gif of the word "gif", just gives',
    },
    {
      id: 2,
      name: "Erin Steed",
      time: "9:28 AM",
      preview:
        '(Sad fact: you cannot search for a gif of the word "gif", just gives',
    },
    {
      id: 3,
      name: "Erin Steed",
      time: "9:28 AM",
      preview:
        '(Sad fact: you cannot search for a gif of the word "gif", just gives',
    },
    {
      id: 4,
      name: "Erin Steed",
      time: "9:28 AM",
      preview:
        '(Sad fact: you cannot search for a gif of the word "gif", just gives',
    },
    {
      id: 5,
      name: "Erin Steed",
      time: "9:28 AM",
      preview:
        '(Sad fact: you cannot search for a gif of the word "gif", just gives',
    },
  ];

  const chatHistory = [
    { id: 1, sender: "me", text: "Let's get lunch. How about pizza?" },
    {
      id: 2,
      sender: "them",
      text: "Let's do it! I'm in a meeting until noon.",
    },
    {
      id: 3,
      sender: "me",
      text: "That's perfect. There's a new place on Main St I've been wanting to check out. I hear their hawaiian pizza is awesome!",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          {activeChat ? (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setActiveChat(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image
                  source={require("../../assets/Back-button.png")}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.chatTitle}>{activeChat}</Text>
              <View style={styles.backButtonSpacer} />
            </>
          ) : (
            <Text style={styles.pageTitle}>Messages</Text>
          )}
        </View>

        {/* DYNAMIC CONTENT AREA */}
        {!activeChat ? (
          // INBOX LIST VIEW
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.inboxScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {inboxMessages.map((msg, index) => (
              <TouchableOpacity
                key={`${msg.id}-${index}`}
                style={styles.messageRow}
                onPress={() => setActiveChat("Kalpataru")}
              >
                <View style={styles.avatarPlaceholder} />

                <View style={styles.messageDetails}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.senderName}>{msg.name}</Text>
                    <View style={styles.timeChevronWrap}>
                      <Text style={styles.timeText}>{msg.time}</Text>
                      <Text style={styles.chevronIcon}> 〉</Text>
                    </View>
                  </View>
                  <Text style={styles.previewText} numberOfLines={2}>
                    {msg.preview}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          // ACTIVE CHAT VIEW
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.chatScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {chatHistory.map((chat) => (
                <View
                  key={chat.id}
                  style={[
                    styles.chatBubble,
                    chat.sender === "me" ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text
                    style={
                      chat.sender === "me"
                        ? styles.chatTextMe
                        : styles.chatTextThem
                    }
                  >
                    {chat.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* CHAT INPUT AREA */}
            <View style={styles.inputArea}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write your message"
                  placeholderTextColor="#A4A9B6"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <TouchableOpacity style={styles.sendButton}>
                  <Text style={styles.sendIcon}>〉</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* HEADER STYLES */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2.5%"),
    paddingHorizontal: wp("6%"),
  },
  pageTitle: {
    color: "#1E1E1E",
    fontSize: wp("5.5%"),
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    left: wp("6%"),
    zIndex: 10,
  },
  backIcon: {
    width: wp("6%"),
    height: wp("6%"),
    resizeMode: "contain",
  },
  chatTitle: {
    color: "#1E1E1E",
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
  backButtonSpacer: {
    width: wp("6%"),
  },

  /* GENERAL SCROLL */
  scrollView: {
    flex: 1,
  },

  /* INBOX LIST STYLES */
  inboxScrollContent: {
    paddingHorizontal: wp("6%"),
    paddingBottom: hp("12%"),
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarPlaceholder: {
    width: wp("13%"),
    height: wp("13%"),
    borderRadius: wp("6.5%"),
    backgroundColor: "#D8DADC",
    marginRight: wp("4%"),
  },
  messageDetails: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  senderName: {
    color: "#965541",
    fontSize: wp("4.2%"),
    fontWeight: "bold",
  },
  timeChevronWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "#A4A9B6",
    fontSize: wp("3.2%"),
  },
  chevronIcon: {
    color: "#A4A9B6",
    fontSize: wp("3.5%"),
    marginLeft: wp("1%"),
    marginTop: hp("0.2%"),
  },
  previewText: {
    color: "#A4A9B6",
    fontSize: wp("3.5%"),
    lineHeight: wp("5%"),
  },

  /* ACTIVE CHAT STYLES */
  chatContainer: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("4%"),
  },
  chatBubble: {
    maxWidth: "80%",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
  },
  bubbleMe: {
    alignSelf: "flex-end",
    backgroundColor: "#965541",
    borderTopLeftRadius: wp("4%"),
    borderTopRightRadius: wp("4%"),
    borderBottomLeftRadius: wp("4%"),
    borderBottomRightRadius: 0,
  },
  bubbleThem: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderTopLeftRadius: wp("4%"),
    borderTopRightRadius: wp("4%"),
    borderBottomRightRadius: wp("4%"),
    borderBottomLeftRadius: 0,
  },
  chatTextMe: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    lineHeight: wp("5.8%"),
  },
  chatTextThem: {
    color: "#1E1E1E",
    fontSize: wp("4%"),
    lineHeight: wp("5.8%"),
  },

  /* CHAT INPUT AREA */
  inputArea: {
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1.5%"),
    paddingBottom: hp("12%"),
    backgroundColor: "#FFFFFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderColor: "#D8DADC",
    borderWidth: 1,
    borderRadius: wp("6%"),
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("0.8%"),
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    flex: 1,
    minHeight: hp("4.5%"),
    maxHeight: hp("12%"),
    color: "#1E1E1E",
    fontSize: wp("4%"),
    paddingTop: hp("1%"),
  },
  sendButton: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    backgroundColor: "#965541",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("2%"),
    marginBottom: hp("0.3%"),
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    marginLeft: wp("0.5%"),
  },
});
