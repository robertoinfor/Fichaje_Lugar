import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { User } from '../types/User';
import CustomBttn from '../components/CustomBttn';
import { useVerifyLocation } from '../hooks/useVerifyLocation';


const Signing: React.FC = () => {
    const url_connect = import.meta.env.VITE_URL_CONNECT;
    const { estaDentro, puntoCercano, cargando, error } = useVerifyLocation();
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
        Axios.get(url_connect + `GetUserByName/${userName}`)
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
        switch (actionType) {
            case 'entrada':
                tipo = 'Entrada';
                setIsRunning(!isFichado);
                setSeconds(0);
                setIsFichado(!isFichado);
                break;
            case 'salida':
                tipo = 'Salida';
                setIsRunning(!isFichado);
                setSeconds(0);
                setIsFichado(!isFichado);
                break;
            case 'descanso':
                tipo = isResting ? 'Terminado el descanso' : 'Descanso';
                setIsResting(!isResting);
                break;
            case 'extra':
                tipo = isWorkingExtra ? 'Terminadas horas extra' : 'Horas extra';
                setIsWorkingExtra(!isWorkingExtra);
                break;
        }
        console.log(puntoCercano?.key)
        Axios.post(url_connect + 'PostSigning', {
            Fecha_hora: new Date(),
            Empleado: userId,
            Tipo: tipo,
            Localizacion: puntoCercano?.key
        }).then(() => {

        })
    }, [isFichado, isResting, isWorkingExtra, userId, puntoCercano]);

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
                { cargando ? (
                    <p>Verificando ubicación...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : puntoCercano && estaDentro ? (
                    <div ref={focusRef} tabIndex={-1} style={{ outline: 'none' }}>

                        {userName ? (
                            <div>¡Hola, {userName}!
                                <img src={userlogged?.properties.Foto.files[0].external.url} />
                            </div>
                        ) : (
                            <div>Cargando...</div>
                        )}

                        <CustomBttn text='Entrada' onClick={() => handleAction('entrada')} />

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
                ) : (
                    <p style={{ color: 'red' }}>
                        ❌ No estás en una zona de fichaje autorizada.
                    </p>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Signing;
