import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu, IonButton } from '@ionic/react';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useNavigation } from '../hooks/useNavigation';
import './AdminView.css'
import { Clock, MapPin, User } from 'lucide-react';
import Footer from '../components/Footer';
import { useAuthGuard } from '../hooks/useAuthUser';

const AdminView: React.FC = () => {
  useAuthGuard();
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const navigation = useNavigation();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol === 'Administrador') {
      setIsAdmin(true);
    }
  }, []);
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
                <h2 className="card-title">Modificar usuarios</h2>
                <p className="card-text">Añadir, eliminar o modificar usuarios.</p>
              </div>

              <div
                role="button"
                tabIndex={0}
                className="config-card"
                onClick={handleLocationsView}
              >
                <div className="card-icon"><MapPin size={28} /></div>
                <h2 className="card-title">Modificar localizaciones</h2>
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
                <p className="card-text">Ver, editar o añadir fichajes y generar informes.</p>
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
