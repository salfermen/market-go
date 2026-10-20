// Datos simulados (mock) para la segunda entrega.
// Representan la forma que tendrán las respuestas del backend en Ktor.
// Cuando exista la API, la capa src/api dejará de leer este archivo.

// ---------------------------------------------------------------------------
// Tiendas (emprendimientos)
// ---------------------------------------------------------------------------
export const stores = [
  {
    id: 's1',
    name: 'Moda Ramona',
    owner: 'Ramona Díaz',
    city: 'Bogotá',
    rating: 4.8,
    followers: 1280,
    description: 'Ropa casual hecha por una diseñadora independiente del barrio Chapinero.',
  },
  {
    id: 's2',
    name: 'Artesanías del Caribe',
    owner: 'Luis Montero',
    city: 'Riohacha',
    rating: 4.9,
    followers: 860,
    description: 'Mochilas, sombreros y accesorios tejidos a mano por artesanos wayuu y zenúes.',
  },
  {
    id: 's3',
    name: 'Calzado Andino',
    owner: 'Marcela Rojas',
    city: 'Bucaramanga',
    rating: 4.6,
    followers: 540,
    description: 'Calzado en cuero fabricado en talleres familiares de Santander.',
  },
  {
    id: 's4',
    name: 'Bolsos Luna',
    owner: 'Andrea Luna',
    city: 'Medellín',
    rating: 4.7,
    followers: 710,
    description: 'Bolsos, carteras y accesorios con diseño local.',
  },
];

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------
export const categories = [
  { id: 'ropa', name: 'Ropa', icon: 'Shirt', tone: '#FCE7F3', count: 340 },
  { id: 'zapatos', name: 'Zapatos', icon: 'Footprints', tone: '#E0F2FE', count: 410 },
  { id: 'bolsos', name: 'Bolsos', icon: 'ShoppingBag', tone: '#FFEDD5', count: 87 },
  { id: 'accesorios', name: 'Accesorios', icon: 'Watch', tone: '#EDE9FE', count: 210 },
  { id: 'artesanal', name: 'Artesanal', icon: 'Palette', tone: '#DCFCE7', count: 128 },
];

// Subcategorías por pestaña (Todos / Mujeres / Hombres) para la pantalla Categorías
export const categoryGroups = {
  all: {
    title: 'Todas las categorías',
    items: [
      { id: 'ropa', subcategories: ['Vestidos', 'Pantalones', 'Faldas', 'Shorts', 'Chaquetas', 'Sudaderas', 'Camisas', 'Blusas', 'Trajes', 'Túnicas'] },
      { id: 'zapatos', subcategories: ['Tenis', 'Botas', 'Sandalias', 'Chanclas'] },
      { id: 'bolsos', subcategories: ['Mochilas', 'Carteras', 'Bolsas de mano', 'Crossbody'] },
      { id: 'artesanal', subcategories: ['Accesorios hechos a mano', 'Joyería artesanal', 'Arte local'] },
      { id: 'accesorios', subcategories: ['Gorras', 'Pañuelos', 'Gafas', 'Relojes'] },
    ],
  },
  women: {
    title: 'Categorías Mujeres',
    items: [
      { id: 'ropa', subcategories: ['Vestidos', 'Pantalones', 'Faldas', 'Shorts', 'Blusas', 'Suéteres'] },
      { id: 'zapatos', subcategories: ['Tacones', 'Tenis', 'Botas', 'Sandalias'] },
      { id: 'bolsos', subcategories: ['Bolsas de mano', 'Mochilas', 'Carteras'] },
    ],
  },
  men: {
    title: 'Categorías Hombres',
    items: [
      { id: 'ropa', subcategories: ['Camisas', 'Pantalones', 'Shorts', 'Chaquetas', 'Suéteres'] },
      { id: 'zapatos', subcategories: ['Tenis', 'Botas', 'Sandalias'] },
      { id: 'accesorios', subcategories: ['Gorras', 'Gafas', 'Relojes'] },
    ],
  },
};

// ---------------------------------------------------------------------------
// Productos
// price / oldPrice en pesos colombianos (COP)
// icon + tone: imagen provisional mientras el backend entrega fotos reales
// ---------------------------------------------------------------------------
const C = {
  rosa: { name: 'Rosa', hex: '#F9A8D4' },
  lila: { name: 'Lila', hex: '#C4B5FD' },
  negro: { name: 'Negro', hex: '#1F2937' },
  blanco: { name: 'Blanco', hex: '#F9FAFB' },
  azul: { name: 'Azul', hex: '#60A5FA' },
  cafe: { name: 'Café', hex: '#92400E' },
  beige: { name: 'Beige', hex: '#E7D7B9' },
  verde: { name: 'Verde', hex: '#34D399' },
  rojo: { name: 'Rojo', hex: '#F87171' },
};

export const products = [
  {
    id: 'p1', name: 'Vestido casual rosa', category: 'ropa', subcategory: 'Vestidos', gender: 'mujeres',
    price: 89900, oldPrice: 119900, rating: 4.8, reviewsCount: 86, stock: 14, sold: 86,
    colors: [C.rosa, C.lila, C.negro], sizes: ['XS', 'S', 'M', 'L'],
    material: 'Algodón 100 %', origin: 'Colombia', storeId: 's1',
    badge: 'Popular', icon: 'Shirt', tone: '#FCE7F3', isNew: false, isPopular: true, isFlash: true,
    description: 'Vestido fresco de algodón con corte en A, ideal para el día a día. Confeccionado en Bogotá por Moda Ramona.',
  },
  {
    id: 'p2', name: 'Gafas de sol retro', category: 'accesorios', subcategory: 'Gafas', gender: 'unisex',
    price: 59900, oldPrice: null, rating: 4.7, reviewsCount: 64, stock: 22, sold: 64,
    colors: [C.negro, C.cafe], sizes: ['Única'],
    material: 'Acetato', origin: 'Colombia', storeId: 's1',
    badge: 'Nuevo', icon: 'Glasses', tone: '#FEF3C7', isNew: true, isPopular: true, isFlash: false,
    description: 'Gafas de sol con montura redonda y protección UV400.',
  },
  {
    id: 'p3', name: 'Blusa de lino blanca', category: 'ropa', subcategory: 'Blusas', gender: 'mujeres',
    price: 74900, oldPrice: null, rating: 4.5, reviewsCount: 31, stock: 9, sold: 40,
    colors: [C.blanco, C.beige], sizes: ['S', 'M', 'L', 'XL'],
    material: 'Lino', origin: 'Colombia', storeId: 's1',
    badge: 'Nuevo', icon: 'Shirt', tone: '#F3F4F6', isNew: true, isPopular: false, isFlash: false,
    description: 'Blusa liviana de lino con botones de coco, perfecta para clima cálido.',
  },
  {
    id: 'p4', name: 'Jean tiro alto', category: 'ropa', subcategory: 'Pantalones', gender: 'mujeres',
    price: 129900, oldPrice: 159900, rating: 4.6, reviewsCount: 52, stock: 18, sold: 75,
    colors: [C.azul, C.negro], sizes: ['6', '8', '10', '12', '14'],
    material: 'Denim 98 % algodón', origin: 'Colombia', storeId: 's1',
    badge: 'Oferta', icon: 'Shirt', tone: '#DBEAFE', isNew: false, isPopular: true, isFlash: true,
    description: 'Jean de tiro alto con ajuste perfecto y tela que no destiñe.',
  },
  {
    id: 'p5', name: 'Tenis urbanos blancos', category: 'zapatos', subcategory: 'Tenis', gender: 'unisex',
    price: 189900, oldPrice: null, rating: 4.7, reviewsCount: 120, stock: 30, sold: 150,
    colors: [C.blanco, C.negro], sizes: ['36', '37', '38', '39', '40', '41', '42'],
    material: 'Cuero sintético', origin: 'Colombia', storeId: 's3',
    badge: 'Popular', icon: 'Footprints', tone: '#E0F2FE', isNew: false, isPopular: true, isFlash: false,
    description: 'Tenis cómodos con suela de caucho, hechos en Bucaramanga.',
  },
  {
    id: 'p6', name: 'Botas de cuero café', category: 'zapatos', subcategory: 'Botas', gender: 'mujeres',
    price: 199900, oldPrice: 249900, rating: 4.9, reviewsCount: 44, stock: 6, sold: 51,
    colors: [C.cafe, C.negro], sizes: ['35', '36', '37', '38', '39'],
    material: 'Cuero natural', origin: 'Colombia', storeId: 's3',
    badge: 'Oferta', icon: 'Footprints', tone: '#FDE68A', isNew: false, isPopular: false, isFlash: true,
    description: 'Botas al tobillo en cuero natural con tacón bajo.',
  },
  {
    id: 'p7', name: 'Mochila wayuu', category: 'bolsos', subcategory: 'Mochilas', gender: 'unisex',
    price: 159900, oldPrice: null, rating: 5.0, reviewsCount: 98, stock: 11, sold: 120,
    colors: [C.rojo, C.azul, C.verde], sizes: ['Única'],
    material: 'Hilo acrílico tejido a mano', origin: 'La Guajira', storeId: 's2',
    badge: 'Popular', icon: 'Backpack', tone: '#FFEDD5', isNew: false, isPopular: true, isFlash: false,
    description: 'Mochila tejida a mano por artesanas wayuu. Cada pieza es única.',
  },
  {
    id: 'p8', name: 'Sombrero vueltiao', category: 'artesanal', subcategory: 'Arte local', gender: 'unisex',
    price: 139900, oldPrice: null, rating: 4.8, reviewsCount: 37, stock: 8, sold: 29,
    colors: [C.beige, C.negro], sizes: ['M', 'L'],
    material: 'Caña flecha', origin: 'Córdoba', storeId: 's2',
    badge: 'Nuevo', icon: 'Palette', tone: '#DCFCE7', isNew: true, isPopular: false, isFlash: false,
    description: 'Sombrero tradicional de 15 vueltas en caña flecha.',
  },
  {
    id: 'p9', name: 'Bolso de mano tejido', category: 'bolsos', subcategory: 'Bolsas de mano', gender: 'mujeres',
    price: 99900, oldPrice: 129900, rating: 4.6, reviewsCount: 28, stock: 12, sold: 33,
    colors: [C.beige, C.rosa], sizes: ['Única'],
    material: 'Fique', origin: 'Colombia', storeId: 's4',
    badge: 'Oferta', icon: 'ShoppingBag', tone: '#FCE7F3', isNew: false, isPopular: false, isFlash: true,
    description: 'Bolso de mano tejido en fique con forro interior y cierre.',
  },
  {
    id: 'p10', name: 'Collar de chaquiras', category: 'artesanal', subcategory: 'Joyería artesanal', gender: 'mujeres',
    price: 39900, oldPrice: null, rating: 4.9, reviewsCount: 57, stock: 25, sold: 80,
    colors: [C.verde, C.rojo, C.azul], sizes: ['Única'],
    material: 'Chaquira checa', origin: 'Colombia', storeId: 's2',
    badge: 'Nuevo', icon: 'Gem', tone: '#CCFBF1', isNew: true, isPopular: false, isFlash: false,
    description: 'Collar tejido con chaquiras de colores inspirado en el arte emberá.',
  },
  {
    id: 'p11', name: 'Camisa guayabera', category: 'ropa', subcategory: 'Camisas', gender: 'hombres',
    price: 94900, oldPrice: null, rating: 4.5, reviewsCount: 22, stock: 16, sold: 27,
    colors: [C.blanco, C.azul], sizes: ['S', 'M', 'L', 'XL'],
    material: 'Lino', origin: 'Colombia', storeId: 's1',
    badge: 'Popular', icon: 'Shirt', tone: '#ECFCCB', isNew: false, isPopular: true, isFlash: false,
    description: 'Guayabera clásica en lino con bordado frontal.',
  },
  {
    id: 'p12', name: 'Chaqueta de jean', category: 'ropa', subcategory: 'Chaquetas', gender: 'unisex',
    price: 169900, oldPrice: 199900, rating: 4.7, reviewsCount: 39, stock: 0, sold: 61,
    colors: [C.azul], sizes: ['S', 'M', 'L'],
    material: 'Denim', origin: 'Colombia', storeId: 's1',
    badge: 'Oferta', icon: 'Shirt', tone: '#DBEAFE', isNew: false, isPopular: false, isFlash: true,
    description: 'Chaqueta de jean clásica con bolsillos frontales.',
  },
  {
    id: 'p13', name: 'Sandalias artesanales', category: 'zapatos', subcategory: 'Sandalias', gender: 'mujeres',
    price: 69900, oldPrice: null, rating: 4.4, reviewsCount: 18, stock: 20, sold: 22,
    colors: [C.cafe, C.beige], sizes: ['35', '36', '37', '38', '39'],
    material: 'Cuero y fique', origin: 'Colombia', storeId: 's3',
    badge: 'Nuevo', icon: 'Footprints', tone: '#FEF3C7', isNew: true, isPopular: false, isFlash: false,
    description: 'Sandalias planas con tiras de cuero tejido.',
  },
  {
    id: 'p14', name: 'Gorra bordada', category: 'accesorios', subcategory: 'Gorras', gender: 'hombres',
    price: 45900, oldPrice: null, rating: 4.3, reviewsCount: 15, stock: 3, sold: 19,
    colors: [C.negro, C.beige], sizes: ['Única'],
    material: 'Algodón', origin: 'Colombia', storeId: 's4',
    badge: 'Nuevo', icon: 'HatGlasses', tone: '#E5E7EB', isNew: true, isPopular: false, isFlash: false,
    description: 'Gorra con bordado de colibrí, ajustable.',
  },
  {
    id: 'p15', name: 'Reloj minimalista', category: 'accesorios', subcategory: 'Relojes', gender: 'hombres',
    price: 219900, oldPrice: 259900, rating: 4.6, reviewsCount: 26, stock: 7, sold: 24,
    colors: [C.negro, C.cafe], sizes: ['Única'],
    material: 'Acero inoxidable', origin: 'Importado', storeId: 's4',
    badge: 'Oferta', icon: 'Watch', tone: '#EDE9FE', isNew: false, isPopular: true, isFlash: true,
    description: 'Reloj análogo de esfera limpia y correa de cuero.',
  },
  {
    id: 'p16', name: 'Ruana de lana', category: 'artesanal', subcategory: 'Accesorios hechos a mano', gender: 'unisex',
    price: 179900, oldPrice: null, rating: 4.9, reviewsCount: 33, stock: 5, sold: 30,
    colors: [C.beige, C.cafe], sizes: ['Única'],
    material: 'Lana virgen', origin: 'Boyacá', storeId: 's2',
    badge: 'Popular', icon: 'Shirt', tone: '#F5F5F4', isNew: false, isPopular: true, isFlash: false,
    description: 'Ruana boyacense tejida en telar con lana virgen.',
  },
  {
    id: 'p17', name: 'Cartera de cuero', category: 'bolsos', subcategory: 'Carteras', gender: 'mujeres',
    price: 84900, oldPrice: null, rating: 4.5, reviewsCount: 21, stock: 13, sold: 18,
    colors: [C.cafe, C.negro, C.rojo], sizes: ['Única'],
    material: 'Cuero', origin: 'Colombia', storeId: 's4',
    badge: 'Nuevo', icon: 'Wallet', tone: '#FDE2E4', isNew: true, isPopular: false, isFlash: false,
    description: 'Cartera compacta con espacio para tarjetas y monedero.',
  },
  {
    id: 'p18', name: 'Pañuelo de seda', category: 'accesorios', subcategory: 'Pañuelos', gender: 'mujeres',
    price: 35900, oldPrice: 49900, rating: 4.4, reviewsCount: 12, stock: 17, sold: 14,
    colors: [C.lila, C.rosa], sizes: ['Única'],
    material: 'Seda', origin: 'Colombia', storeId: 's4',
    badge: 'Oferta', icon: 'Sparkles', tone: '#F3E8FF', isNew: false, isPopular: false, isFlash: true,
    description: 'Pañuelo estampado en seda, se puede usar en el cuello o el cabello.',
  },
];

// ---------------------------------------------------------------------------
// Reseñas de productos
// ---------------------------------------------------------------------------
export const reviews = [
  { id: 'r1', productId: 'p1', author: 'Lucía Fernández', rating: 5, date: '2026-10-17', comment: 'Me encantó el vestido, la calidad es increíble y llegó rapidísimo.', reply: null },
  { id: 'r2', productId: 'p2', author: 'Carlos Ramírez', rating: 5, date: '2026-10-16', comment: 'Las gafas son tal cual aparecen en las fotos. Muy buena compra.', reply: 'Gracias Carlos, ¡que las disfrutes!' },
  { id: 'r3', productId: 'p1', author: 'Ana Martínez', rating: 4, date: '2026-10-15', comment: 'Bonito y cómodo. La talla es un poco grande, pidan una menos.', reply: null },
  { id: 'r4', productId: 'p4', author: 'Sofía Herrera', rating: 5, date: '2026-10-12', comment: 'El mejor jean que he comprado, el tiro alto queda perfecto.', reply: null },
  { id: 'r5', productId: 'p7', author: 'Daniel Torres', rating: 5, date: '2026-10-10', comment: 'La mochila es preciosa, se nota el trabajo artesanal.', reply: 'Gracias por apoyar a nuestras artesanas.' },
  { id: 'r6', productId: 'p5', author: 'Valentina Gómez', rating: 4, date: '2026-10-09', comment: 'Muy cómodos para caminar todo el día.', reply: null },
  { id: 'r7', productId: 'p1', author: 'Mariana López', rating: 5, date: '2026-10-05', comment: 'Segundo vestido que compro en esta tienda, excelente atención.', reply: null },
  { id: 'r8', productId: 'p11', author: 'Andrés Castro', rating: 4, date: '2026-10-02', comment: 'Buena tela y buen precio. El envío tardó un día más.', reply: null },
];

// ---------------------------------------------------------------------------
// Usuarios de demostración (contraseña: Market123)
// ---------------------------------------------------------------------------
export const demoUsers = [
  {
    id: 'u1',
    name: 'Ramona Díaz',
    email: 'ramona@marketgo.co',
    phone: '3001234567',
    password: 'Market123',
    points: 1250,
    storeId: 's1',
  },
  {
    id: 'u2',
    name: 'Juan Pérez',
    email: 'juan@marketgo.co',
    phone: '3109876543',
    password: 'Market123',
    points: 320,
    storeId: null,
  },
];

// ---------------------------------------------------------------------------
// Cupones
// ---------------------------------------------------------------------------
export const vouchers = [
  { id: 'v1', code: 'PRIMERA15', title: 'Primera compra', description: '15 % de descuento en tu primera compra', type: 'percent', value: 15, minPurchase: 0, expires: '2026-12-31' },
  { id: 'v2', code: 'BIENVENIDO10', title: 'Regalo al cliente', description: '$10.000 de descuento en compras desde $80.000', type: 'amount', value: 10000, minPurchase: 80000, expires: '2026-11-30' },
  { id: 'v3', code: 'LEAL20', title: 'Cliente leal', description: '20 % de descuento para clientes con 3 pedidos o más', type: 'percent', value: 20, minPurchase: 150000, expires: '2026-10-25' },
  { id: 'v4', code: 'ENVIOGRATIS', title: 'Envío gratis', description: 'Envío express sin costo en cualquier compra', type: 'shipping', value: 0, minPurchase: 0, expires: '2026-11-15' },
];

// ---------------------------------------------------------------------------
// Logros / recompensas
// ---------------------------------------------------------------------------
export const rewardBadges = [
  { id: 'b1', title: 'Primera compra', description: 'Realiza tu primer pedido.', icon: 'ShoppingBag', progress: 1, goal: 1, points: 100 },
  { id: 'b2', title: 'Cliente leal', description: 'Completa 5 pedidos.', icon: 'Heart', progress: 3, goal: 5, points: 300 },
  { id: 'b3', title: 'Creador de reseñas', description: 'Escribe 3 reseñas.', icon: 'Star', progress: 2, goal: 3, points: 150 },
  { id: 'b4', title: 'Gran aliado', description: 'Compra a 3 emprendimientos distintos.', icon: 'Handshake', progress: 3, goal: 3, points: 200 },
  { id: 'b5', title: 'Coleccionista', description: 'Guarda 10 productos en favoritos.', icon: 'Gem', progress: 4, goal: 10, points: 100 },
  { id: 'b6', title: '10+ pedidos', description: 'Completa 10 pedidos.', icon: 'Award', progress: 3, goal: 10, points: 500 },
];

export const rewardsCatalog = [
  { id: 'rw1', title: 'Cupón de $5.000', cost: 500, voucherId: 'v2' },
  { id: 'rw2', title: 'Envío gratis', cost: 800, voucherId: 'v4' },
  { id: 'rw3', title: '20 % de descuento', cost: 1500, voucherId: 'v3' },
];

// ---------------------------------------------------------------------------
// Pedidos del cliente
// status: 'paid' | 'packed' | 'shipped' | 'delivered'
// ---------------------------------------------------------------------------
export const clientOrders = [
  {
    id: 'MG-1041', date: '2026-10-14', status: 'shipped', tracking: 'LGS-920278393007',
    items: [{ productId: 'p7', quantity: 1, price: 159900 }, { productId: 'p10', quantity: 2, price: 39900 }],
    shipping: 0, total: 239700, address: 'Cra. 7 # 45-10, Bogotá', reviewed: false,
  },
  {
    id: 'MG-1032', date: '2026-10-02', status: 'delivered', tracking: 'LGS-920278391554',
    items: [{ productId: 'p13', quantity: 1, price: 69900 }],
    shipping: 0, total: 69900, address: 'Cra. 7 # 45-10, Bogotá', reviewed: false,
  },
  {
    id: 'MG-1019', date: '2026-09-21', status: 'delivered', tracking: 'LGS-920278389012',
    items: [{ productId: 'p5', quantity: 1, price: 189900 }],
    shipping: 12000, total: 201900, address: 'Cra. 7 # 45-10, Bogotá', reviewed: true,
  },
];

// ---------------------------------------------------------------------------
// Datos del vendedor (tienda s1 – Moda Ramona)
// status: 'new' | 'preparing' | 'shipped' | 'delivered'
// ---------------------------------------------------------------------------
export const sellerOrders = [
  { id: 'MG-1048', customer: 'Lucía Fernández', city: 'Bogotá', date: '2026-10-19T10:42', status: 'new', items: [{ productId: 'p1', quantity: 1, price: 89900 }], total: 89900 },
  { id: 'MG-1047', customer: 'Carlos Ramírez', city: 'Cali', date: '2026-10-19T09:18', status: 'new', items: [{ productId: 'p2', quantity: 2, price: 59900 }], total: 119800 },
  { id: 'MG-1046', customer: 'Ana Torres', city: 'Medellín', date: '2026-10-18T18:25', status: 'preparing', items: [{ productId: 'p4', quantity: 1, price: 129900 }, { productId: 'p3', quantity: 1, price: 74900 }], total: 204800 },
  { id: 'MG-1045', customer: 'Felipe Ortiz', city: 'Bogotá', date: '2026-10-18T12:05', status: 'shipped', items: [{ productId: 'p11', quantity: 1, price: 94900 }], total: 94900 },
  { id: 'MG-1043', customer: 'Sara Medina', city: 'Barranquilla', date: '2026-10-17T16:40', status: 'delivered', items: [{ productId: 'p12', quantity: 1, price: 169900 }], total: 169900 },
  { id: 'MG-1040', customer: 'Tomás Vargas', city: 'Pereira', date: '2026-10-16T11:10', status: 'delivered', items: [{ productId: 'p1', quantity: 2, price: 89900 }], total: 179800 },
];

// Ventas de los últimos 7 días (para las gráficas del panel)
export const weeklySales = [
  { label: 'Lun', value: 320000 },
  { label: 'Mar', value: 410000 },
  { label: 'Mié', value: 360000 },
  { label: 'Jue', value: 520000 },
  { label: 'Vie', value: 470000 },
  { label: 'Sáb', value: 690000 },
  { label: 'Dom', value: 810000 },
];

export const monthlySales = [
  { label: 'May', value: 6200000 },
  { label: 'Jun', value: 7100000 },
  { label: 'Jul', value: 6800000 },
  { label: 'Ago', value: 8400000 },
  { label: 'Sep', value: 9900000 },
  { label: 'Oct', value: 11200000 },
];

export const salesByCategory = [
  { label: 'Vestidos', value: 42 },
  { label: 'Pantalones', value: 23 },
  { label: 'Accesorios', value: 18 },
  { label: 'Camisas', value: 11 },
  { label: 'Chaquetas', value: 6 },
];

// ---------------------------------------------------------------------------
// Soporte (chat)
// ---------------------------------------------------------------------------
export const supportTopics = [
  'Problemas con el pedido',
  'Estado del envío',
  'Problemas de pago',
  'Mi cuenta',
  'Otro',
];

export const supportAnswers = {
  'Problemas con el pedido': 'Lamento el inconveniente. Revisa tu pedido en Perfil › Mis pedidos; si el producto llegó defectuoso puedes solicitar el cambio en los primeros 5 días.',
  'Estado del envío': 'Puedes ver el estado de tu envío en Perfil › Mis pedidos › Rastrear. Los envíos estándar tardan de 5 a 7 días hábiles.',
  'Problemas de pago': 'Si el pago fue rechazado, verifica los datos de tu tarjeta o intenta con PSE o Nequi. No se realizó ningún cobro.',
  'Mi cuenta': 'Desde Perfil › Editar información puedes actualizar tu nombre, correo y teléfono.',
  Otro: 'Cuéntame un poco más y un asesor te responderá en breve.',
};

export const announcement = {
  title: 'Anuncio',
  text: 'Este mes los emprendimientos artesanales tienen envío gratis. ¡Apoya lo local!',
};
