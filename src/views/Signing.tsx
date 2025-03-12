import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';

interface Usuario {
    id: string,
    properties: {
        Nombre: {
            title: [{ plain_text: string }];
        },
        Rol: { select: { name: string } };
    };
}

export interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    type: string;
}

interface Fichaje {
    id: string;
    properties: {
        Id: { title: [{ text: { content: string } }] };
        Tipo: { select: { name: string } };
        Fecha_hora: { date: { start: string } };
        Hora: { formula: { string: string } };
    };
}

const Signing: React.FC = () => {
    const navigation = useIonRouter();
    const [userlogged, setUserLogged] = useState<Usuario | undefined>(undefined);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFichado, setIsFichado] = useState(false);
    const [isResting, setIsResting] = useState(false);
    const [isWorkingExtra, setIsWorkingExtra] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('id'));
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);

    useEffect(() => {
        if (!userName) return;
        Axios.get(`http://localhost:8000/GetUserByName/${userName}`)
            .then(response => {
                setUserLogged(response.data.results[0]);
            })
            .catch(error => {
                console.log(error);
            });
    }, [userName]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
    
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else if (!isRunning && interval) {
            clearInterval(interval);
        }
    
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    useEffect(() => {
        if (userlogged && userlogged.properties.Rol.select.name === "Administrador") {
            setIsAdmin(true);
        }
    }, [userlogged]);

    const handleAction = useCallback((actionType: 'fichaje' | 'descanso' | 'extra') => {
        let tipo = '';
        let id = `${new Date().toLocaleString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('es-ES', { month: 'long' }).slice(1)} ${new Date().getFullYear()}`;

        switch (actionType) {
            case 'fichaje':
                tipo = isFichado ? 'Salida' : 'Entrada';
                Axios.post('http://localhost:8000/PostSigning', {
                    Id: id,
                    Fecha_hora: new Date(),
                    Empleado: userId,
                    Tipo: tipo,
                }).then(() => {
                    setIsRunning(!isFichado);
                    setSeconds(0);
                    setIsFichado(!isFichado);
                }).catch((error) => {
                    console.log(error);
                });
                break;
            case 'descanso':
                tipo = isResting ? 'Terminado el descanso' : 'Descanso';
                Axios.post('http://localhost:8000/PostSigning', {
                    Id: id,
                    Fecha_hora: new Date(),
                    Empleado: userId,
                    Tipo: tipo
                }).then(() => {
                    setIsResting(!isResting);
                }).catch((error) => {
                    console.log(error);
                });
                break;
            case 'extra':
                tipo = isWorkingExtra ? 'Terminadas horas extra' : 'Horas extra';
                Axios.post('http://localhost:8000/PostSigning', {
                    Id: id,
                    Fecha_hora: new Date(),
                    Empleado: userId,
                    Tipo: tipo
                }).then(() => {
                    setIsWorkingExtra(!isWorkingExtra);
                }).catch((error) => {
                    console.log(error);
                });
                break;
        }
    }, [isFichado, isResting, isWorkingExtra, userId]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleViewHistory = () => {
        navigation.push('/calendar');
        menu?.close();
    };

    return (
        <IonPage>
            <IonMenu side="end" content-id="main-content" ref={setMenu}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Menú</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Menu admin = {isAdmin}/>
                </IonContent>
            </IonMenu>

            <TopBar onMenuClick={() => menu?.open()} />

            <IonContent id="main-content">
                {userName ? (
                    <div>¡Hola, {userName}!</div>
                ) : (
                    <div>Cargando...</div>
                )}

                <IonButton onClick={() => handleAction('fichaje')}>
                    {isFichado ? 'Terminar turno' : 'Fichar'}
                </IonButton>
                <p>Tiempo trabajado: {formatTime(seconds)}</p>

                {isFichado && (
                    <>
                        <IonButton onClick={() => handleAction('descanso')}>
                            {isResting ? 'Terminar descanso' : 'Descanso'}
                        </IonButton>

                        <IonButton onClick={() => handleAction('extra')}>
                            {isWorkingExtra ? 'Terminar horas extra' : 'Iniciar horas extra'}
                        </IonButton>
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Signing;
