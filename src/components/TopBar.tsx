import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
} from '@ionic/react';
import { arrowBack, menu as menuIcon } from 'ionicons/icons';
import { useNavigation } from '../hooks/useNavigation';
import './TopBar.css';

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
          <img src="/Logo_Lugar2.svg" alt="Logo Lugar Gestión Cultural" className="logo-img" />
        </div>

        <div className="toolbar-title-custom">FICHAPP</div>
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
