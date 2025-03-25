import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { User } from '../types/User';

const Signing: React.FC = () => {
    const url_connect = import.meta.env.VITE_URL_CONNECT;

    const [userlogged, setUserLogged] = useState<User | undefined>(undefined);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFichado, setIsFichado] = useState(false);
    const [isResting, setIsResting] = useState(false);
    const [isWorkingExtra, setIsWorkingExtra] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('id'));
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
    const focusRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!userName) return;
        Axios.get(url_connect+`GetUserByName/${userName}`)
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

    useEffect(() => {
        if (focusRef.current) {
            focusRef.current.focus();
        }
    }, []);

    const handleAction = useCallback((actionType: 'entrada' | 'salida' | 'descanso' | 'extra') => {
        let tipo = '';
        let id = `${new Date().toLocaleString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('es-ES', { month: 'long' }).slice(1)} ${new Date().getFullYear()}`;

        switch (actionType) {
            case 'entrada':
                tipo = 'Entrada';
                Axios.post(url_connect+'PostSigning', {
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
                case 'salida':
                    tipo = 'Salida';
                    Axios.post(url_connect+'PostSigning', {
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
                Axios.post(url_connect+'PostSigning', {
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
                Axios.post(url_connect+'PostSigning', {
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
                <div ref={focusRef} tabIndex={-1} style={{ outline: 'none' }}>

                    {userName ? (
                        <div>¡Hola, {userName}!</div>
                    ) : (
                        <div>Cargando...</div>
                    )}

                    <IonButton onClick={() => handleAction('entrada')}>
                        Entrada
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
                    <IonButton onClick={() => handleAction('salida')}>
                        Salida
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Signing;
