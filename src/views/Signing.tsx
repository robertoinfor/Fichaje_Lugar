import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonMenu, IonModal } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { User } from '../types/User';
import CustomBttn from '../components/CustomBttn';
import { useVerifyLocation } from '../hooks/useVerifyLocation';
import Footer from '../components/Footer';
import './Signing.css';
import { useAuthGuard } from '../hooks/useAuthUser';

const Signing: React.FC = () => {
    useAuthGuard();
    const url_connect = import.meta.env.VITE_URL_CONNECT;
    const { isInside, nearPoint, loading, error, checkLocation } = useVerifyLocation();
    const [userlogged, setUserLogged] = useState<User | undefined>(undefined);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [isResting, setIsResting] = useState(false);
    const [isWorkingExtra, setIsWorkingExtra] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('id');
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
    const [action, setAction] = useState<'entrada' | 'salida' | 'descanso' | 'extra' | null>(null);
    const [modalText, setModalText] = useState('');

    const focusRef = useRef<HTMLDivElement>(null);

    // Comprobación de si el usuario es Administrador
    useEffect(() => {
        const rol = localStorage.getItem('rol');
        if (rol === 'Administrador') {
            setIsAdmin(true);
        }
    }, []);

    // Recoge el usuario loggeado
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

    // Guarda de forma local el tiempo trabajado al darle a "Entrada"
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

    // Recoge si el usuario loggeado ha fichado anteriormente y comprueba si es administrador
    useEffect(() => {
        const storedFichado = localStorage.getItem('isFichado');
        if (storedFichado === 'true') {
            setIsSigned(true);
            setIsRunning(true);
        }
        if (userlogged && userlogged.properties.Rol.select.name === "Administrador") {
            setIsAdmin(true);
        }
    }, [userlogged]);

    // Guarda el focus para no perder la selección
    useEffect(() => {
        if (focusRef.current) {
            focusRef.current.focus();
        }
    }, []);

    const openModal = (text: string, type: string) => {

    }

    const handleAction = useCallback((actionType: 'entrada' | 'salida' | 'descanso' | 'extra') => {
        let tipo = '';
        let online = ''
        switch (actionType) {
            case 'entrada':
                tipo = 'Entrada';
                setIsRunning(true);
                setSeconds(0);
                setIsSigned(true);
                const now = Date.now();
                localStorage.setItem('startTimestamp', now.toString());
                localStorage.setItem('isFichado', 'true');
                online = "Trabajando"
                break;
            case 'salida':
                tipo = 'Salida';
                setIsRunning(!isSigned);
                setSeconds(0);
                setIsSigned(!isSigned);
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
                Empleado: userId,
                Localizacion: nearPoint?.key,
                Tipo: tipo
            })
        } else {
            Axios.post(url_connect + 'signings/', {
                Empleado: userId,
                Tipo: tipo,
                Localizacion: nearPoint?.key
            }).then(() => {
                Axios.put(url_connect + 'users/' + userId + "/log", {
                    Conexion: online
                });
            })
        }
    }, [isSigned, isResting, isWorkingExtra, userId, nearPoint]);

    // Formatea la hora para mostrar el tiempo trabajado desde que entró
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    return (
        <IonPage>
            <IonMenu side="end" contentId="main-content" ref={setMenu}>
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
                <section className="signing-section">
                    <div className="signing-box">
                        {/* Mientras no se haya verificada la ubicación muestra una pestaña de carga */}
                        {loading ? (
                            <p>🔄 Verificando ubicación…</p>
                            // En caso de error lo muestra y muestra un botón para recargarla
                        ) : error ? (
                            <>
                                <p style={{ color: 'red' }}>{error}</p>
                                <CustomBttn text="Recargar ubicación" onClick={checkLocation} />
                            </>
                            // Si estoy dentro de un punto de fichaje y, por lo tanto, tengo un punto cercano, muestro 
                            //  los botones para fichar
                        ) : nearPoint && isInside ? (
                            <>
                                {userlogged && (
                                    <>
                                        <img
                                            src={userlogged.properties.Foto.files[0].external.url}
                                            alt="Usuario"
                                            className="signing-avatar"
                                        />
                                    </>
                                )}
                                <h2>Fichaje</h2>
                                <div className="login-divider" />
                                <div className="timer">{formatTime(seconds)}</div>
                                <div className="signing-buttons-wrapper">
                                    <div className="button-row">
                                        <CustomBttn
                                            text="Entrada"
                                            onClick={() => {
                                                setModalText("¿Quieres fichar la entrada?");
                                                setAction('entrada')
                                            }}
                                            disabled={isSigned}
                                            width="100%"
                                        />
                                    </div>

                                    <div className="button-row two-buttons">
                                        <CustomBttn
                                            text={isResting ? 'Terminar descanso' : 'Descanso'}
                                            onClick={() => {
                                                setModalText(isResting ? '¿Quieres terminar el descanso?' : '¿Quieres empezar el descanso?');
                                                setAction('descanso')
                                            }}
                                            disabled={!isSigned || isWorkingExtra}
                                            width="100%"
                                        />
                                        <CustomBttn
                                            text={isWorkingExtra ? 'Terminar extra' : 'Horas extra'}
                                            onClick={() => {
                                                setModalText(isWorkingExtra ? '¿Quieres terminar las horas extra?' : '¿Vas a empezar las horas extra?');
                                                setAction('extra')
                                            }} disabled={!isSigned || isResting}
                                            width="100%"
                                        />
                                    </div>

                                    <div className="button-row">
                                        <CustomBttn
                                            text="Salida"
                                            onClick={() => {
                                                setModalText("¿Quieres fichar la salida?");
                                                setAction('salida')
                                            }} disabled={!isSigned || isWorkingExtra || isResting}
                                            width="100%"
                                        />
                                    </div>
                                </div>
                            </>
                            // En caso de no estar en una zona para fichar, lo muestra
                        ) : (
                            <>
                                <p style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>
                                    ❌ No estás en una zona de fichaje autorizada.
                                </p>
                                <CustomBttn text="Recargar ubicación" onClick={checkLocation} />
                            </>
                        )}
                    </div>
                </section>
                <Footer />
                <IonModal isOpen={action !== null} onDidDismiss={() => setAction(null)} className="no-wrapper-modal">
                    <div className="modal-wrapper">
                        <h2>{modalText}</h2>
                        <div className="modal-buttons">
                            <CustomBttn
                                text="Confirmar"
                                onClick={() => {
                                    if (action) {
                                        handleAction(action);
                                    }
                                    setAction(null);
                                }}
                            />
                            <CustomBttn text="Cancelar" onClick={() => setAction(null)} />
                        </div>
                    </div>
                </IonModal>
            </IonContent>
        </IonPage >
    );
};

export default Signing;
