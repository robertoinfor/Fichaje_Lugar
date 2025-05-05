import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu, IonButton } from '@ionic/react';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useUserAndSignings } from '../hooks/useUserAndSignings';
import { useNavigation } from '../hooks/useNavigation';
import './AdminView.css'
import { Clock, MapPin, User } from 'lucide-react';
import Footer from '../components/Footer';

const AdminView: React.FC = () => {
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
        <section className="config-section">
          <div className="config-box">
            <h1 className="config-title">Modo administrador</h1>
            <div className="config-divider" />

            <div className="config-cards">
              <div
                role="button"
                tabIndex={0}
                className="config-card"
                onClick={handleUsersView}
              >
                <div className="card-icon"><User size={28} /></div>
                <h2 className="card-title">Editar usuarios</h2>
                <p className="card-text">Añadir, eliminar o modificar usuarios.</p>
              </div>

              <div
                role="button"
                tabIndex={0}
                className="config-card"
                onClick={handleLocationsView}
              >
                <div className="card-icon"><MapPin size={28} /></div>
                <h2 className="card-title">Modificar ubicaciones</h2>
                <p className="card-text">Añadir, eliminar o modificar ubicaciones.</p>
              </div>

              <div
                role="button"
                tabIndex={0}
                className="config-card"
                onClick={handleHistoryView}
              >
                <div className="card-icon"><Clock size={28} /></div>
                <h2 className="card-title">Modificar fichajes</h2>
                <p className="card-text">Visualizar, editar o añadir fichajes.</p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default AdminView;
