import { useIonRouter } from '@ionic/react';

// Función para utilizar la misma navegación en toda la app
export const useNavigation = () => {
  const navigation = useIonRouter();
  return navigation;
};