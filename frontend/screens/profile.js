import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import api from "../config/api";

export default function Profile({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Auth");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "My Reservations",
      headerStyle: { backgroundColor: "#F2F2F2" },
      headerTitleStyle: { color: "#333333", fontWeight: "600" },
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#444444" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get("/reservations/user");
        setReservations(res.data);
      } catch (err) {
        Alert.alert("Error", "Unable to load reservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleCancel = (id) => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await api.delete(`/reservations/${id}`);
              setReservations((prev) =>
                prev.filter((r) => r.reservation_id !== id)
              );
            } catch {
              Alert.alert("Error", "Unable to load reservations.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (reservation) => {
    navigation.navigate("ReservationForm", {
      restaurant: {
        restaurant_id: reservation.restaurant_id,
        restaurant_name: reservation.restaurant_name,
        restaurant_location: reservation.restaurant_location,
        restaurant_description: reservation.restaurant_description,
      },
      existingReservation: reservation,
      editMode: true,
    });
  };

  const renderItem = ({ item }) => {
    const dateStr = new Date(item.reservation_date).toLocaleDateString();
    return (
      <View style={styles.card}>
        <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
        <View style={styles.fieldRow}>
          <Ionicons name="calendar-outline" size={16} color="#777777" />
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValue}>{dateStr}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Ionicons name="time-outline" size={16} color="#777777" />
          <Text style={styles.fieldLabel}>Time</Text>
          <Text style={styles.fieldValue}>{item.reservation_time}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Ionicons name="people-outline" size={16} color="#777777" />
          <Text style={styles.fieldLabel}>People</Text>
          <Text style={styles.fieldValue}>{item.people_count}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Text style={styles.editText}>Processing</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCancel(item.reservation_id)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#444444" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      {reservations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>There are no reservations.</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => String(item.reservation_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F2F2F2", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoutBtn: { marginRight: 16 },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  backgroundList: { flex: 1 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fieldRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  fieldLabel: { marginLeft: 6, fontSize: 14, color: "#333333", flex: 1 },
  fieldValue: { fontSize: 14, color: "#333333", fontWeight: "500" },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  editText: { color: "#007ACC", fontWeight: "500", marginRight: 16 },
  cancelText: { color: "#D00", fontWeight: "500" },
  emptyText: { fontSize: 16, color: "#777777" },
  list: { paddingBottom: 24 },
});
