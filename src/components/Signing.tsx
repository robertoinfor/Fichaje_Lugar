import { IonContent, IonHeader, IonPage, IonRouterLink, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useState } from 'react';

interface Usuario {
    id: string,
    properties: {
        Nombre: {
            title:
            [{ plain_text: string }]
        },
        Email: { email: string },
        Pwd: { rich_text: [{ text: { content: string } }] },
        Rol: { select: { name: string } }
        Fecha_alta: { date: { start: string } }
    }
}

interface Fichaje {
    Empleado: string,
    Tipo: "Entrada" | "Salida" | "Horas extra" | "Descanso"
    Fecha_hora: Date
}

const Signing: React.FC = () => {
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('id')
    const [signings, setSignings] = useState<Fichaje[]>([])

    useEffect(() => {
        Axios.get('http://localhost:8000/GetSigningUser/' + userId)
            .then(response => {
                setSignings(response.data.results);
            }).catch(error => {
                console.log(error);
            });
    })

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
                        <p>FICHAJES</p>
                        {
                            signings.map((data: any) => {
                                return (
                                    <div key={data.id}>
                                        <p>Empleado: {userName}</p>
                                        <p>Tipo: {data.properties.Tipo.select.name}</p>
                                        <p>Fecha y hora: {data.properties.Fecha_hora.date.start}</p>
                                        <p>-------------------</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                </IonContent>
            </IonContent>
        </IonPage>
    );
};

export default Signing;