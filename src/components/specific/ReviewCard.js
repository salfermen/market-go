import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CornerDownRight } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import Avatar from '../common/Avatar';
import RatingStars from './RatingStars';
import { formatRelative } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// Reseña de un cliente. En el panel del vendedor muestra "Responder reseña".
export default function ReviewCard({ review, onReply, showProduct = false, style, testID }) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      <View style={styles.header}>
        <Avatar name={review.author} size={40} />
        <View style={styles.headerText}>
          <CustomText variant="bodyBold">{review.author}</CustomText>
          <CustomText variant="caption" color="textMuted">
            {formatRelative(review.date)}
            {showProduct && review.productName ? ` · ${review.productName}` : ''}
          </CustomText>
        </View>
        <RatingStars value={review.rating} size={13} />
      </View>

      <CustomText variant="small" color="text" style={styles.comment}>
        {review.comment}
      </CustomText>

      {review.reply ? (
        <View style={styles.reply}>
          <CornerDownRight size={14} color={colors.primary} />
          <View style={styles.replyText}>
            <CustomText variant="caption" color="primary" weight="700">
              Respuesta de la tienda
            </CustomText>
            <CustomText variant="small" color="textMuted">
              {review.reply}
            </CustomText>
          </View>
        </View>
      ) : onReply ? (
        <Pressable onPress={() => onReply(review)} hitSlop={6} accessibilityRole="button" testID={testID ? `${testID}-reply` : undefined}>
          <CustomText variant="smallBold" color="primary" style={styles.replyLink}>
            Responder reseña
          </CustomText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  comment: {
    marginTop: 10,
    lineHeight: 20,
  },
  reply: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  replyText: {
    flex: 1,
  },
  replyLink: {
    marginTop: 10,
  },
});
