import { IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>Nombre App</IonTitle>
        <IonButton slot="end" onClick={onMenuClick}>
          Abrir Menú
        </IonButton>
      </IonToolbar>
    </IonHeader>
  );
};

export default TopBar;
