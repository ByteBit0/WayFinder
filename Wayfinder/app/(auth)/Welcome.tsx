import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView, TapGestureHandler, State } from "react-native-gesture-handler";
import { colors } from "@/constants/Theme";
import { verticalScale } from "@/utils/Styling";
import { useRouter } from "expo-router";

const BusStopFinder = () => {
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getUserLocation = async () => {
        setLoading(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permission to access location was denied");
                return;
            }

            const userLocation = await Location.getCurrentPositionAsync({});
            setLocation(userLocation.coords);
            
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            console.error("Error getting location:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTap = async ({ nativeEvent }: any) => {
        if (nativeEvent.state === State.END) {
            await getUserLocation();
            if (location) {
                router.push({
                    pathname: "/GoogleMap",
                    params: {
                        lat: location.latitude,
                        lng: location.longitude,
                    },
                });
            }
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <TapGestureHandler onHandlerStateChange={handleTap}>
                <View style={styles.buttonContainer}>
                    <Text style={styles.buttonText}>
                        {loading ? "Locating..." : "Get My Location"}
                    </Text>
                </View>
            </TapGestureHandler>

            {location && (
                <View style={styles.infoContainer}>
                    <Text style={styles.text}>
                        Latitude: {location.latitude.toFixed(4)}
                    </Text>
                    <Text style={styles.text}>
                        Longitude: {location.longitude.toFixed(4)}
                    </Text>
                </View>
            )}
        </GestureHandlerRootView>
    );
};

export default BusStopFinder;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 20, 
        backgroundColor: "#f5f5f5" 
    },
    buttonContainer: { 
        alignSelf: "center", 
        backgroundColor: "#4285F4", 
        height: verticalScale(140), 
        width: verticalScale(340), 
        borderRadius: 70, 
        justifyContent: "center", 
        alignItems: "center", 
        marginBottom: 20, 
        elevation: 5, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 2 
    },
    buttonText: { 
        color: "white", 
        fontSize: 24, 
        fontWeight: "bold", 
        textAlign: "center" 
    },
    infoContainer: { 
        backgroundColor: "white", 
        padding: 15, 
        borderRadius: 10, 
        marginTop: 10, 
        width: "90%", 
        elevation: 3, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 2 
    },
    text: { 
        fontSize: 16, 
        color: "#333", 
        textAlign: "center",
        marginVertical: 4 
    }
});