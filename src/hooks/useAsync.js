import { useCallback, useEffect, useState } from 'react';

// Ejecuta una función asíncrona (normalmente de src/api) y expone
// { data, loading, error, reload } para pintar los estados de carga y error.
//
//   const { data: products, loading } = useAsync(() => getProducts({ category }), [category]);
export default function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true; // evita actualizar el estado si la pantalla ya se cerró
    setState((prev) => ({ ...prev, loading: true, error: null }));

    asyncFn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, reload };
}
