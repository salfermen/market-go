// Mapa nombre -> ícono de lucide-react-native.
// Los datos (mock o backend) guardan el nombre del ícono como texto
// y los componentes lo convierten aquí en el componente real.
import {
  Award,
  Backpack,
  Footprints,
  Gem,
  Glasses,
  Handshake,
  HatGlasses,
  Heart,
  Package,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  Watch,
} from 'lucide-react-native';

const ICONS = {
  Award,
  Backpack,
  Footprints,
  Gem,
  Glasses,
  Handshake,
  HatGlasses,
  Heart,
  Package,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  Watch,
};

export function getIcon(name) {
  return ICONS[name] ?? Package;
}
