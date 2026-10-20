import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MessageSquare, Pencil, Star } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import CustomText from '../../components/common/CustomText';
import CustomModal from '../../components/common/CustomModal';
import InputField from '../../components/common/InputField';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import StatCard from '../../components/specific/StatCard';
import ReviewCard from '../../components/specific/ReviewCard';
import useToast from '../../hooks/useToast';
import { useSeller } from '../../store/sellerStore';
import { colors } from '../../theme';

// P-22 Reseñas del vendedor (opiniones de clientes y respuestas)
export default function SellerReviews() {
  const seller = useSeller();
  const { toast, showToast } = useToast();
  const [replying, setReplying] = useState(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState(null);

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: seller.reviews.filter((r) => r.rating === stars).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const sendReply = async () => {
    if (reply.trim().length < 5) {
      setError('La respuesta debe tener al menos 5 caracteres');
      return;
    }
    await seller.replyToReview(replying.id, reply);
    setReplying(null);
    setReply('');
    showToast('Respuesta publicada');
  };

  return (
    <ScreenWrapper scroll background={colors.surface} edges={['top', 'bottom']} header={<SellerHeader section="Panel" title="Reseñas" showBack />} contentStyle={styles.content}>
      <CustomText variant="h2">Reseñas de clientes</CustomText>
      <CustomText variant="small" color="textMuted" style={styles.subtitle}>
        La opinión de tus clientes ayuda a mejorar tu tienda.
      </CustomText>

      <StatCard label="Valoración media" value={`${seller.averageRating.toFixed(1)} / 5`} change={0.3} changeLabel="este mes" icon={Star} tone={colors.warningLight} iconColor={colors.star} />
      <View style={styles.row}>
        <StatCard label="Total de reseñas" value={seller.reviews.length} icon={MessageSquare} style={styles.flex} compact />
        <StatCard
          label="Respondidas"
          value={`${Math.round(seller.answeredRate * 100)}%`}
          icon={Pencil}
          tone={colors.successLight}
          iconColor={colors.success}
          style={styles.flex}
          compact
        />
      </View>

      {/* Distribución de estrellas */}
      <View style={styles.card}>
        {distribution.map((d) => (
          <View key={d.stars} style={styles.distRow}>
            <CustomText variant="smallBold" style={styles.distLabel}>
              {d.stars} ★
            </CustomText>
            <View style={styles.distTrack}>
              <View style={[styles.distFill, { width: `${(d.count / maxCount) * 100}%` }]} />
            </View>
            <CustomText variant="caption" color="textMuted" style={styles.distCount}>
              {d.count}
            </CustomText>
          </View>
        ))}
      </View>

      {seller.reviews.length === 0 ? <EmptyState icon={Star} title="Aún no tienes reseñas" /> : null}
      {seller.reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showProduct onReply={setReplying} testID={`seller-review-${review.id}`} />
      ))}

      <CustomModal
        visible={!!replying}
        hideIcon
        align="left"
        title="Responder reseña"
        message={replying ? `"${replying.comment}" — ${replying.author}` : ''}
        primaryText="Publicar respuesta"
        onPrimary={sendReply}
        secondaryText="Cancelar"
        onClose={() => {
          setReplying(null);
          setError(null);
        }}
      >
        <InputField
          placeholder="Escribe una respuesta amable…"
          multiline
          value={reply}
          onChangeText={(t) => {
            setReply(t);
            setError(null);
          }}
          error={error}
          testID="reply-input"
        />
      </CustomModal>
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16, gap: 12 },
  subtitle: { marginTop: -6, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distLabel: { width: 34 },
  distTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' },
  distFill: { height: '100%', backgroundColor: colors.star, borderRadius: 4 },
  distCount: { width: 20, textAlign: 'right' },
});
