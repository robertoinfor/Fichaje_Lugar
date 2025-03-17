import { useIonRouter } from '@ionic/react';

export const useNavigation = () => {
  const navigation = useIonRouter();
  return navigation;
};