import { useState, useEffect } from 'react';
import { useSignings } from './useSignings';
import { User } from '../types/User';
import Axios from 'axios';

export const useUserAndSignings = (userName: string | null, userId: string | null) => {
  const url_connect = import.meta.env.VITE_URL_CONNECT;

  const [userLogged, setUserLogged] = useState<User | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  // Recojo los fichajes del usuario
  const signings = useSignings(userId || '');

  // Recojo el id del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Axios.get(url_connect+`users/${userName}`);
        setUserLogged(response.data.results[0]);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (userName) {
      fetchUser();
    }
  }, [userName]);

  useEffect(() => {
    if (userLogged && userLogged.properties.Rol.select.name === 'Administrador') {
      setIsAdmin(true);
    }
  }, [userLogged]);

  return { signings, isAdmin, userLogged };
};
