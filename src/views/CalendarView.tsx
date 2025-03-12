import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter, IonMenu, IonList, IonItem, IonLabel } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import CustomCalendar from '../components/Calendar';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';

interface Usuario {
    id: string,
    properties: {
        Nombre: {
            title: [{ plain_text: string }];
        },
        Email: { email: string },
        Pwd: { rich_text: [{ text: { content: string } }] },
        Rol: { select: { name: string } },
        Fecha_alta: { date: { start: string } },
        Horas: { number: number };
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
        Id: { title: [{ text: { content: string } }] },
        Empleado: { relation: [{ id: string }] },
        Tipo: { select: { name: string } },
        Fecha_hora: { date: { start: string } },
        Hora: { formula: { string: string } },
        Fecha: { formula: { string: string } };
    };
}

const CalendarView: React.FC = () => {
    const navigation = useIonRouter();
    const [signings, setSignings] = useState<Fichaje[]>([]);
    const [userlogged, setUserLogged] = useState<Usuario | undefined>();
    const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('id'));
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

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

    const eventos = useMemo(() => {
        return convertirFichajesAEventos(signings);
    }, [signings]);

    useEffect(() => {
        const fetchSignings = async () => {
            try {
                const response = await Axios.get('http://localhost:8000/GetSigningUser/' + userId);
                setSignings(response.data.results);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSignings();
    }, [userId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await Axios.get('http://localhost:8000/GetUserByName/' + userName);
                setUserLogged(response.data.results[0]);
            } catch (error) {
                console.error(error);
            }
        };

        if (userName) {
            fetchUser();
        }
    }, [userName]);

    useEffect(() => {
        if (userlogged && userlogged.properties.Rol.select.name === "Administrador") {
            setIsAdmin(true);
        }
    }, [userlogged]);



    return (
        <IonPage>
            <IonMenu side="end" content-id="main-content" ref={setMenu}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Menú</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Menu admin={isAdmin}></Menu>
                </IonContent>
            </IonMenu>

            <TopBar onMenuClick={() => menu?.open()} />

            <IonContent id="main-content">
                {userName ? (
                    <div>¡Hola, {userName}!</div>
                ) : (
                    <div>Cargando...</div>
                )}

                <div className="calendar-section">
                    <CustomCalendar events={eventos} />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CalendarView;
