import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { fetchNearbyBusStands } from "../Services/GlobalAPi";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import { Linking, Platform } from "react-native";
import { BusStand } from "../types";

export default function BusStandFinder() {
const router = useRouter();
const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
const [loading, setLoading] = useState(true);
const [busStands, setBusStands] = useState<BusStand[]>([]);

useEffect(() => {
    const getLocationAndBusStands = async () => {
        setLoading(true);
        Speech.speak("Getting your current location", { language: 'en' });
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Speech.speak("Location permission denied", { language: 'en' });
            setLoading(false);
            return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        const currentLocation = {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
        };
        setLocation(currentLocation);

        const stands = await fetchNearbyBusStands(
            currentLocation.latitude,
            currentLocation.longitude
        );
        
        const standsWithDistance = stands.map(stand => ({
            ...stand,
            vicinity: stand.vicinity || "Address not available",
            distance: calculateDistance(currentLocation, stand) + ' meters away'
        }));
        
        const sortedStands = standsWithDistance.sort((a, b) => 
            parseFloat(a.distance) - parseFloat(b.distance)
        );
        
        setBusStands(sortedStands);
        setLoading(false);
        Speech.speak(`Found ${sortedStands.length} bus stands. Swipe up or down to browse.`, { 
            language: 'en',
            rate: 0.9
        });
    };

    getLocationAndBusStands();
}, []);

const calculateDistance = (origin: {latitude: number, longitude: number}, stand: BusStand) => {
    const R = 6371e3;
    const φ1 = origin.latitude * Math.PI/180;
    const φ2 = stand.latitude * Math.PI/180;
    const Δφ = (stand.latitude-origin.latitude) * Math.PI/180;
    const Δλ = (stand.longitude-origin.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
};

const openMaps = (stand: BusStand) => {
    if (!location) return;
    
    Speech.stop();
    Speech.speak(`Opening directions to ${stand.name}`, { 
        language: 'en',
        rate: 0.9
    });
    
    const url = Platform.select({
        ios: `maps://app?saddr=${location.latitude},${location.longitude}&daddr=${stand.latitude},${stand.longitude}&directionsmode=walking`,
        android: `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${stand.latitude},${stand.longitude}&travelmode=walking`,
    });

    if (url) {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                const browserUrl = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${stand.latitude},${stand.longitude}&travelmode=walking`;
                Linking.openURL(browserUrl);
            }
        });
    }
};

const showBusDetails = (stand: BusStand) => {
    Speech.speak(`Showing details for ${stand.name}`, { 
        language: 'en',
        rate: 0.9
    });
    router.push({
        pathname: "/(auth)/BusDetails",
        params: {
            id: stand.id,
            name: stand.name,
            latitude: stand.latitude.toString(),
            longitude: stand.longitude.toString(),
            vicinity: stand.vicinity,
            distance: stand.distance
        }
    });
};

const handleItemPress = (stand: BusStand) => {
    Speech.speak(`${stand.name}. ${stand.distance}. Press left for directions, Press right for details.`, {
        language: 'en',
        rate: 0.9
    });
};

return (
    <SafeAreaView style={styles.container}>
        {loading || !location ? (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="blue" />
                <Text accessibilityLabel="Loading bus stands">Loading nearby bus stands...</Text>
            </View>
        ) : (
            <View style={styles.listContainer}>
                <Text 
                    style={styles.listHeader}
                    accessibilityRole="header"
                >
                    Nearby Bus Stands ({busStands.length})
                </Text>
                
                <FlatList
                    data={busStands}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.listItemContainer}>
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() => handleItemPress(item)}
                                accessibilityLabel={`${item.name}, ${item.distance}`}
                                accessibilityHint="Press left for directions, Press right for details"
                                accessible={true}
                            >
                                <View style={styles.standInfo}>
                                    <Text style={styles.standName}>{item.name}</Text>
                                    <Text style={styles.standAddress}>{item.vicinity}</Text>
                                    <Text style={styles.standDistance}>{item.distance}</Text>
                                </View>
                            </TouchableOpacity>
                            
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.directionsButton]}
                                    onPress={() => openMaps(item)}
                                    accessibilityLabel={`Get directions to ${item.name}`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.buttonText}>Directions</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.detailsButton]}
                                    onPress={() => showBusDetails(item)}
                                    accessibilityLabel={`View details for ${item.name}`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.buttonText}>Details</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        )}
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#fff',
},
loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
},
listContainer: {
    flex: 1,
    padding: 15,
},
listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
},
listItemContainer: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
},
listItem: {
    padding: 15,
},
standInfo: {
    flex: 1,
},
standName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
},
standAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
},
standDistance: {
    fontSize: 14,
    color: '#4285F4',
    marginTop: 4,
    fontWeight: 'bold',
},
actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
},
actionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
},
directionsButton: {
    backgroundColor: '#34A853',
},
detailsButton: {
    backgroundColor: '#4285F4',
},
buttonText: {
    color: 'white',
    fontWeight: 'bold',
},
});