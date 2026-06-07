import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AboutUsScreen from "./about-us";
import Addresses from "./addresses";
import ChangePasswordScreen from "./change-password";
import HelpCenterScreen from "./help-center";
import ProfileInfo from "./profile-info";
// import PushSettings from "./push-settings"; // ❌ REMOVED - Now inline in settingsContent
import SettingsContent from "./settingsContent";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ScreenType =
  | "menu"
  // | "push-settings"  // ❌ REMOVED - No longer needed
  | "profile-info"
  | "change-password"
  | "addresses"
  | "help-center"
  | "about-us";

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
      // case "push-settings":  // ❌ REMOVED
      //   return "Push Notifications";
      case "profile-info":
        return "Profile Information";
      case "change-password":
        return "Change Password";
      case "addresses":
        return "Addresses";
      case "help-center":
        return "Help Center";
      case "about-us":
        return "About Us";
      default:
        return "Settings";
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return <SettingsContent navigateTo={navigateTo} onClose={onClose} />;
      // case "push-settings":  // ❌ REMOVED
      //   return <PushSettings goBack={goBack} />;
      case "profile-info":
        return <ProfileInfo goBack={goBack} />;
      case "change-password":
        return <ChangePasswordScreen goBack={goBack} />;
      case "addresses":
        return <Addresses goBack={goBack} />;
      case "help-center":
        return <HelpCenterScreen goBack={goBack} />;
      case "about-us":
        return <AboutUsScreen goBack={goBack} />;
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
      {/* TouchableOpacity to close modal when clicking outside */}
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Content container - stops propagation so clicks inside don't close modal */}
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
