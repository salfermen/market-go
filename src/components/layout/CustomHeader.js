import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import { colors, SCREEN_PADDING } from '../../theme';

// Barra superior propia (se oculta el header por defecto de React Navigation
// para que se vea igual en Android, iOS y web).
// breadcrumb: texto pequeño sobre el título, p. ej. "Mi tienda / Panel"
export default function CustomHeader({ title, subtitle, breadcrumb, showBack = true, onBack, right, style }) {
  const navigation = useNavigation();
  const canGoBack = showBack && (onBack || navigation.canGoBack());

  return (
    <View style={[styles.container, style]}>
      {canGoBack ? (
        <Pressable
          testID="header-back"
          onPress={onBack ?? navigation.goBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.primaryLight }]}
        >
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
      ) : null}

      <View style={styles.titles}>
        {breadcrumb ? (
          <CustomText variant="caption" color="textMuted">
            {breadcrumb}
          </CustomText>
        ) : null}
        <CustomText variant="h2" numberOfLines={1} accessibilityRole="header">
          {title}
        </CustomText>
        {subtitle ? (
          <CustomText variant="small" color="textMuted" numberOfLines={1}>
            {subtitle}
          </CustomText>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
