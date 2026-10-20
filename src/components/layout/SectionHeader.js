import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import { colors } from '../../theme';

// Título de sección con acción "Ver todo →" (como en el prototipo de Figma).
export default function SectionHeader({ title, actionText = 'Ver todo', onAction, right, style, testID }) {
  return (
    <View style={[styles.row, style]}>
      <CustomText variant="h3" style={styles.title} accessibilityRole="header">
        {title}
      </CustomText>
      {right}
      {onAction ? (
        <Pressable onPress={onAction} style={styles.action} hitSlop={8} accessibilityRole="button" testID={testID}>
          <CustomText variant="smallBold" color="ink">
            {actionText}
          </CustomText>
          <View style={styles.arrow}>
            <ArrowRight size={14} color={colors.white} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
