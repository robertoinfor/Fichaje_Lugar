import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu } from '@ionic/react';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import CustomCalendar from '../components/Calendar';
import { useUserAndSignings } from '../hooks/useUserAndSignings';

const CalendarView: React.FC = () => {
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('id');

  const { eventos, isAdmin } = useUserAndSignings(userName, userId);
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
        {userName ? (
          <div>¡Hola, {userName}!</div>
        ) : (
          <div>Cargando...</div>
        )}

        <div className="calendar-section">
          <CustomCalendar events={eventos} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CalendarView;