// Shared UI components for Aptivafit onboarding flow
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Fonts } from '../theme';

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.max(0, Math.min(1, step / total));
  return (
    <View style={styles.progressWrap} testID="onboarding-progress-bar">
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{step}/{total}</Text>
    </View>
  );
}

export function OnboardingHeader({
  step,
  total,
  onBack,
  onSkip,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  const router = useRouter();
  const back = onBack || (() => router.back());
  return (
    <View style={styles.header}>
      <Pressable onPress={back} hitSlop={12} style={styles.iconBtn} testID="onboarding-back-btn">
        <Ionicons name="chevron-back" size={26} color={Colors.onSurface} />
      </Pressable>
      <ProgressBar step={step} total={total} />
      {onSkip ? (
        <Pressable onPress={onSkip} hitSlop={12} testID="onboarding-skip-btn">
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

export function OptionCard({
  label,
  desc,
  icon,
  selected,
  onPress,
  testID,
}: {
  label: string;
  desc?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      testID={testID}
    >
      {icon ? <View style={styles.optionIcon}>{icon}</View> : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
        {desc ? <Text style={styles.optionDesc}>{desc}</Text> : null}
      </View>
      {selected ? (
        <View style={styles.checkMark}>
          <Ionicons name="checkmark" size={16} color={Colors.onBrand} />
        </View>
      ) : (
        <View style={styles.checkEmpty} />
      )}
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  testID,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled, style]}
      testID={testID}
    >
      <Text style={[styles.primaryBtnText, disabled && styles.primaryBtnTextDisabled]}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  testID,
  style,
}: {
  title: string;
  onPress: () => void;
  testID?: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.secondaryBtn, style]} testID={testID}>
      <Text style={styles.secondaryBtnText}>{title}</Text>
    </Pressable>
  );
}

export function StickyFooter({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.stickyFooter,
        {
          paddingBottom: Math.max(Spacing.lg, insets.bottom + Spacing.sm),
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceTertiary,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand,
    borderRadius: Radius.pill,
  },
  progressText: {
    color: Colors.onSurfaceTertiary,
    fontSize: 12,
    fontFamily: Fonts.semibold,
    minWidth: 34,
    textAlign: 'right',
  },
  skipText: {
    color: Colors.onSurfaceSecondary,
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  title: {
    color: Colors.onSurface,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Fonts.extrabold,
    letterSpacing: -0.5,
    marginTop: Spacing.md,
  },
  subtitle: {
    color: Colors.onSurfaceSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.regular,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  optionCardSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandTint,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    color: Colors.onSurface,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  optionLabelSelected: {
    color: Colors.brand,
  },
  optionDesc: {
    color: Colors.onSurfaceTertiary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  primaryBtn: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: Colors.surfaceTertiary,
    opacity: 0.7,
  },
  primaryBtnText: {
    color: Colors.onBrand,
    fontFamily: Fonts.extrabold,
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  primaryBtnTextDisabled: {
    color: Colors.onSurfaceTertiary,
  },
  secondaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: Colors.onSurfaceSecondary,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  stickyFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
});
