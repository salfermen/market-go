// Reglas de validación de formularios.
// Cada función validateX recibe los valores del formulario y devuelve un objeto
// { campo: 'mensaje de error' }. Si el objeto está vacío, el formulario es válido.
// IMPORTANTE: el backend (Ktor) también deberá validar; esto es solo para la experiencia de usuario.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^3\d{9}$/; // celular colombiano: 10 dígitos, empieza por 3

export const isEmpty = (value) => String(value ?? '').trim().length === 0;
export const isValidEmail = (value) => EMAIL_REGEX.test(String(value).trim());
export const isValidPhone = (value) => PHONE_REGEX.test(String(value).replace(/\s/g, ''));

// Mínimo 8 caracteres, una mayúscula, una minúscula y un número
export function getPasswordError(value = '') {
  if (value.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(value)) return 'Debe incluir al menos una minúscula';
  if (!/\d/.test(value)) return 'Debe incluir al menos un número';
  return null;
}

// Algoritmo de Luhn: detecta números de tarjeta mal digitados
export function isValidCardNumber(value = '') {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

// "MM/AA" vigente
export function isValidExpiry(value = '', now = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const lastDay = new Date(year, month, 0, 23, 59);
  return lastDay >= now;
}

// ---------------------------------------------------------------------------
// Validaciones por formulario
// ---------------------------------------------------------------------------

export function validateEmailStep({ email }) {
  const errors = {};
  if (isEmpty(email)) errors.email = 'Ingresa tu correo electrónico';
  else if (!isValidEmail(email)) errors.email = 'El correo no tiene un formato válido';
  return errors;
}

export function validateRegister({ name, email, password, phone, acceptTerms }) {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Ingresa tu nombre';
  else if (name.trim().length < 3) errors.name = 'El nombre es muy corto';
  if (isEmpty(email)) errors.email = 'Ingresa tu correo electrónico';
  else if (!isValidEmail(email)) errors.email = 'El correo no tiene un formato válido';
  const passwordError = getPasswordError(password);
  if (passwordError) errors.password = passwordError;
  if (isEmpty(phone)) errors.phone = 'Ingresa tu número de celular';
  else if (!isValidPhone(phone)) errors.phone = 'Debe tener 10 dígitos y empezar por 3';
  if (!acceptTerms) errors.acceptTerms = 'Debes aceptar los términos y condiciones';
  return errors;
}

export function validateNewPassword({ password, confirm }) {
  const errors = {};
  const passwordError = getPasswordError(password);
  if (passwordError) errors.password = passwordError;
  if (isEmpty(confirm)) errors.confirm = 'Confirma la contraseña';
  else if (password !== confirm) errors.confirm = 'Las contraseñas no coinciden';
  return errors;
}

export function validateProfile({ name, email, phone, storeName }, { requireStore = false } = {}) {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Ingresa tu nombre';
  if (isEmpty(email)) errors.email = 'Ingresa tu correo electrónico';
  else if (!isValidEmail(email)) errors.email = 'El correo no tiene un formato válido';
  if (!isValidPhone(phone)) errors.phone = 'Debe tener 10 dígitos y empezar por 3';
  if (requireStore && isEmpty(storeName)) errors.storeName = 'Ingresa el nombre de tu tienda';
  return errors;
}

export function validateAddress({ fullName, phone, city, address }) {
  const errors = {};
  if (isEmpty(fullName)) errors.fullName = 'Ingresa el nombre de quien recibe';
  if (!isValidPhone(phone)) errors.phone = 'Celular inválido (10 dígitos)';
  if (isEmpty(city)) errors.city = 'Ingresa la ciudad';
  if (isEmpty(address)) errors.address = 'Ingresa la dirección';
  else if (address.trim().length < 8) errors.address = 'La dirección es muy corta';
  return errors;
}

export function validateCard({ number, holder, expiry, cvv }) {
  const errors = {};
  if (!isValidCardNumber(number)) errors.number = 'Número de tarjeta inválido';
  if (isEmpty(holder)) errors.holder = 'Ingresa el nombre del titular';
  if (!isValidExpiry(expiry)) errors.expiry = 'Fecha inválida (MM/AA)';
  if (!/^\d{3,4}$/.test(cvv)) errors.cvv = 'CVV inválido';
  return errors;
}

export function validateProduct({ name, price, stock, category }) {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Ingresa el nombre del producto';
  const priceNumber = Number(price);
  if (isEmpty(price)) errors.price = 'Ingresa el precio';
  else if (!Number.isFinite(priceNumber) || priceNumber < 1000) errors.price = 'El precio mínimo es $ 1.000';
  const stockNumber = Number(stock);
  if (isEmpty(stock)) errors.stock = 'Ingresa el stock';
  else if (!Number.isInteger(stockNumber) || stockNumber < 0) errors.stock = 'Debe ser un número entero ≥ 0';
  if (isEmpty(category)) errors.category = 'Selecciona una categoría';
  return errors;
}

export function validateReview({ rating, comment }) {
  const errors = {};
  if (!rating) errors.rating = 'Selecciona una calificación';
  if (isEmpty(comment)) errors.comment = 'Escribe un comentario';
  else if (comment.trim().length < 10) errors.comment = 'Mínimo 10 caracteres';
  return errors;
}

export function validatePriceRange({ minPrice, maxPrice }) {
  const errors = {};
  const min = minPrice === '' ? null : Number(minPrice);
  const max = maxPrice === '' ? null : Number(maxPrice);
  if (min !== null && (!Number.isFinite(min) || min < 0)) errors.minPrice = 'Valor inválido';
  if (max !== null && (!Number.isFinite(max) || max < 0)) errors.maxPrice = 'Valor inválido';
  if (min !== null && max !== null && min > max) errors.maxPrice = 'Debe ser mayor que el mínimo';
  return errors;
}
