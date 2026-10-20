import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ticket } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import VoucherCard from '../../components/specific/VoucherCard';
import useToast from '../../hooks/useToast';
import { useShop } from '../../store/shopStore';
import { useCart } from '../../store/cartStore';
import { vouchers } from '../../data/mockData';

const daysUntil = (date) => Math.ceil((new Date(`${date}T23:59`) - new Date()) / 86400000);

// P-16 Cupones
// selectMode (desde Carrito o Pago): al aplicar un cupón se regresa automáticamente.
export default function Voucher({ navigation, route }) {
  const selectMode = route.params?.selectMode ?? false;
  const { claimedVoucherIds, claimVoucher } = useShop();
  const cart = useCart();
  const { toast, showToast } = useToast();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(null);

  const mine = vouchers.filter((v) => claimedVoucherIds.includes(v.id));
  const available = vouchers.filter((v) => !claimedVoucherIds.includes(v.id));

  const addCode = () => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setCodeError('Escribe un código');
      return;
    }
    const found = vouchers.find((v) => v.code === clean);
    if (!found) {
      setCodeError('Este código no existe o ya venció');
      return;
    }
    if (claimedVoucherIds.includes(found.id)) {
      setCodeError('Ya tienes este cupón');
      return;
    }
    claimVoucher(found.id);
    setCode('');
    showToast(`Cupón ${found.code} agregado`);
  };

  const apply = (voucher) => {
    cart.applyVoucher(voucher);
    if (selectMode) navigation.goBack();
    else showToast(`Cupón ${voucher.code} aplicado a tu carrito`);
  };

  return (
    <ScreenWrapper scroll keyboard header={<CustomHeader title="Cupones" subtitle={selectMode ? 'Elige un cupón para tu compra' : undefined} />}>
      {!selectMode ? (
        <SegmentedTabs
          options={[
            { key: 'vouchers', label: 'Cupones' },
            { key: 'progress', label: 'Progreso' },
          ]}
          value="vouchers"
          onChange={(key) => key === 'progress' && navigation.replace('UserRewards')}
          style={styles.tabs}
        />
      ) : null}

      <View style={styles.codeRow}>
        <InputField
          placeholder="Ingresa un código"
          autoCapitalize="characters"
          value={code}
          onChangeText={(t) => {
            setCode(t);
            setCodeError(null);
          }}
          error={codeError}
          style={styles.flex}
          testID="voucher-code"
        />
        <PrimaryButton title="Agregar" size="sm" onPress={addCode} style={styles.addButton} testID="voucher-add" />
      </View>

      <SectionHeader title="Mis cupones" />
      {mine.length === 0 ? (
        <EmptyState icon={Ticket} title="No tienes cupones" message="Obtén cupones disponibles o canjea tus puntos." />
      ) : (
        mine.map((v) => {
          const applied = cart.voucher?.id === v.id;
          return (
            <VoucherCard
              key={v.id}
              voucher={v}
              highlight={applied}
              expiringSoon={daysUntil(v.expires) <= 10}
              actionLabel={applied ? 'Aplicado' : 'Aplicar'}
              actionDisabled={applied}
              onAction={() => apply(v)}
              testID={`voucher-${v.id}`}
            />
          );
        })
      )}

      {available.length > 0 ? (
        <>
          <SectionHeader title="Disponibles para ti" style={styles.section} />
          {available.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              expiringSoon={daysUntil(v.expires) <= 10}
              actionLabel="Obtener"
              onAction={() => {
                claimVoucher(v.id);
                showToast(`Obtuviste el cupón ${v.code}`);
              }}
              testID={`voucher-get-${v.id}`}
            />
          ))}
        </>
      ) : null}

      <CustomText variant="caption" color="textMuted" align="center" style={styles.note}>
        Los cupones no son acumulables. Se aplica uno por compra.
      </CustomText>
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { marginBottom: 16 },
  codeRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addButton: {
    marginTop: 5,
  },
  section: { marginTop: 20 },
  note: { marginTop: 16 },
});
