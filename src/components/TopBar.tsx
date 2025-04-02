import { IonButton, IonHeader, IonToolbar, IonTitle, useIonRouter } from '@ionic/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useNavigation } from '../hooks/useNavigation';
import './TopBar.css'

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
      <IonToolbar className="custom-toolbar">
        <div className="toolbar-content">
          <img src="/Logo_Lugar2.svg" alt="Logo La Lugar" className="logo-img" />
          <div className="title">FICHAPP</div>
          <div className="toolbar-buttons">
            {username && username !== "" && (
              <IonButton fill="clear" onClick={returnView}>
                ⬅️
              </IonButton>
            )}
            <IonButton fill="clear" onClick={onMenuClick}>
              ☰
            </IonButton>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>

  );
};

export default TopBar;
