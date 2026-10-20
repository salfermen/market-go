import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Mail, ShieldCheck, Store, Users } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import CustomText from '../../components/common/CustomText';
import Avatar from '../../components/common/Avatar';
import { APP_VERSION, SUPPORT_EMAIL } from '../../utils/constants';
import { colors, radius } from '../../theme';

const TEAM = ['Laura Daniela Galindo Casallas', 'Salim Ferez Mendez', 'Juna Sebastián Salas Castillo'];

const VALUES = [
  { icon: Store, title: 'Lo local primero', text: 'Damos vitrina a emprendimientos pequeños e informales.' },
  { icon: Users, title: 'Cerca de tus clientes', text: 'Catálogo, pedidos y reseñas en un solo lugar.' },
  { icon: ShieldCheck, title: 'Compra segura', text: 'Pagos protegidos y seguimiento de cada pedido.' },
];

// P-32 Acerca de MarketGO
export default function About() {
  return (
    <ScreenWrapper scroll edges={['top', 'bottom']} header={<CustomHeader title="Acerca de" />}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityLabel="Logo de MarketGO" />

      <CustomText variant="h1">Acerca de Nosotros</CustomText>
      <CustomText variant="body" color="textMuted" style={styles.paragraph}>
        MarketGO es una tienda virtual que conecta a vendedores pequeños o informales con clientes que buscan sus
        productos. Centraliza el catálogo, la búsqueda y la gestión de pedidos para que cualquier emprendimiento pueda
        vender desde el celular, sin depender de un punto de venta físico.
      </CustomText>

      {VALUES.map(({ icon: Icon, title, text }) => (
        <View key={title} style={styles.value}>
          <View style={styles.valueIcon}>
            <Icon size={20} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <CustomText variant="bodyBold">{title}</CustomText>
            <CustomText variant="small" color="textMuted">
              {text}
            </CustomText>
          </View>
        </View>
      ))}

      <CustomText variant="h3" style={styles.subtitle}>
        Equipo
      </CustomText>
      {TEAM.map((name) => (
        <View key={name} style={styles.member}>
          <Avatar name={name} size={36} />
          <CustomText variant="small">{name}</CustomText>
        </View>
      ))}

      <CustomText variant="body" color="textMuted" style={styles.paragraph}>
        Si necesitas ayuda o tienes alguna pregunta, escríbenos:
      </CustomText>
      <View style={styles.contact}>
        <Mail size={18} color={colors.primary} />
        <CustomText variant="bodyBold" color="primary">
          {SUPPORT_EMAIL}
        </CustomText>
      </View>

      <CustomText variant="caption" color="textLight" align="center" style={styles.footer}>
        Versión {APP_VERSION} · Proyecto académico — Desarrollo de Aplicaciones Móviles{'\n'}Fundación Universitaria Konrad Lorenz · 2026
      </CustomText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 8,
  },
  paragraph: { marginTop: 10, marginBottom: 10 },
  value: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { marginTop: 18, marginBottom: 8 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  footer: { marginTop: 24 },
});
