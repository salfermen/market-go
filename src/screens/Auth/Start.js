import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Rocket, Store, Users } from 'lucide-react-native';

import HelloCard from '../../components/HelloCard';
import BlobBackground from '../../components/layout/BlobBackground';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import { colors } from '../../theme';

// P-01 Inicio / Splash + Bienvenida (HelloCard x3)
// Se conserva el diseño original de la pantalla de inicio (logo, subtítulo,
// botón "Empecemos" y enlace "Ya tengo una cuenta"). "Empecemos" abre las
// tres tarjetas de bienvenida del flujo de navegación.

const PURPLE = colors.primary;
const BG = colors.primarySoft;
const MUTED = colors.textMuted;

const WELCOME_CARDS = [
  {
    icon: Store,
    tone: '#EDE9FE',
    title: 'Haz que tu marca destaque',
    text: 'En MarketGO cada emprendimiento tiene un espacio para mostrar su catálogo y hacer crecer su negocio.',
  },
  {
    icon: Users,
    tone: '#D9E4FF',
    title: 'Conecta con tus clientes ideales',
    text: 'Publica tus productos y llega a compradores que buscan lo que vendes, sin un local físico.',
  },
  {
    icon: Rocket,
    tone: '#FCE7F3',
    title: 'Tu negocio merece ser visto',
    text: 'Crea tu cuenta para comprar o vender en minutos.',
  },
];

export default function StartScreen({ navigation }) {
  const [step, setStep] = useState(null); // null = splash, 0..2 = tarjeta de bienvenida

  if (step !== null) {
    const card = WELCOME_CARDS[step];
    const isLast = step === WELCOME_CARDS.length - 1;
    return (
      <SafeAreaView style={styles.welcome}>
        <StatusBar style="dark" />
        <BlobBackground variant="onboarding" />
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.skip} hitSlop={10} testID="welcome-skip">
          <Text style={styles.skipText}>Omitir</Text>
        </Pressable>

        <View style={styles.cardArea}>
          <HelloCard icon={card.icon} tone={card.tone} title={card.title} text={card.text} testID={`welcome-card-${step}`}>
            {isLast ? (
              <View style={styles.cardActions}>
                <PrimaryButton title="Crear cuenta" onPress={() => navigation.navigate('CreateAccount')} testID="welcome-create" />
                <SecondaryButton title="Iniciar sesión" onPress={() => navigation.navigate('Login')} testID="welcome-login" />
              </View>
            ) : null}
          </HelloCard>
        </View>

        <View style={styles.dots}>
          {WELCOME_CARDS.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setStep(index)}
              hitSlop={8}
              accessibilityLabel={`Ir a la tarjeta ${index + 1}`}
              style={[styles.dot, index === step && styles.dotActive]}
            />
          ))}
        </View>

        {!isLast ? (
          <View style={styles.footer}>
            <PrimaryButton title="Siguiente" onPress={() => setStep(step + 1)} testID="welcome-next" style={styles.fullWidth} />
          </View>
        ) : (
          <View style={styles.footerSpace} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityLabel="Logo de MarketGO" />

        <Text style={styles.subtitle}>Tu tienda online, lista en minutos.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={() => setStep(0)} testID="start-button">
          <Text style={styles.buttonText}>Empecemos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          activeOpacity={0.6}
          onPress={() => navigation.navigate('Login')}
          testID="start-login"
        >
          <Text style={styles.link}>Ya tengo una cuenta</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 260,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  button: {
    backgroundColor: PURPLE,
    width: '100%',
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 18,
    boxShadow: '0px 8px 12px rgba(124, 58, 237, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  link: {
    color: '#374151',
    fontSize: 14,
  },
  arrow: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: '700',
  },

  // --- Bienvenida ---
  welcome: {
    flex: 1,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  skip: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    color: PURPLE,
    fontWeight: '700',
    fontSize: 14,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  cardActions: {
    gap: 10,
    marginTop: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
  },
  dotActive: {
    width: 24,
    backgroundColor: PURPLE,
  },
  fullWidth: {
    width: '100%',
    marginBottom: 24,
  },
  footerSpace: {
    height: 78,
  },
});
