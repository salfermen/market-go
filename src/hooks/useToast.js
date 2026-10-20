import { useCallback, useEffect, useRef, useState } from 'react';

// Mensajes cortos de confirmación ("Agregado al carrito").
//   const { toast, showToast } = useToast();
//   showToast('Guardado');           -> <Toast {...toast} />
export default function useToast(duration = 2200) {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const timer = useRef(null);

  const showToast = useCallback(
    (message, type = 'success') => {
      clearTimeout(timer.current);
      setToast({ visible: true, message, type });
      timer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showToast };
}
