import { IonButton, IonContent, IonHeader, IonPage, IonRouterLink, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import dayjs from 'dayjs'


const localizer = dayjsLocalizer(dayjs)


interface Usuario {
    id: string,
    properties: {
        Nombre: {
            title:
            [{ plain_text: string }]
        },
        Email: { email: string },
        Pwd: { rich_text: [{ text: { content: string } }] },
        Rol: { select: { name: string } },
        Fecha_alta: { date: { start: string } },
        Horas: { number: number }
    }
}

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    type: string;
}

interface Fichaje {
    id: string,
    properties: {
      Empleado: { relation: [{ id: string }] },
      Tipo: { select: { name: string } },
      Fecha_hora: { date: { start: string } },
      Hora: { formula: { string: string } },
      Fecha: { formula: { string: string } }
    }
  }

const Signing: React.FC = () => {
    const navigation = useIonRouter();
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('id');
    const [signings, setSignings] = useState<Fichaje[]>([]);
    const [userlogged, setUserLogged] = useState<Usuario>()
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFichado, setIsFichado] = useState(false);
    const [isResting, setIsResting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false)
    const [isWorkingExtra, setIsWorkingExtra] = useState(false)
    const [events, setEvents] = useState<CalendarEvent[]>([]);


    useEffect(() => {
        Axios.get('http://localhost:8000/GetSigningUser/' + userId)
            .then(response => {
                setSignings(response.data.results);
                const eventos = convertirFichajesAEventos(signings);
                setEvents(eventos);
            }).catch(error => {
                console.log(error);
            });
            //console.log(events)
    })

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        Axios.get('http://localhost:8000/GetUserByName/' + userName)
            .then(response => {
                setUserLogged(response.data.results[0]);
            }).catch(error => {
                console.log(error);
            });
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

    const handleFichaje = () => {
        const tipo = isFichado ? 'Salida' : 'Entrada';
        Axios.post('http://localhost:8000/PostSigning', {
            Fecha_hora: new Date(),
            Empleado: localStorage.getItem('id'),
            Tipo: tipo,
            Id: "1"
        }).then(() => {
            setIsRunning(true);
            setSeconds(0);
            if (!isFichado) {
                setIsFichado(true);
            } else {
                setIsRunning(false);
                setSeconds(0);
                setIsFichado(false);
            }
            setSeconds(0);
        }).catch((error) => {
            console.log(error);
        })
    }

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleBreak = () => {
        const tipo = isResting ? 'Terminado el descanso' : 'Descanso'
        Axios.post('http://localhost:8000/PostSigning', {
            Fecha_hora: new Date(),
            Empleado: localStorage.getItem('id'),
            Tipo: tipo,
            Id: "1"
        }).then(() => {
            if (!isResting) {
                setIsResting(true);
            } else {
                setIsResting(false)
            }
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleExtra = () => {
        const tipo = isWorkingExtra ? 'Terminadas horas extra' : 'Horas extra'
        Axios.post('http://localhost:8000/PostSigning', {
            Fecha_hora: new Date(),
            Empleado: localStorage.getItem('id'),
            Tipo: tipo,
            Id: ""
        }).then(() => {
            if (!isWorkingExtra) {
                setIsWorkingExtra(true);
            } else {
                setIsWorkingExtra(false)
            }
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleAdmin = () => {
        navigation.push('/adduser');
        window.location.href = '/adduser';
    }

    const handleLogOut = () => {
        localStorage.removeItem('username')
        localStorage.removeItem('id')
        navigation.push('/');
        window.location.href = '/';
    }

    const convertirFichajesAEventos = (fichajes: Fichaje[]) => {
        return fichajes.map(fichaje => {
            const start = dayjs(fichaje.properties.Fecha.formula.string + 'T' + fichaje.properties.Hora.formula.string).toDate();
            const end = dayjs(start).toDate();

            return {
                title: `${fichaje.properties.Tipo.select.name} ${fichaje.properties.Hora.formula.string}`,
                start: start,
                end: end,
                allDay: false,
                type: fichaje.properties.Tipo.select.name,
            };
        });
    };

    const eventColors: Record<string, string> = {
        "Entrada": "green",
        "Salida": "red",
        "Horas extra": "blue",
        "Terminadas horas extra": "darkblue",
        "Descanso": "orange",
        "Terminado el descanso": "darkorange",
    };

    const getEventStyle = (event: CalendarEvent) => {
        const backgroundColor = eventColors[event.type] || "gray"; // Color por defecto si el tipo no coincide
        return { style: { backgroundColor, color: "white", borderRadius: "5px", padding: "5px" } };
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Blank</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Blank</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {userName ? (
                        <div>¡Hola, {userName}!</div>
                    ) : (
                        <div>Cargando...</div>
                    )}

                    <div className="Signings">
                        <p>Fichajes de {userName}</p>
                        {
                            signings.map((data: any) => {
                                return (
                                    <div key={data.id}>
                                        <p>Empleado: {userName}</p>
                                        <p>Tipo: {data.properties.Tipo.select.name}</p>
                                        <p>Fecha: {data.properties.Fecha.formula.string}</p>
                                        <p>Hora: {data.properties.Hora.formula.string}</p>
                                        <p>-------------------</p>
                                    </div>
                                )
                            })
                        }
                        <div className="calendar-section">
                            <Calendar
                                localizer={localizer}
                                events={ events }
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: "95vh", width: "95vw" }}
                                eventPropGetter={getEventStyle}
                            />
                        </div>
                        <IonButton onClick={handleFichaje}>
                            {isFichado ? 'Terminar turno' : 'Fichar'}
                        </IonButton>
                        <p>Tiempo trabajado: {formatTime(seconds)}</p>
                        {isFichado && (
                            <>
                                <IonButton onClick={handleBreak}>{isResting ? 'Terminar descanso' : 'Descanso'}</IonButton>
                                <IonButton onClick={handleExtra}>{isWorkingExtra ? 'Terminar horas extra' : 'Iniciar horas extra'}</IonButton>
                            </>

                        )}
                        <p>
                            {isAdmin && (
                                <IonButton onClick={handleAdmin}>Modo Administrador</IonButton>)
                            }
                        </p>

                        <p>
                            <IonButton onClick={handleLogOut}>Cerrar Sesión</IonButton>
                        </p>
                    </div>
                </IonContent>
            </IonContent>
        </IonPage>
    );
};

export default Signing;