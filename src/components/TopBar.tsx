import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonIcon,
} from '@ionic/react';
import { arrowBack, menu as menuIcon } from 'ionicons/icons';
import { useNavigation } from '../hooks/useNavigation';
import './TopBar.css';
import { useEffect } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigation = useNavigation();
  let username = localStorage.getItem("userName");

  const returnView = () => {
    if (location.pathname === '/home/signing' || location.pathname === '/home' ) {
      localStorage.removeItem('userName');
      localStorage.removeItem('id');
      username=""
    }
    (document.activeElement as HTMLElement)?.blur();
    navigation.goBack();
  };
  
  return (
    <IonHeader>
      <IonToolbar className="custom-toolbar">
        <div slot="start" className="toolbar-start">
        {username && (
            <IonButton fill="clear" onClick={returnView}>
              <IonIcon icon={arrowBack}/>
            </IonButton>
          )}
          <img src="/Logo_Lugar2.svg" alt="Logo La Lugar" className="logo-img" />
        </div>

        <h1 className="toolbar-title-custom">FICHAPP</h1>

        <IonButtons slot="end">
          <IonButton fill="clear" onClick={onMenuClick}>
            <IonIcon icon={menuIcon} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default TopBar;
