import { IonButton, IonHeader, IonToolbar, IonTitle, useIonRouter } from '@ionic/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useNavigation } from '../hooks/useNavigation';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigation = useNavigation();
  const username = localStorage.getItem("userName");
  const location = useLocation();

  const returnView = () => {
      navigation.goBack();
    }

    useEffect(() => {
      if (location.pathname === '/' || location.pathname === '/home') {
        localStorage.removeItem('userName');
        localStorage.removeItem('id');
      }
    }, [location]);

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>Nombre App</IonTitle>
        <IonButton slot="end" onClick={onMenuClick}>
        ☰
        </IonButton>
        {username && username !== "" && (
          <IonButton onClick={returnView}>
            ⬅️
          </IonButton>
        )}
        
    </IonToolbar>
    </IonHeader >
  );
};

export default TopBar;
