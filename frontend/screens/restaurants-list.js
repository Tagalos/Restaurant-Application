import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../config/api";
import { Ionicons } from "@expo/vector-icons";

export default function RestaurantsList({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Restaurants",
      headerStyle: { backgroundColor: "#F2F2F2" },
      headerTitleStyle: { color: "#333333", fontWeight: "600" },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="person-circle-outline" size={28} color="#444444" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/restaurants");
        const list = Array.isArray(res.data) ? res.data : [];
        setRestaurants(list);
        setFiltered(list);
      } catch (e) {
        setError("Unable to load restaurants.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(
      !q
        ? restaurants
        : restaurants.filter((r) => {
            return (
              r.restaurant_name.toLowerCase().includes(q) ||
              r.restaurant_location.toLowerCase().includes(q)
            );
          })
    );
  }, [query, restaurants]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ReservationForm", { restaurant: item })
      }
    >
      <View style={styles.cardHeader}>
        <Ionicons name="restaurant-outline" size={22} color="#444444" />
        <Text style={styles.name}>{item.restaurant_name}</Text>
        <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#777777" />
        <Text style={styles.location}>{item.restaurant_location}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {item.restaurant_description}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#444444" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#AAAAAA" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for restaurants"
          placeholderTextColor="#AAAAAA"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.restaurant_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Restaurants not found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333333",
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    flex: 1,
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: "#777777",
  },
  description: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
  separator: {
    height: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#D00",
    fontSize: 16,
  },
  emptyText: {
    color: "#777777",
    fontSize: 16,
  },
});
