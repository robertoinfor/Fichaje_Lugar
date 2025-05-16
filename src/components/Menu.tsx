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

    // Manejo el cierre de sesión 
    const handleLogOut = async () => {
        try {
            // Cambia el estado a desconectado
          await Axios.put(url_connect + "users/" + localStorage.getItem('id') + "/log", {
            Conexion: "Desconectado"
          });
      
          // Recojo el token FCM del usuario
          const { data } = await Axios.get(url_connect + "fcm/token/" + localStorage.getItem('id'));
          
          const token = data?.pageId;
      
          // Borro el token FCM del usuario
          if (token) {
            await Axios.delete(url_connect + "fcm/token/" + token);
          }
      
          // Borro los datos de inicio de sesión del dispositivo
          localStorage.removeItem('userName');
          localStorage.removeItem('id');
          localStorage.removeItem('rememberedUser')
          localStorage.removeItem('rememberedPwd')
          document.activeElement instanceof HTMLElement && document.activeElement.blur();

          // Vuelvo a la página de login y borro el historial
          navigation.push('/', 'forward', 'push');
          window.location.reload();
        } catch (err) {
          console.error("Error al cerrar sesión:", err);
        }
      };
      
    // Voy a la página para fichar
    const handleHome = () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        navigation.push('/home/signing', 'forward', 'push');
    };

    // Voy a la página de admin
    const handleAdmin = () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        navigation.push('/home/menu', 'forward', 'push');
    };

    // Voy a la página de mis fichajes
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
            // Muestro las opciones básicas si existe un usuario loggeado
                (username && username !== "") && (
                    <>
                        <IonItem button onClick={handleHome}>
                            <IonLabel>Inicio</IonLabel>
                        </IonItem>
                        <IonItem button onClick={handleViewHistory}>
                            <IonLabel>Ver mi historial</IonLabel>
                        </IonItem>
                        {/* Si es administrador, muestro la opción */}
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
