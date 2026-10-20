import { useEffect, useState } from 'react';

// Cuenta regresiva en segundos para la "Oferta relámpago".
// Al llegar a cero vuelve a empezar (simula una nueva ronda de ofertas).
export default function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s <= 1 ? initialSeconds : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds]);

  return seconds;
}
