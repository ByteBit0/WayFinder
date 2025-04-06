#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials
#define WIFI_SSID "Galaxy"
#define WIFI_PASSWORD "12341234"

// Firebase Configuration
#define API_KEY "AIzaSyDXNwhlxFszKU57mOzbWi_uc8mhy_BNZpU"
#define DATABASE_URL "https://publictransportsystem-dd918-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Firebase Objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// GPS Module Setup (UART2 on ESP32)
#define RXPin 16  // ESP32 RX (Connect to GPS TX)
#define TXPin 17  // ESP32 TX (Connect to GPS RX)
#define GPSBaud 9600

TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Using UART2

// Variables for Firebase updates
float prevLatitude = 0.0, prevLongitude = 0.0;
unsigned long lastSentTime = 0;  // Timer for data retrieval
bool wifiConnected = false;

// Function to Connect WiFi
void connectWiFi() {
    Serial.print("🔄 Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < 10000) {  // 10 sec timeout
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ Connected to WiFi!");
        wifiConnected = true;
    } else {
        Serial.println("\n❌ WiFi Connection Failed!");
        wifiConnected = false;
    }
}

// Firebase Initialization
void initFirebase() {
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    // Enable Anonymous Authentication (fixes missing credentials error)
    auth.user.email = "arav7373@gmail.com";
    auth.user.password = "12341234";

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    Serial.println("✅ Firebase initialized!");
}

void setup() {
    Serial.begin(115200);
    gpsSerial.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);  // Two-way GPS communication
    Serial.println("🚀 GPS Module is initializing...");

    connectWiFi();
    initFirebase();
}

void loop() {
    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
    }

    // Check if it's time to send data (every 5 seconds)
    if (millis() - lastSentTime >= 5000) {
        lastSentTime = millis();

        if (gps.location.isValid()) {
            float latitude = gps.location.lat();
            float longitude = gps.location.lng();
            Serial.printf("📍 Latitude: %.6f, Longitude: %.6f\n", latitude, longitude);

            // Send data to Firebase only if the location changes
            if (latitude != prevLatitude || longitude != prevLongitude) {
                prevLatitude = latitude;
                prevLongitude = longitude;

                String path = "/buses/bus_101";  // Update bus ID as needed
                FirebaseJson json;
                json.set("latitude", latitude);
                json.set("longitude", longitude);
                json.set("timestamp", millis());

                if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
                    Serial.println("✅ Data sent to Firebase!");
                } else {
                    Serial.print("❌ Firebase Error: ");
                    Serial.println(fbdo.errorReason());
                }
            } else {
                Serial.println("ℹ️ Location unchanged, skipping Firebase upload.");
            }
        } else {
            Serial.println("⚠️ Waiting for valid GPS data...");
        }
    }

    // Reconnect WiFi in the background if disconnected
    if (WiFi.status() != WL_CONNECTED) {
        if (wifiConnected) {
            Serial.println("⚠️ WiFi lost! Reconnecting...");
            wifiConnected = false;
        }
        connectWiFi();
    }
}