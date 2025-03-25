import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonMenu } from '@ionic/react';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import GoogleMap from '../components/GoogleMap';

const MapView: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(true); // cambiar validación
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);

    return (
        <IonPage>
            <IonMenu side="end" content-id="main-content" ref={setMenu}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Menú</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Menu admin={isAdmin} />
                </IonContent>
            </IonMenu>
            <TopBar onMenuClick={() => menu?.open()} />
            <IonContent id="main-content">
               <GoogleMap></GoogleMap>
            </IonContent>
        </IonPage>
    );
};

export default MapView;
