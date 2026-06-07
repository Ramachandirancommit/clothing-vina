import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  goBack?: () => void; // ✅ Add this line
}

export default function HelpCenterScreen({ goBack }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isBot: true },
  ]);

  const handleCall = () => {
    Linking.openURL("tel:9823432482");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/919823432482");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@clothingcompany.com");
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    setChatMessages([
      ...chatMessages,
      { id: Date.now(), text: message, isBot: false },
    ]);

    // Simulate bot response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Thank you for your message. Our support team will get back to you shortly.",
          isBot: true,
        },
      ]);
    }, 1000);

    setMessage("");
  };

  const faqs = [
    {
      q: "How to track my order?",
      a: "Go to Track Orders tab and enter your order number.",
    },
    {
      q: "What is your return policy?",
      a: "30-day return policy for unused items with original tags.",
    },
    {
      q: "How long does shipping take?",
      a: "3-5 business days for standard shipping.",
    },
    { q: "Do you offer COD?", a: "Yes, Cash on Delivery is available." },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack || (() => router.back())}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
              <Feather name="phone" size={32} color="#4caf50" />
              <Text style={styles.contactText}>Call</Text>
              <Text style={styles.contactNumber}>9823432482</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleWhatsApp}
            >
              <Feather name="message-circle" size={32} color="#25d366" />
              <Text style={styles.contactText}>WhatsApp</Text>
              <Text style={styles.contactNumber}>Chat with us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
              <Feather name="mail" size={32} color="#2196f3" />
              <Text style={styles.contactText}>Email</Text>
              <Text style={styles.contactNumber}>support@company.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>• {faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Live Chat */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Chat Support</Text>
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubble,
                    msg.isBot ? styles.botBubble : styles.userBubble,
                  ]}
                >
                  <Text style={msg.isBot ? styles.botText : styles.userText}>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Feather name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  content: { flex: 1, padding: 16 },
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
    marginBottom: 16,
  },
  contactOptions: { flexDirection: "row", justifyContent: "space-around" },
  contactCard: { alignItems: "center", gap: 8 },
  contactText: { fontSize: 14, color: "#666", marginTop: 4 },
  contactNumber: { fontSize: 12, color: "#999" },
  faqItem: { marginBottom: 16 },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  faqAnswer: { fontSize: 14, color: "#666", marginLeft: 12 },
  chatContainer: { height: 300 },
  chatMessages: { flex: 1, marginBottom: 12 },
  chatBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "80%",
  },
  botBubble: { backgroundColor: "#f5f5f5", alignSelf: "flex-start" },
  userBubble: { backgroundColor: "#e53935", alignSelf: "flex-end" },
  botText: { color: "#333" },
  userText: { color: "#fff" },
  chatInput: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#e53935",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
