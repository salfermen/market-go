import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ticket } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import { formatDate } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// Cupón con borde punteado (diseño "ticket" del prototipo).
export default function VoucherCard({ voucher, actionLabel, onAction, actionDisabled = false, highlight = false, expiringSoon = false, testID }) {
  return (
    <View style={[styles.card, highlight && styles.highlight]} testID={testID}>
      <View style={styles.header}>
        <CustomText variant="smallBold" color="primary">
          Cupón
        </CustomText>
        <CustomText variant="caption" style={{ color: expiringSoon ? colors.error : colors.textMuted }} weight={expiringSoon ? '700' : '500'}>
          {expiringSoon ? 'Vence pronto · ' : 'Válido hasta '}
          {formatDate(voucher.expires)}
        </CustomText>
      </View>
      <View style={styles.dash} />
      <View style={styles.body}>
        <View style={styles.icon}>
          <Ticket size={18} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <CustomText variant="bodyBold">{voucher.title}</CustomText>
          <CustomText variant="caption" color="textMuted">
            {voucher.description}
          </CustomText>
          <CustomText variant="caption" color="primary" weight="700" style={styles.code}>
            {voucher.code}
          </CustomText>
        </View>
        {actionLabel ? (
          actionDisabled ? (
            <SecondaryButton title={actionLabel} size="sm" disabled variant="ghost" />
          ) : (
            <PrimaryButton title={actionLabel} onPress={onAction} size="sm" testID={testID ? `${testID}-action` : undefined} />
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    marginBottom: 12,
    overflow: 'hidden',
  },
  highlight: {
    backgroundColor: colors.primarySoft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dash: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primaryLight,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  code: {
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
