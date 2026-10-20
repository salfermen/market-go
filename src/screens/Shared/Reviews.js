import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PenLine, Star } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CustomModal from '../../components/common/CustomModal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RatingStars from '../../components/specific/RatingStars';
import ReviewCard from '../../components/specific/ReviewCard';
import useAsync from '../../hooks/useAsync';
import useForm from '../../hooks/useForm';
import { addReview, getProductById, getReviews } from '../../api/products.api';
import { useAuth } from '../../store/authStore';
import { useShop } from '../../store/shopStore';
import { validateReview } from '../../utils/validations';
import { plural } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-28 Reseñas y calificaciones de un producto
export default function Reviews({ route }) {
  const { productId, orderId } = route.params;
  const { user, isSeller } = useAuth();
  const { setOrderReviewed } = useShop();
  const [writing, setWriting] = useState(!!orderId);
  const [saving, setSaving] = useState(false);
  const [thanks, setThanks] = useState(false);
  const form = useForm({ rating: 0, comment: '' }, validateReview);
  const { data, loading, reload } = useAsync(() => Promise.all([getProductById(productId), getReviews(productId)]), [productId]);

  if (!data) {
    return loading ? (
      <LoadingSpinner fullScreen />
    ) : (
      <ScreenWrapper header={<CustomHeader title="Reseñas" />}>
        <EmptyState icon={Star} title="No pudimos cargar las reseñas" actionText="Reintentar" onAction={reload} />
      </ScreenWrapper>
    );
  }
  const [product, reviews] = data;

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const max = Math.max(...distribution.map((d) => d.count), 1);

  const submit = form.handleSubmit(async (values) => {
    setSaving(true);
    await addReview(productId, { ...values, author: user.name });
    if (orderId) await setOrderReviewed(orderId);
    setSaving(false);
    setWriting(false);
    form.reset();
    setThanks(true);
    reload();
  });

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} header={<CustomHeader title="Reseñas" subtitle={product.name} />}>
      {/* Resumen */}
      <View style={styles.summary}>
        <View style={styles.average}>
          <CustomText variant="hero">{average.toFixed(1)}</CustomText>
          <RatingStars value={average} size={16} />
          <CustomText variant="caption" color="textMuted">
            {plural(reviews.length, 'reseña')}
          </CustomText>
        </View>
        <View style={styles.flex}>
          {distribution.map((d) => (
            <View key={d.n} style={styles.distRow}>
              <CustomText variant="caption" weight="700" style={styles.distLabel}>
                {d.n}
              </CustomText>
              <View style={styles.distTrack}>
                <View style={[styles.distFill, { width: `${(d.count / max) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Escribir reseña */}
      {!isSeller ? (
        writing ? (
          <View style={styles.form}>
            <CustomText variant="h3">Tu reseña</CustomText>
            <RatingStars value={form.values.rating} onChange={(n) => form.setField('rating', n)} size={32} style={styles.stars} />
            {form.errors.rating ? (
              <CustomText variant="caption" color="error">
                {form.errors.rating}
              </CustomText>
            ) : null}
            <InputField placeholder="Cuéntanos qué te pareció el producto" multiline testID="reviews-comment" {...form.getFieldProps('comment')} />
            <View style={styles.formActions}>
              <SecondaryButton title="Cancelar" variant="ghost" onPress={() => setWriting(false)} style={styles.flex} />
              <PrimaryButton title="Publicar" onPress={submit} loading={saving} style={styles.flex} testID="reviews-submit" />
            </View>
          </View>
        ) : (
          <SecondaryButton title="Escribir una reseña" icon={PenLine} onPress={() => setWriting(true)} style={styles.writeButton} testID="reviews-write" />
        )
      ) : null}

      {reviews.length === 0 ? <EmptyState icon={Star} title="Sin reseñas todavía" message="¡Sé la primera persona en opinar!" /> : null}
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      <CustomModal visible={thanks} variant="success" title="¡Listo!" message="Gracias por tu reseña." primaryText="Cerrar" onClose={() => setThanks(false)}>
        <RatingStars value={5} size={26} style={styles.thanksStars} />
      </CustomModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: 14,
  },
  average: { alignItems: 'center', gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 3 },
  distLabel: { width: 12 },
  distTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  distFill: { height: '100%', backgroundColor: colors.star },
  form: {
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primarySoft,
    marginBottom: 16,
  },
  stars: { gap: 8, marginVertical: 12 },
  formActions: { flexDirection: 'row', gap: 10 },
  writeButton: { marginBottom: 16 },
  thanksStars: { justifyContent: 'center', gap: 4, marginTop: 4 },
});
