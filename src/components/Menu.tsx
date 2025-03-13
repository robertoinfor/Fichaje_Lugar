import { IonContent, IonButton, IonList, IonLabel, IonItem, useIonRouter } from '@ionic/react';

interface MenuProps {
    admin: boolean
}

const Menu: React.FC<MenuProps> = ({ admin }) => {
    const navigation = useIonRouter();
    const username = localStorage.getItem("userName");


    const handleLogOut = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('id');
        navigation.push('/');
    };

    const handleAdmin = () => {
        navigation.push('/adduser');
        window.location.href = '/adduser';
    };

    const handleViewHistory = () => {
        navigation.push('/calendar');
    };
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
                    </>
                )
            }
            <IonItem button onClick={handleLogOut}>
                <IonLabel>Ajustes</IonLabel>
            </IonItem>
            <IonItem button onClick={handleLogOut}>
                <IonLabel>Cerrar sesión</IonLabel>
            </IonItem>
        </IonList>
    );
};

export default Menu;
