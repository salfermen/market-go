import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Crown, Gift } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CustomModal from '../../components/common/CustomModal';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { useAuth } from '../../store/authStore';
import { useShop } from '../../store/shopStore';
import { rewardBadges, rewardsCatalog } from '../../data/mockData';
import { getIcon } from '../../utils/icons';
import { formatNumber } from '../../utils/formatters';
import { colors, radius } from '../../theme';

const LEVELS = [
  { name: 'Bronce', min: 0 },
  { name: 'Plata', min: 1000 },
  { name: 'Oro', min: 2000 },
  { name: 'Diamante', min: 5000 },
];

// P-15 Recompensas del usuario (puntos, nivel, logros y canje)
export default function UserRewards({ navigation }) {
  const { user, changePoints } = useAuth();
  const { claimVoucher } = useShop();
  const { toast, showToast } = useToast();
  const [toRedeem, setToRedeem] = useState(null);

  const levelIndex = LEVELS.reduce((idx, level, i) => (user.points >= level.min ? i : idx), 0);
  const level = LEVELS[levelIndex];
  const next = LEVELS[levelIndex + 1];
  const progress = next ? (user.points - level.min) / (next.min - level.min) : 1;

  const redeem = () => {
    changePoints(-toRedeem.cost);
    claimVoucher(toRedeem.voucherId);
    showToast(`Canjeaste "${toRedeem.title}". Lo encuentras en Mis cupones.`);
    setToRedeem(null);
  };

  return (
    <ScreenWrapper scroll header={<CustomHeader title="Recompensas" />}>
      <SegmentedTabs
        options={[
          { key: 'vouchers', label: 'Cupones' },
          { key: 'progress', label: 'Progreso' },
        ]}
        value="progress"
        onChange={(key) => key === 'vouchers' && navigation.replace('Voucher')}
        style={styles.tabs}
      />

      {/* Puntos y nivel */}
      <View style={styles.pointsCard}>
        <View style={styles.levelRow}>
          <Crown size={18} color={colors.yellow} />
          <CustomText variant="smallBold" color="white">
            Nivel {level.name}
          </CustomText>
        </View>
        <CustomText variant="hero" color="white">
          {formatNumber(user.points)}
        </CustomText>
        <CustomText variant="small" color="white">
          puntos disponibles
        </CustomText>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
        </View>
        <CustomText variant="caption" color="white">
          {next ? `Te faltan ${formatNumber(next.min - user.points)} puntos para el nivel ${next.name}` : '¡Alcanzaste el nivel máximo!'}
        </CustomText>
      </View>

      {/* Logros */}
      <SectionHeader title="Logros" style={styles.section} />
      <View style={styles.badges}>
        {rewardBadges.map((badge) => {
          const Icon = getIcon(badge.icon);
          const done = badge.progress >= badge.goal;
          return (
            <View key={badge.id} style={[styles.badge, done && styles.badgeDone]}>
              <View style={[styles.badgeIcon, done && styles.badgeIconDone]}>
                <Icon size={22} color={done ? colors.white : colors.primary} />
              </View>
              <CustomText variant="smallBold" align="center">
                {badge.title}
              </CustomText>
              <CustomText variant="caption" color="textMuted" align="center">
                {badge.description}
              </CustomText>
              <View style={styles.badgeTrack}>
                <View style={[styles.badgeFill, { width: `${(badge.progress / badge.goal) * 100}%` }]} />
              </View>
              <CustomText variant="caption" color={done ? 'success' : 'textMuted'} weight="700">
                {done ? 'Completado' : `${badge.progress}/${badge.goal}`} · +{badge.points} pts
              </CustomText>
            </View>
          );
        })}
      </View>

      {/* Canje */}
      <SectionHeader title="Canjea tus puntos" style={styles.section} />
      {rewardsCatalog.map((reward) => {
        const enough = user.points >= reward.cost;
        return (
          <View key={reward.id} style={styles.reward}>
            <View style={styles.rewardIcon}>
              <Gift size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <CustomText variant="bodyBold">{reward.title}</CustomText>
              <CustomText variant="caption" color="textMuted">
                {formatNumber(reward.cost)} puntos
              </CustomText>
            </View>
            {enough ? (
              <PrimaryButton title="Canjear" size="sm" onPress={() => setToRedeem(reward)} testID={`redeem-${reward.id}`} />
            ) : (
              <SecondaryButton title="Faltan puntos" size="sm" variant="ghost" disabled />
            )}
          </View>
        );
      })}

      <CustomModal
        visible={!!toRedeem}
        variant="info"
        title="¿Canjear recompensa?"
        message={toRedeem ? `Usarás ${formatNumber(toRedeem.cost)} puntos para obtener "${toRedeem.title}".` : ''}
        primaryText="Canjear"
        onPrimary={redeem}
        secondaryText="Cancelar"
        onClose={() => setToRedeem(null)}
      />
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { marginBottom: 16 },
  pointsCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 20,
    gap: 2,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.yellow,
  },
  section: { marginTop: 24 },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  badge: {
    width: '48%',
    alignItems: 'center',
    gap: 4,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeDone: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primarySoft,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeIconDone: {
    backgroundColor: colors.primary,
  },
  badgeTrack: {
    alignSelf: 'stretch',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: 6,
    overflow: 'hidden',
  },
  badgeFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
