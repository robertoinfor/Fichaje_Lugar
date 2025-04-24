import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonMenu } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { User } from '../types/User';
import CustomBttn from '../components/CustomBttn';
import { useVerifyLocation } from '../hooks/useVerifyLocation';
import Footer from '../components/Footer';
import './Signing.css';

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
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('id');
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
    const focusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!userName) return;
        Axios.get(url_connect + `users/${userName}`)
            .then(response => {
                setUserLogged(response.data.results[0]);
            })
            .catch(error => {
                console.log(error);
            });
    }, [userName]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            let storedTimestamp = localStorage.getItem('startTimestamp');
            if (!storedTimestamp) {
                storedTimestamp = Date.now().toString();
                localStorage.setItem('startTimestamp', storedTimestamp);
            }
            const startTimestamp = parseInt(storedTimestamp, 10);
            interval = setInterval(() => {
                setSeconds(Math.floor((Date.now() - startTimestamp) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        const storedFichado = localStorage.getItem('isFichado');
        if (storedFichado === 'true') {
            setIsFichado(true);
            setIsRunning(true);
        }
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
        let online = ''
        switch (actionType) {
            case 'entrada':
                tipo = 'Entrada';
                setIsRunning(true);
                setSeconds(0);
                setIsFichado(true);
                const now = Date.now();
                localStorage.setItem('startTimestamp', now.toString());
                localStorage.setItem('isFichado', 'true');
                online = "Trabajando"
                break;
            case 'salida':
                tipo = 'Salida';
                setIsRunning(!isFichado);
                setSeconds(0);
                setIsFichado(!isFichado);
                localStorage.removeItem('isFichado');
                localStorage.removeItem('startTimestamp');
                online = "Online"
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
        if (online == "") {
            Axios.post(url_connect + 'signings/', {
                Fecha_hora: new Date(),
                Empleado: userId,
                Localizacion: puntoCercano?.key,
                Tipo: tipo
            })
        } else {
            Axios.post(url_connect + 'signings/', {
                Fecha_hora: new Date(),
                Empleado: userId,
                Tipo: tipo,
                Localizacion: puntoCercano?.key
            }).then(() => {
                Axios.put(url_connect + 'users/' + userId + "/log", {
                    Conexion: online
                });
            })
        }
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
                {cargando ? (
                    <p>Verificando ubicación...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : puntoCercano && estaDentro ? (
                    <section className="signing-section">
                        <div className="signing-box">
                            {userlogged && (
                                <>
                                    <img
                                        src={userlogged.properties.Foto.files[0].external.url}
                                        alt="Usuario"
                                        className="signing-avatar"
                                    />
                                    <h2>Fichaje</h2>
                                </>
                            )}

                            <div className="login-divider" />
                            <div className="timer">{formatTime(seconds)}</div>
                            <div className="signing-buttons-wrapper">
                                <div className="button-row">
                                    <CustomBttn
                                        text="Entrada"
                                        onClick={() => handleAction('entrada')}
                                        disabled={isFichado}
                                        width="100%"
                                    />
                                </div>

                                <div className="button-row two-buttons">
                                    <CustomBttn
                                        text={isResting ? 'Terminar descanso' : 'Descanso'}
                                        onClick={() => handleAction('descanso')}
                                        disabled={!isFichado}
                                        width="100%"
                                    />
                                    <CustomBttn
                                        text={isWorkingExtra ? 'Terminar extra' : 'Horas extra'}
                                        onClick={() => handleAction('extra')}
                                        disabled={!isFichado}
                                        width="100%"
                                    />
                                </div>

                                <div className="button-row">
                                    <CustomBttn
                                        text="Salida"
                                        onClick={() => handleAction('salida')}
                                        disabled={!isFichado}
                                        width="100%"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <p style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>
                        ❌ No estás en una zona de fichaje autorizada.
                    </p>
                )}
                <Footer />
            </IonContent>
        </IonPage>
    );
};

export default Signing;
