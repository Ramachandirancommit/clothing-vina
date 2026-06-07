import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

interface Props {
  goBack?: () => void;
}

export default function PushSettings({ goBack }: Props) {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
            <Text style={styles.settingDesc}>Receive push notifications</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#767577", true: "#e53935" }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingTitle: { fontSize: 16, fontWeight: "500", color: "#333" },
  settingDesc: { fontSize: 12, color: "#999", marginTop: 2 },
});
