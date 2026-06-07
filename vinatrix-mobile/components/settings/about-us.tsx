import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  goBack?: () => void;
}

export default function AboutUsScreen({ goBack }: Props) {
  const router = useRouter();

  const openWebsite = () => {
    Linking.openURL("https://www.clothingcompany.com");
  };

  const openInstagram = () => {
    Linking.openURL("https://instagram.com/clothingcompany");
  };

  const openFacebook = () => {
    Linking.openURL("https://facebook.com/clothingcompany");
  };

  const openTwitter = () => {
    Linking.openURL("https://twitter.com/clothingcompany");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ❌ HEADER REMOVED FROM HERE */}

      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Feather name="shopping-bag" size={60} color="#e53935" />
          </View>
          <Text style={styles.appName}>Clothing Company</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.description}>
            Clothing Company was founded in 2024 with a mission to provide
            high-quality, fashionable clothing at affordable prices. We believe
            that everyone deserves to look and feel their best without breaking
            the bank.
          </Text>
          <Text style={styles.description}>
            Our curated collection features the latest trends from around the
            world, carefully selected to suit the Indian fashion sensibilities.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            To revolutionize the online shopping experience by offering premium
            quality products, seamless delivery, and exceptional customer
            service that exceeds expectations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton} onPress={openWebsite}>
              <Feather name="globe" size={24} color="#666" />
              <Text style={styles.socialText}>Website</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={openInstagram}
            >
              <Feather name="instagram" size={24} color="#666" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={openFacebook}
            >
              <Feather name="facebook" size={24} color="#666" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={openTwitter}>
              <Feather name="twitter" size={24} color="#666" />
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <Feather name="mail" size={20} color="#666" />
            <Text style={styles.contactText}> support@clothingcompany.com</Text>
          </View>
          <View style={styles.contactInfo}>
            <Feather name="phone" size={20} color="#666" />
            <Text style={styles.contactText}> +91 98234 32482</Text>
          </View>
          <View style={styles.contactInfo}>
            <Feather name="map-pin" size={20} color="#666" />
            <Text style={styles.contactText}> Mumbai, India</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Clothing Company</Text>
          <Text style={styles.footerText}>All Rights Reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  // ❌ REMOVED header, backButton, headerTitle styles
  content: { flex: 1, padding: 16 },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffebee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: { fontSize: 24, fontWeight: "bold", color: "#333" },
  version: { fontSize: 14, color: "#999", marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  socialButton: { alignItems: "center", gap: 8 },
  socialText: { fontSize: 12, color: "#666" },
  contactInfo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  contactText: { fontSize: 14, color: "#666" },
  footer: { alignItems: "center", padding: 20 },
  footerText: { fontSize: 12, color: "#999", marginBottom: 4 },
});
