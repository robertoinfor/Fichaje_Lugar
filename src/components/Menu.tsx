import { IonList, IonLabel, IonItem, useIonRouter } from '@ionic/react';
import { useNavigation } from '../hooks/useNavigation';
import  Axios  from 'axios';

interface MenuProps {
    admin: boolean
}

const Menu: React.FC<MenuProps> = ({ admin }) => {
    const navigation = useNavigation();
    const username = localStorage.getItem("userName");
    const url_connect = import.meta.env.VITE_URL_CONNECT;

    const handleLogOut = () => {
        Axios.put(url_connect + 'UpdateUserLog/' + localStorage.getItem('id'), {
            Conexion: "Desconectado"
        });
        localStorage.removeItem('username');
        localStorage.removeItem('id');
        navigation.push('/', 'forward', 'push');
        window.location.reload();
    };

    const handleAdmin = () => {
        navigation.push('/home/menu' , 'forward', 'push');
    };

    const handleViewHistory = () => {
        navigation.push('/home/signing/calendar', 'forward', 'push');
    };

    const handleConfig = () => {
        navigation.push('/home/signing/config', 'forward', 'push')
    }
    return (
        <IonList>
            {
                (username && username !== "") && (
                    <>
                        <IonItem button onClick={handleViewHistory}>
                            <IonLabel>Ver mi historial</IonLabel>
                        </IonItem>
                        {admin && (
                            <IonItem button onClick={handleAdmin}>
                                <IonLabel>Modo Administrador</IonLabel>
                            </IonItem>
                        )}
                        <IonItem button onClick={handleLogOut}>
                            <IonLabel>Cerrar sesión</IonLabel>
                        </IonItem>
                    </>
                )
            }
            <IonItem button onClick={handleConfig}>
                <IonLabel>Ajustes</IonLabel>
            </IonItem>
        </IonList>
    );
};

export default Menu;
