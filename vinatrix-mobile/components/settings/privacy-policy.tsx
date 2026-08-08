import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../app/context/ThemeContext";

interface Props {
  goBack?: () => void;
}

export default function PrivacyPolicyScreen({ goBack }: Props) {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Header with Back Button */}
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Feather
            name="arrow-left"
            size={24}
            color={isDark ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>
          Privacy Policy
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.title, isDark && styles.darkText]}>
            Privacy Policy
          </Text>
          <Text style={[styles.lastUpdated, isDark && styles.darkSubtitle]}>
            Last Updated: August 2026
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            We collect information you provide directly, such as your name,
            email address, phone number, and shipping address when you create an
            account, make a purchase, or contact us for support. We also collect
            device information, IP address, and browsing activity to improve
            your shopping experience.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            • Process and fulfill your orders, including delivery and payment
            {"\n"}• Communicate with you about your orders, account, and
            promotions{"\n"}• Improve our products, services, and user
            experience{"\n"}• Personalize your shopping experience and recommend
            products{"\n"}• Prevent fraud and ensure the security of our
            platform
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            3. Data Storage and Security
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            Your data is stored securely on our servers. We implement
            industry-standard security measures including encryption, firewalls,
            and secure server infrastructure. Your payment information is
            processed through secure payment gateways and is not stored on our
            servers.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            4. Sharing Your Information
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            We do not sell your personal information. We may share your data
            with:
            {"\n"}• Delivery partners to fulfill your orders
            {"\n"}• Payment processors to complete transactions
            {"\n"}• Service providers who assist with our operations (e.g.,
            hosting, analytics)
            {"\n"}All third-party partners are bound by strict confidentiality
            agreements.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            5. Your Rights
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            You have the right to:
            {"\n"}• Access, update, or delete your personal information
            {"\n"}• Opt out of marketing communications
            {"\n"}• Request a copy of your data
            {"\n"}• Withdraw consent at any time
            {"\n"}Contact us at support@yourcompany.com to exercise these
            rights.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            6. Cookies and Tracking
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            We use cookies and similar technologies to enhance your browsing
            experience, analyze site traffic, and personalize content. You can
            manage cookie preferences through your browser settings.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            7. Childrens Privacy
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            Our services are not intended for children under 13 years of age. We
            do not knowingly collect personal information from children. If you
            believe a child has provided us with personal information, please
            contact us immediately.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            8. Changes to This Policy
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the new policy on this page.
            We encourage you to review this policy periodically for any updates.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            9. Contact Us
          </Text>
          <Text style={[styles.bodyText, isDark && styles.darkBodyText]}>
            If you have any questions, concerns, or requests regarding this
            Privacy Policy, please contact us:
            {"\n\n"}📧 Email: support@yourcompany.com
            {"\n"}📍 Address: Your Business Address, Singapore
            {"\n"}📞 Phone: +65 XXXX XXXX
          </Text>

          <View style={[styles.divider, isDark && styles.darkDivider]} />
          <Text style={[styles.footerText, isDark && styles.darkSubtitle]}>
            By using our app, you agree to the terms of this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkHeader: {
    backgroundColor: "#2a2a2a",
    borderBottomColor: "#3a3a3a",
  },

  backButton: {
    padding: 8,
    width: 40,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#2a2a2a",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  darkText: {
    color: "#fff",
  },

  lastUpdated: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  darkSubtitle: {
    color: "#777",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },

  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
  },
  darkBodyText: {
    color: "#ccc",
  },

  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
  darkDivider: {
    backgroundColor: "#444",
  },

  footerText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
