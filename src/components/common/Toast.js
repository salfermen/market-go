import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CircleAlert, CircleCheck } from 'lucide-react-native';
import CustomText from './CustomText';
import { colors, radius } from '../../theme';

// Aviso breve en la parte inferior. Se controla con el hook useToast().
export default function Toast({ visible, message, type = 'success', bottom = 24 }) {
  if (!visible) return null;
  const Icon = type === 'error' ? CircleAlert : CircleCheck;
  return (
    <View style={[styles.toast, { bottom }]} pointerEvents="none" accessibilityLiveRegion="polite">
      <Icon size={18} color={type === 'error' ? '#FDA4AF' : '#86EFAC'} />
      <CustomText variant="smallBold" color="white" style={styles.text}>
        {message}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    boxShadow: '0px 8px 20px rgba(11, 27, 67, 0.25)',
    zIndex: 100,
  },
  text: {
    flex: 1,
  },
});
