import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AboutUsScreen from "./about-us";
import HelpCenterScreen from "./help-center";
import PrivacyPolicyScreen from "./privacy-policy";
import ProfileInfo from "./profile-info";
import SettingsContent from "./settingsContent";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ScreenType =
  | "menu"
  | "profile-info"
  | "help-center"
  | "about-us"
  | "privacy-policy"; // ✅ NEW

export default function SettingsModal({ visible, onClose }: Props) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("menu");

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen as ScreenType);
  };

  const goBack = () => {
    setCurrentScreen("menu");
  };

  const getTitle = () => {
    switch (currentScreen) {
      case "menu":
        return "Settings";
      case "profile-info":
        return "Profile Information";
      case "help-center":
        return "Help Center";
      case "about-us":
        return "About Us";
      case "privacy-policy": // ✅ NEW
        return "Privacy Policy";
      default:
        return "Settings";
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return <SettingsContent navigateTo={navigateTo} onClose={onClose} />;
      case "profile-info":
        return <ProfileInfo goBack={goBack} />;
      case "help-center":
        return <HelpCenterScreen goBack={goBack} />;
      case "about-us":
        return <AboutUsScreen goBack={goBack} />;
      case "privacy-policy": // ✅ NEW
        return <PrivacyPolicyScreen goBack={goBack} />;
      default:
        return <SettingsContent navigateTo={navigateTo} onClose={onClose} />;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            {currentScreen !== "menu" ? (
              <TouchableOpacity onPress={goBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
            ) : (
              <View style={styles.backButtonPlaceholder} />
            )}
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>{renderScreen()}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "100%",
    minHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  closeButton: {
    padding: 8,
    width: 40,
    alignItems: "flex-end",
  },
  modalContent: {
    flex: 1,
  },
});
