import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import routes, { RootStackParamList } from "../navigation/routes";
import { useApi } from "../services/api";
import { useRealtime } from "../services/realtime";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
}

interface ChatScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, typeof routes.chat>;
  route: RouteProp<RootStackParamList, typeof routes.chat>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { conversationId, title } = route.params;
  const { getConversationMessages, sendMessage } = useApi();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { connected, subscribe } = useRealtime();
  const lastCreatedAtRef = useRef<string | null>(null);
  const pollTimerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getConversationMessages(conversationId);
        if (cancelled) return;
        const res = data as { messages: Message[]; currentUserId: string };
        setMessages(res.messages ?? []);
        if (res.messages && res.messages.length > 0) {
          lastCreatedAtRef.current = res.messages[res.messages.length - 1].createdAt;
        }
        setCurrentUserId(res.currentUserId);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [conversationId, getConversationMessages]);


  useEffect(() => {
    setDisconnected(!connected);
  }, [connected]);

  useEffect(() => {
    const unsub = subscribe((ev) => {
      if (ev.conversationId === conversationId) {
        const msg = ev.message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        lastCreatedAtRef.current = msg.createdAt;
      }
    });
    return () => unsub();
  }, [conversationId, subscribe]);

  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (!connected) {
      pollTimerRef.current = setInterval(async () => {
        try {
          const params: Record<string, string> = {};
          if (lastCreatedAtRef.current) params.after = lastCreatedAtRef.current;
          const data = await getConversationMessages(conversationId, params);
          const res = data as { messages: Message[]; currentUserId: string };
          if (res.messages && res.messages.length > 0) {
            setMessages((prev) => {
              const existing = new Set(prev.map((m) => m.id));
              const added = res.messages.filter((m) => !existing.has(m.id));
              if (added.length === 0) return prev;
              const next = [...prev, ...added];
              lastCreatedAtRef.current = next[next.length - 1].createdAt;
              return next;
            });
          }
        } catch {}
      }, 10000);
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [connected, conversationId, getConversationMessages]);
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText("");
    try {
      const data = await sendMessage(conversationId, text);
      const newMsg = (data as { message: Message }).message;
      setMessages((prev) => [...prev, newMsg]);
      lastCreatedAtRef.current = newMsg.createdAt;
    } catch {
      setInputText(text);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
        ]}
      >
        <Text style={isMe ? styles.chatTextMe : styles.chatTextThem}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: wp("10%") }} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#965541" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Write your message"
              placeholderTextColor="#A4A9B6"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, sending && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={sending}
            >
              <Text style={styles.sendIcon}>〉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    fontSize: wp("8%"),
    color: "#1E1E1E",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
    flex: 1,
    textAlign: "center",
    marginHorizontal: wp("2%"),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("2%"),
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("1.5%"),
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
  inputArea: {
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1.5%"),
    paddingBottom: hp("3%"),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
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
