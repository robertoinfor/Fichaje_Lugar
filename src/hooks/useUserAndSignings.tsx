import { useState, useEffect } from 'react';
import { useSignings } from './useSignings';
import { User } from '../types/User';
import Axios from 'axios';

export const useUserAndSignings = (userName: string | null, userId: string | null) => {
  const [userLogged, setUserLogged] = useState<User | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  const signings = useSignings(userId || '');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Axios.get(`http://localhost:8000/GetUserByName/${userName}`);
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

  return { eventos: signings, isAdmin, userLogged };
};
