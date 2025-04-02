import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu, IonButton } from '@ionic/react';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useUserAndSignings } from '../hooks/useUserAndSignings';
import { useNavigation } from '../hooks/useNavigation';

const ConfigView: React.FC = () => {
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('id');
  const navigation = useNavigation();

  const { isAdmin } = useUserAndSignings(userName, userId);

  const handleUsersView = () => {
    navigation.push('/home/menu/adduser', 'forward')
  }
  const handleHistoryView = () => {
    navigation.push('/home/menu/allsignings', 'forward')
  }  
  const handleLocationsView = () => {
    navigation.push('/home/menu/places', 'forward')
  }

  return (
    <IonPage>
      <IonMenu side="end" content-id="main-content" ref={setMenu}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menú</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Menu admin={isAdmin}></Menu>
        </IonContent>
      </IonMenu>

      <TopBar onMenuClick={() => menu?.open()} />

      <IonContent id="main-content">
        <IonButton onClick={handleUsersView}>Editar usuarios</IonButton>
        <IonButton onClick={handleLocationsView}>Modificar ubicaciones</IonButton>
        <IonButton onClick={handleHistoryView}>Modificar fichajes</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ConfigView;
