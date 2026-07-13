import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { INDIAN_CITIES } from "../../data/cities";

interface CityDropdownProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export default function CityDropdown({
  value,
  onChange,
  label,
  placeholder = "Select city",
  error,
}: CityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? INDIAN_CITIES.filter((c) =>
        c.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : INDIAN_CITIES;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.triggerText : styles.placeholderText}>
          {value || placeholder}
        </Text>
        <Image
          source={require("../../../assets/Drop-down-arrow.png")}
          style={[styles.arrow, open && styles.arrowOpen]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <TextInput
                placeholder="Search city..."
                placeholderTextColor="#A4A9B6"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                autoFocus
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No city found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: "#1E1E1E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  triggerError: {
    borderColor: "red",
  },
  triggerText: {
    fontSize: 16,
    color: "#1E1E1E",
  },
  placeholderText: {
    fontSize: 16,
    color: "#A4A9B6",
  },
  arrow: {
    width: wp("4%"),
    height: wp("4%"),
    tintColor: "#965541",
  },
  arrowOpen: {
    transform: [{ rotate: "180deg" }],
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: wp("5%"),
    borderTopRightRadius: wp("5%"),
    maxHeight: hp("70%"),
    paddingBottom: hp("4%"),
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sheetTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  closeBtn: {
    fontSize: wp("5%"),
    color: "#965541",
    fontWeight: "bold",
  },
  searchBar: {
    marginHorizontal: wp("5%"),
    marginVertical: hp("1.5%"),
    borderWidth: 1,
    borderColor: "#D8DADC",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    paddingVertical: hp("1.2%"),
    fontSize: wp("4%"),
    color: "#1E1E1E",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("6%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  optionSelected: {
    backgroundColor: "#FFF5F0",
  },
  optionText: {
    fontSize: wp("4%"),
    color: "#1E1E1E",
  },
  optionTextSelected: {
    color: "#965541",
    fontWeight: "bold",
  },
  checkmark: {
    color: "#965541",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#A4A9B6",
    padding: 20,
  },
});
