import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu } from '@ionic/react';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import CustomCalendar from '../components/CustomCalendar';
import { useUserAndSignings } from '../hooks/useUserAndSignings';
import './CalendarView.css'
import Footer from '../components/Footer';
import { useAuthGuard } from '../hooks/useAuthUser';

const CalendarView: React.FC = () => {
  useAuthGuard();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('id');


  // Compruebo el rol del usuario
  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol === 'Administrador') {
      setIsAdmin(true);
    }
  }, []);

  // Recojo los eventos del usuario loggeado
  const { signings } = useUserAndSignings(userName, userId);

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
        <section className="calendar-section">
          <div className="calendar-box">
            <h1 className="config-title">Mis fichajes</h1>
            <div className="config-divider" />
            <div className="calendar-container">
              <CustomCalendar events={signings} />
            </div>
          </div>
        </section>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default CalendarView;