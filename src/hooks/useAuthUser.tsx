import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export function useAuthGuard(requiredRole?: string) {
  const history = useHistory();

  useEffect(() => {
    const id = localStorage.getItem('id');
    const rol = localStorage.getItem('rol');

    if (!id || (requiredRole && rol !== requiredRole)) {
      history.replace('/');
    }
  }, []);
}
