import { Platform } from 'react-native';
import { colors } from '../theme';

// Estilo común de la barra de pestañas (cliente y vendedor).
// En Android/iOS se deja la altura por defecto para que React Navigation
// sume el área segura inferior (gestos, barra de inicio del iPhone).
export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textLight,
  tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    ...(Platform.OS === 'web' ? { height: 60, paddingTop: 4, paddingBottom: 6 } : null),
  },
  tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.white, fontSize: 10 },
};
