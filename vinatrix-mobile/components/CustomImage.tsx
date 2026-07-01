import React, { useState } from "react";
import { Image, ImageProps, StyleSheet, Text, View } from "react-native";
import { FALLBACK_IMAGE, isValidImageUrl } from "../utils/imageUtils";

interface CustomImageProps extends ImageProps {
  source: { uri?: string };
  fallbackIcon?: boolean;
}

export const CustomImage: React.FC<CustomImageProps> = ({
  source,
  style,
  fallbackIcon = true,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const uri = source?.uri;
  const isValid = isValidImageUrl(uri);

  if (!isValid || hasError) {
    if (fallbackIcon) {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackText}>📷</Text>
          <Text style={styles.fallbackSmallText}>No Image</Text>
        </View>
      );
    }
    return <Image source={{ uri: FALLBACK_IMAGE }} style={style} {...props} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  fallbackText: {
    fontSize: 40,
  },
  fallbackSmallText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});

export default CustomImage;
