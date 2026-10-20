import { useEffect, useState } from 'react';

// Devuelve el valor solo cuando el usuario deja de escribir durante `delay` ms.
// Se usa en Search.js para no consultar la API letra por letra.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
