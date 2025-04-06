import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from "expo-router";
import Animated, { FadeInUp, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const index = () => {
    const router = useRouter();
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withTiming(1.1, { duration: 1000 });
        setTimeout(() => {
            router.push("/(auth)/Welcome");
        }, 4000);
    }, []);


    return (
        <View style={design.container}>
            {/* Animated Logo */}
            <Animated.Image
                exiting={FadeInUp.duration(1000).delay(1700)}
                style={design.logo}
                resizeMode="center"
                source={require("../assets/images/bus.png")}
            />

            {/* Animated App Name */}
            <Animated.View>
            <Animated.Text
                exiting={FadeInUp.duration(1000).delay(1500)}
                style={[design.appName]}
            >
                WayFinder
                </Animated.Text>
                </Animated.View>
        </View>
    );
};

export default index;

const design = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#ffffff",
    },
    logo: {
        aspectRatio: 1.5,
        height: "auto",
    },
    appName: {
        marginTop: -47,
        fontSize: 45,
        fontWeight: "bold",
        color: "#000000", // Deep blue tone
        fontFamily: "Poppins-Bold", // Poppins font
        letterSpacing: 2,
        textShadowColor: "rgba(0, 0, 0, 0.3)", // Adds depth
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        marginLeft: 10,
    }
});
