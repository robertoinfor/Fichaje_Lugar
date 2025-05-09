import { IonList, IonLabel, IonItem } from '@ionic/react';
import { useNavigation } from '../hooks/useNavigation';
import Axios from 'axios';
import './Menu.css'

interface MenuProps {
    admin: boolean
}

const Menu: React.FC<MenuProps> = ({ admin }) => {
    const navigation = useNavigation();
    const username = localStorage.getItem("userName");
    const url_connect = import.meta.env.VITE_URL_CONNECT;

    const handleLogOut = async () => {
        try {
          await Axios.put(url_connect + "users/" + localStorage.getItem('id') + "/log", {
            Conexion: "Desconectado"
          });
      
          const { data } = await Axios.get(url_connect + "fcm/token/" + localStorage.getItem('id'));
          console.log(data);
          
          const token = data?.pageId;
      
          if (token) {
            await Axios.delete(url_connect + "fcm/token/" + token);
          }
      
          localStorage.removeItem('userName');
          localStorage.removeItem('id');
          document.activeElement instanceof HTMLElement && document.activeElement.blur();
          navigation.push('/', 'forward', 'push');
          window.location.reload();
        } catch (err) {
          console.error("Error al cerrar sesión:", err);
        }
      };
      

    const handleHome = () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        navigation.push('/home/signing', 'forward', 'push');
    };

    const handleAdmin = () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        navigation.push('/home/menu', 'forward', 'push');
    };

    const handleViewHistory = () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        navigation.push('/home/signing/calendar', 'forward', 'push');
    };
// cambiar
    const handleConfig = () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        // navigation.push('/', 'forward', 'push')
    }
    return (
        <IonList>
            {
                (username && username !== "") && (
                    <>
                        <IonItem button onClick={handleHome}>
                            <IonLabel>Inicio</IonLabel>
                        </IonItem>
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
