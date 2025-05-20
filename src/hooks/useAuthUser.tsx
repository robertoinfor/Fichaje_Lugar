import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Función para que, en caso de darle al return y haber cerrado la sesión, te vuelva a la página de login
export function useAuthGuard() {
  const history = useHistory();

  useEffect(() => {
    const id = localStorage.getItem('id');
    const rol = localStorage.getItem('rol');

    if (!id || !rol) {
      history.replace('/');
    }
  }, []);
}
