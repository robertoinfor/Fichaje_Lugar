import { IonButton, IonHeader, IonToolbar, IonTitle, useIonRouter } from '@ionic/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigation = useIonRouter();
  const username = localStorage.getItem("userName");
  const location = useLocation();

  const returnView = () => {
    if (window.history.length > 2) {
      navigation.goBack();
    } else {
      navigation.push('/signing');
    }  }

    useEffect(() => {
      if (location.pathname === '/' || location.pathname === '/home') {
        localStorage.removeItem('userName');
        localStorage.removeItem('id');
        console.log("datos borrados", username, localStorage.getItem('id'))
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
