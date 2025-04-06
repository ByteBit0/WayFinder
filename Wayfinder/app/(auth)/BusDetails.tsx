import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp } from "firebase/app";

// Firebase config 
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Haversine formula
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function LiveBusMap() {
  const [busLocation, setBusLocation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const speakCountRef = useRef(0); // ✅ Track speaks outside render

  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    };

    getUserLocation();

    const busRef = ref(db, "buses/bus_101");
    const unsubscribe = onValue(busRef, (snapshot) => {
      if (snapshot.exists()) {
        const busCoords = snapshot.val();
        setBusLocation(busCoords);

        if (userLocation) {
          const d = getDistanceFromLatLonInKm(
            userLocation.latitude,
            userLocation.longitude,
            busCoords.latitude,
            busCoords.longitude
          );
          setDistance(d);

          if (speakCountRef.current < 2) {
            const speechText = `Bus number 101 is ${d.toFixed(2)} kilometers away from you.`;
            Speech.speak(speechText);
            speakCountRef.current += 1;
          }
        }
      } else {
        setBusLocation(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userLocation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
          {busLocation && (
            <Marker
              coordinate={{
                latitude: busLocation.latitude,
                longitude: busLocation.longitude,
              }}
              title="Bus Location"
              pinColor="red"
            />
          )}
        </MapView>
      )}

      <View style={styles.infoContainer}>
        {!busLocation ? (
          <Text style={styles.errorText}>Bus location not available.</Text>
        ) : (
          <Text style={styles.distanceText}>
           🚌 Distance to Bus 101: {distance?.toFixed(2)} km
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    height: "40%",
    width: "100%",
  },
  infoContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
