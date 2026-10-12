import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet, ImageStyle, ViewStyle } from "react-native";
import { Colors, Radius } from "../theme";

type Props = {
  images: string[];
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  intervalMs?: number;
  rounded?: boolean;
};

/**
 * Animated exercise thumbnail — alternates between frames [0] and [1]
 * to create a GIF-like animation of the exercise (start ↔ end position).
 */
export function ExerciseThumb({ images, size = 72, style, imageStyle, intervalMs = 700, rounded = true }: Props) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!images || images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [images, intervalMs]);

  if (!images || images.length === 0) {
    return <View style={[styles.placeholder, { width: size, height: size, borderRadius: rounded ? Radius.md : 0 }, style]} />;
  }

  return (
    <View style={[{ width: size, height: size, borderRadius: rounded ? Radius.md : 0, overflow: "hidden", backgroundColor: "#F5F5F5" }, style]}>
      <Image
        source={{ uri: images[idx] }}
        style={[{ width: size, height: size }, imageStyle]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.surfaceTertiary,
  },
});
