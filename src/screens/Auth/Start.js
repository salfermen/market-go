import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const INK = '#1E1B3A';
const PURPLE = '#7C3AED';
const BG = '#F5F3FF';
const MUTED = '#6B7280';

export default function StartScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <Text style={styles.subtitle}>
          Tu tienda online, lista en minutos.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Text style={styles.buttonText}>Empecemos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          activeOpacity={0.6}
          onPress={() => navigation.navigate('Login')}
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
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
});