import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import routes, { RootStackParamList } from "../navigation/routes";
import { useApi } from "../services/api";
import BottomNavigation from "../components/layout/BottomNavigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Conversation {
  id: string;
  job: { id: string; title: string };
  hirer: { id: string; name: string };
  worker: { id: string; name: string };
  messages: { id: string; content: string; createdAt: string }[];
  createdAt: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { listConversations } = useApi();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listConversations();
      setConversations((data as { conversations: Conversation[] }).conversations ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [listConversations]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations]),
  );

  const renderItem = ({ item }: { item: Conversation }) => {
    const lastMsg = item.messages[0];
    const otherName = item.hirer.name || item.worker.name || "Unknown";
    return (
      <TouchableOpacity
        style={styles.messageRow}
        onPress={() =>
          navigation.navigate(routes.chat, {
            conversationId: item.id,
            title: otherName,
          })
        }
      >
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {otherName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.messageDetails}>
          <View style={styles.messageHeader}>
            <Text style={styles.senderName} numberOfLines={1}>
              {otherName}
            </Text>
            <View style={styles.timeChevronWrap}>
              <Text style={styles.timeText}>
                {lastMsg ? relativeTime(lastMsg.createdAt) : relativeTime(item.createdAt)}
              </Text>
              <Text style={styles.chevronIcon}> 〉</Text>
            </View>
          </View>
          <Text style={styles.jobTitleText} numberOfLines={1}>
            {item.job.title}
          </Text>
          <Text style={styles.previewText} numberOfLines={1}>
            {lastMsg ? lastMsg.content : "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#965541" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Message a hirer about a job to start chatting
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNavigation activeTab="messages" />
    </SafeAreaView>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  pageTitle: {
    color: "#1E1E1E",
    fontSize: wp("5.5%"),
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("10%"),
  },
  emptyText: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: hp("1%"),
  },
  emptySubtext: {
    fontSize: wp("3.5%"),
    color: "#666666",
    textAlign: "center",
  },
  listContent: {
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
    backgroundColor: "#965541",
    marginRight: wp("4%"),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  messageDetails: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("0.3%"),
  },
  senderName: {
    color: "#965541",
    fontSize: wp("4.2%"),
    fontWeight: "bold",
    flex: 1,
    marginRight: wp("2%"),
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
  },
  jobTitleText: {
    color: "#1E1E1E",
    fontSize: wp("3.5%"),
    fontWeight: "600",
    marginBottom: hp("0.3%"),
  },
  previewText: {
    color: "#A4A9B6",
    fontSize: wp("3.5%"),
    lineHeight: wp("5%"),
  },
});
