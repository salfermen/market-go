import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Bot, Send, Star } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import CustomText from '../../components/common/CustomText';
import CustomModal from '../../components/common/CustomModal';
import InputField from '../../components/common/InputField';
import RatingStars from '../../components/specific/RatingStars';
import { useAuth } from '../../store/authStore';
import { supportAnswers, supportTopics } from '../../data/mockData';
import { colors, radius } from '../../theme';

let nextId = 1;
const message = (from, text, extra = {}) => ({ id: String(nextId++), from, text, ...extra });

// P-29 Soporte y chat (asistente simulado)
// En la siguiente etapa los mensajes se enviarán al backend (WebSocket o endpoint REST).
export default function ChatSupport() {
  const { user, isSeller } = useAuth();
  const listRef = useRef(null);
  const timers = useRef([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [rating, setRating] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);
  const [messages, setMessages] = useState(() => [
    message('bot', `¡Hola, ${user.name.split(' ')[0]}! Soy el asistente de MarketGO${isSeller ? ' para vendedores' : ''}. ¿En qué te puedo ayudar?`, {
      options: supportTopics,
    }),
  ]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const botReply = (reply, extra) => {
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, message('bot', reply, extra)]);
    }, 900);
    timers.current.push(t);
  };

  const send = (value) => {
    const clean = value.trim();
    if (!clean) return;
    setMessages((prev) => [...prev.map((m) => ({ ...m, options: undefined })), message('user', clean)]);
    setText('');
    if (supportAnswers[clean]) {
      botReply(supportAnswers[clean], { options: ['Sí, gracias', 'Hablar con un asesor'] });
    } else if (clean === 'Sí, gracias') {
      botReply('¡Me alegra ayudarte! ¿Nos calificas?', { rate: true });
    } else if (clean === 'Hablar con un asesor') {
      botReply('Te estoy conectando con Maggy, de servicio al cliente. Tiempo estimado: 3 minutos (simulado).', { rate: true });
    } else {
      botReply('Gracias por escribirnos. Un asesor revisará tu mensaje y te responderá aquí mismo (respuesta simulada).', {
        options: supportTopics,
      });
    }
  };

  const renderItem = ({ item }) => {
    const mine = item.from === 'user';
    return (
      <View style={[styles.messageRow, mine && styles.messageRowMine]}>
        {!mine ? (
          <View style={styles.botAvatar}>
            <Bot size={16} color={colors.white} />
          </View>
        ) : null}
        <View style={styles.messageCol}>
          <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleBot]}>
            <CustomText variant="small" style={{ color: mine ? colors.ink : colors.white }}>
              {item.text}
            </CustomText>
          </View>
          {item.options ? (
            <View style={styles.options}>
              {item.options.map((option) => (
                <Pressable key={option} onPress={() => send(option)} style={styles.option} testID={`chat-option-${option}`}>
                  <CustomText variant="smallBold" color="primary">
                    {option}
                  </CustomText>
                </Pressable>
              ))}
            </View>
          ) : null}
          {item.rate && !rated ? (
            <Pressable onPress={() => setRating(true)} style={[styles.option, styles.rateOption]} testID="chat-rate">
              <Star size={14} color={colors.primary} />
              <CustomText variant="smallBold" color="primary">
                Calificar el servicio
              </CustomText>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper padded={false} edges={['top', 'bottom']} header={<CustomHeader title="Soporte MarketGO" subtitle="Servicio de atención al cliente" />}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            typing ? (
              <CustomText variant="caption" color="textMuted" style={styles.typing}>
                El asistente está escribiendo…
              </CustomText>
            ) : null
          }
        />
        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Mensaje"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            onSubmitEditing={() => send(text)}
            returnKeyType="send"
            testID="chat-input"
            accessibilityLabel="Escribe un mensaje"
          />
          <Pressable
            onPress={() => send(text)}
            disabled={!text.trim()}
            style={[styles.send, !text.trim() && styles.sendDisabled]}
            accessibilityLabel="Enviar mensaje"
            testID="chat-send"
          >
            <Send size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={rating}
        hideIcon
        title="Valora nuestro servicio"
        onClose={() => setRating(false)}
        primaryText="Enviar"
        onPrimary={() => {
          if (!stars) return;
          setRated(true);
          setRating(false);
          setMessages((prev) => [...prev, message('bot', `¡Gracias por calificarnos con ${stars} estrellas! 💜`)]);
        }}
        secondaryText="Cancelar"
      >
        <RatingStars value={stars} onChange={setStars} size={34} style={styles.stars} />
        {!stars ? (
          <CustomText variant="caption" color="textMuted" align="center">
            Toca las estrellas para calificar
          </CustomText>
        ) : null}
        <InputField placeholder="Tu comentario (opcional)" multiline value={comment} onChangeText={setComment} style={styles.comment} />
      </CustomModal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12 },
  messageRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', maxWidth: '88%' },
  messageRowMine: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  messageCol: { flexShrink: 1, gap: 8 },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg },
  bubbleBot: { backgroundColor: colors.primary, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: colors.primaryLight, borderBottomRightRadius: 4 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  rateOption: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  typing: { marginLeft: 38 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    outlineStyle: 'none',
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  stars: { justifyContent: 'center', gap: 8, marginVertical: 12 },
  comment: { marginTop: 8 },
});
