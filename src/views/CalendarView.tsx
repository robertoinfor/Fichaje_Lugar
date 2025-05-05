import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu } from '@ionic/react';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import CustomCalendar from '../components/Calendar';
import { useUserAndSignings } from '../hooks/useUserAndSignings';
import './CalendarView.css'
import Footer from '../components/Footer';

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
        <section className="calendar-section">
          <div className="calendar-box">
            <CustomCalendar events={eventos} />
          </div>
        </section>
        <Footer/>
      </IonContent>
    </IonPage>
  );
};

export default CalendarView;