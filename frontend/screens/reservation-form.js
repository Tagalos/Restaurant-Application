import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import api from "../config/api";

export default function ReservationForm({ route, navigation }) {
  const restaurant = route?.params?.restaurant;
  const existing = route?.params?.existingReservation;
  const editMode = route?.params?.editMode;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: editMode ? "Reservation Processing" : "New Booking",
      headerStyle: { backgroundColor: "#F2F2F2" },
      headerTitleStyle: { color: "#333333", fontWeight: "600" },
      headerBackTitle: "Back",
      headerTruncatedBackTitle: "Back",
    });
  }, [navigation, editMode]);

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Error: No restaurant information available.
        </Text>
      </View>
    );
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 6);

  const parsedExisting = existing?.reservation_date
    ? new Date(existing.reservation_date)
    : null;
  if (parsedExisting) parsedExisting.setHours(0, 0, 0, 0);
  const [date, setDate] = useState(parsedExisting || minDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const defaultTime = new Date();
  defaultTime.setHours(14, 0, 0, 0);
  const parsedTime = existing?.reservation_time
    ? new Date(`1970-01-01T${existing.reservation_time}`)
    : null;
  const [time, setTime] = useState(parsedTime || defaultTime);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [peopleCount, setPeopleCount] = useState(existing?.people_count || 2);
  const [showPeople, setShowPeople] = useState(false);
  const [tempCount, setTempCount] = useState(String(peopleCount));

  const [available, setAvailable] = useState(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const MAX = 10;
  const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchAvail = async () => {
      setLoadingAvail(true);
      try {
        const d = formatDate(date);
        const res = await api.get(
          `/restaurants/${restaurant.restaurant_id}/availability`,
          { params: { date: d } }
        );
        const { limit, reserved } = res.data;
        const current = editMode ? existing.people_count : 0;
        setAvailable(limit - reserved + current);
      } catch {
        setAvailable(null);
      } finally {
        setLoadingAvail(false);
      }
    };
    fetchAvail();
  }, [date, editMode, existing]);

  const submit = async () => {
    if (available !== null && available <= 0 && !editMode) {
      Alert.alert("Unavailable", "There are no tables available.");
      return;
    }
    setSubmitting(true);
    try {
      const d = formatDate(date);
      const hh = String(time.getHours()).padStart(2, "0");
      const mm = String(time.getMinutes()).padStart(2, "0");
      const t = `${hh}:${mm}:00`;

      if (!editMode) {
        const u = await api.get("/reservations/user");
        if (
          u.data.some(
            (r) =>
              r.restaurant_id === restaurant.restaurant_id &&
              r.reservation_date === d
          )
        ) {
          Alert.alert("Failure", "You already have a reservation at this restaurant.");
          setSubmitting(false);
          return;
        }
      }

      if (editMode) {
        await api.put(`/reservations/${existing.reservation_id}`, {
          reservation_date: d,
          reservation_time: t,
          people_count: peopleCount,
        });
      } else {
        await api.post("/reservations", {
          restaurant_id: restaurant.restaurant_id,
          reservation_date: d,
          reservation_time: t,
          people_count: peopleCount,
        });
        setAvailable((a) => (a != null ? a - 1 : null));
      }

      Alert.alert(
        "Successful",
        editMode ? "Reservation updated!" : "The reservation has been made!"
      );
    } catch (e) {
      if (e.response?.status === 409)
        Alert.alert("Successful", e.response.data.message);
      else
        Alert.alert("Error", e.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const dispDate = date.toLocaleDateString();
  const dispTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const confirmPeople = () => {
    const n = parseInt(tempCount, 10);
    if (!isNaN(n) && n >= 1 && n <= MAX) {
      setPeopleCount(n);
      setShowPeople(false);
    } else {
      Alert.alert("Wrong", `Enter a number from 1 to ${MAX}`);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="restaurant-outline"
            size={20}
            color="#444444"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.restaurantName}>
            {restaurant.restaurant_name}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color="#777777"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.restaurantLoc}>
            {restaurant.restaurant_location}
          </Text>
        </View>
        <Text style={styles.restaurantDesc}>
          {restaurant.restaurant_description}
        </Text>
      </View>

      <View style={styles.availCard}>
        {loadingAvail ? (
          <ActivityIndicator color="#444444" />
        ) : (
          <Text style={styles.availText}>
            {available != null
              ? `Available tables: ${available}`
              : "Availability unavailable"}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.field}
        onPress={() => setShowDatePicker(true)}
      >
      <Ionicons name="calendar-outline" size={20} color="#777777" />
      <Text style={styles.fieldLabel}>Date:</Text>
      <Text style={styles.fieldValue}>{dispDate}</Text>
      </TouchableOpacity>

      {showDatePicker && (
      <Modal transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose Date</Text>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                if (selectedDate) {
                  const sel = new Date(selectedDate);
                  sel.setHours(0, 0, 0, 0);
                  if (sel < minDate || sel > maxDate) {
                    Alert.alert(
                    "Invalid date",
                    `Choose a date between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`
                  );
                  return;
                }
                setDate(sel);
                } 
              }}
              minimumDate={minDate}
              maximumDate={maxDate}
              />
              <TouchableOpacity
                style={[styles.modalBtn, { marginTop: 12 }]}
                onPress={() => setShowDatePicker(false)}
              >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )}
    <TouchableOpacity
      style={styles.field}
      onPress={() => setShowTimePicker(true)}
>
      <Ionicons name="time-outline" size={20} color="#777777" />
      <Text style={styles.fieldLabel}>Time:</Text>
      <Text style={styles.fieldValue}>{dispTime}</Text>
    </TouchableOpacity>

    {showTimePicker && (
      <Modal transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose Time</Text>
            <DateTimePicker
              value={time}
            mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              is24Hour
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const sel = new Date(selectedTime);
                  const h = sel.getHours();
                  const m = sel.getMinutes();
                  if (h < 14 || h > 22 || (h === 22 && m > 0)) {
                    Alert.alert("Invalid time", "Select a time between 14:00 and 22:00");
                    return;
                  }
                  setTime(sel);
                }
              }}
            />
            <TouchableOpacity
              style={[styles.modalBtn, { marginTop: 12 }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      )}

      <TouchableOpacity
        style={styles.field}
        onPress={() => setShowPeople(true)}
      >
        <Ionicons name="people-outline" size={20} color="#777777" />
        <Text style={styles.fieldLabel}>People:</Text>
        <Text style={styles.fieldValue}>{peopleCount}</Text>
      </TouchableOpacity>
      <Modal transparent visible={showPeople} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose People</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={tempCount}
              onChangeText={setTempCount}
              maxLength={2}
              placeholder="1...10"
              placeholderTextColor="#AAA"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowPeople(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={confirmPeople}>
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[
          styles.submitBtn,
          (submitting || (available === 0 && !editMode)) && styles.disabledBtn,
        ]}
        onPress={submit}
        disabled={submitting || (available === 0 && !editMode)}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>
            {editMode ? "Save" : "Reservation"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F2F2F2", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#D00", fontSize: 16 },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  restaurantName: { fontSize: 20, fontWeight: "600", color: "#333333" },
  restaurantLoc: { fontSize: 14, color: "#777777" },
  restaurantDesc: { fontSize: 14, color: "#555555", marginTop: 8 },

  availCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  availText: { color: "#555555", fontSize: 14 },

  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerWrapper: { marginBottom: 12 },
  fieldLabel: { marginLeft: 8, fontSize: 16, color: "#333333" },
  fieldValue: {
    marginLeft: "auto",
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 16, color: "#333333" },

  submitBtn: {
    backgroundColor: "#28A745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  disabledBtn: { backgroundColor: "#BBBBBB" },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});