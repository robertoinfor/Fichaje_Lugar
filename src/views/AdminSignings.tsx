import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonMenu, IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import Axios from 'axios';
import dayjs from 'dayjs';
import CustomCalendar from '../components/Calendar';
import { CalendarEvent } from '../types/CalendarEvent';
import { Signing } from '../types/Signing';
import { User } from '../types/User';
import Menu from '../components/Menu';
import TopBar from '../components/TopBar';

const url_connect = import.meta.env.VITE_URL_CONNECT;

const AdminSignings: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isAdmin = false; // cambiar
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    Empleado: '',
    Tipo: '',
    Fecha_hora: '',
    fecha: '',
    hora: ''
  });

  const mapFichajeToEvent = (fichaje: Signing, users: User[]): CalendarEvent => {
    const dateString = fichaje.properties.Fecha.formula.string;
    const timeString = fichaje.properties.Hora.formula.string;
    const startDate = dayjs(`${dateString}T${timeString}`).toDate();

    const empleadoId = fichaje.properties.Empleado.relation[0]?.id;
    const usuario = users.find(u => u.id === empleadoId);
    const empleadoNombre = usuario ? usuario.properties.Nombre.title[0].plain_text : "Desconocido";

    return {
      empleadoId: empleadoId,
      id: fichaje.id,
      title: `${empleadoNombre} - ${timeString}`,
      start: startDate,
      end: startDate,
      allDay: false,
      type: fichaje.properties.Tipo.select.name,
    };
  };

  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    try {
      const response = await Axios.get(url_connect + 'GetAllSignings');
      const fichajes: Signing[] = response.data.results;
      const mappedEvents = fichajes.map((fichaje: Signing) => mapFichajeToEvent(fichaje, users));
      setEvents(mappedEvents);
      return mappedEvents;
    } catch (error) {
      console.error("Error fetching signings:", error);
      return [];
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await Axios.get(url_connect + 'GetUsers');
      const fetchedUsers: User[] = response.data.results;
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchEvents();
    }
  }, [users]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditing(true)
    setFormData({
      Empleado: event.empleadoId ?? "",
      Tipo: event.type,
      Fecha_hora: dayjs(event.start).format("YYYY-MM-DDTHH:mm"),
      fecha: dayjs(event.start).format("YYYY-MM-DD"),
      hora: dayjs(event.start).format("HH:mm")
    });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    const updatedFormData = {
      ...formData,
      Fecha_hora: `${formData.fecha}T${formData.hora}`,
    };
    e.preventDefault();
    try {
      Axios.put(`${url_connect}UpdateSigning/${selectedEvent?.id}`, updatedFormData)
        .then(() => {
          return fetchEvents();
        })
        .then(() => {
          setSelectedEvent(null);
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Error updating event:", error);
        });
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleAddMode = () => {
    setIsAdding(true);
  };

  const handleAddSigning = () => {
    console.log("datos: ", formData)
    const updatedFormData = {
      ...formData,
      Fecha_hora: `${formData.fecha}T${formData.hora}`,
    };
    console.log("datos: ", updatedFormData)
    Axios.post(url_connect + 'PostSigning',
      updatedFormData
    ).then(() => {
    }).catch((error) => {
      console.log(error);
    });
    fetchEvents();
  }

  const handleCancelEdit = () => {
    fetchEvents();
    setSelectedEvent(null);
    setIsEditing(false);
    setIsAdding(false);
    setFormData({
      Empleado: "",
      Tipo: "",
      Fecha_hora: "",
      fecha: "",
      hora: ""
    }
    )
  };

  const filteredEvents = events.filter((event) => {
    const term = searchTerm.toLowerCase();
    const title = (event.title || "").toLowerCase();
    const type = (event.type || "").toLowerCase();
    return title.includes(term) || type.includes(term);
  });

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
        {!isEditing && !isAdding ? (
          <>
            <IonItem>
              <IonInput
                placeholder="Buscar por nombre o tipo"
                value={searchTerm}
                onIonChange={(e) => setSearchTerm(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonButton onClick={handleAddMode}>Añadir fichaje manualmente</IonButton>
            </IonItem>
            <div className="calendar-section">
              <div className="calendar-section">
                <CustomCalendar events={filteredEvents} onSelectEvent={handleSelectEvent} />
              </div>
            </div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '16px' }}>
              {[
                { label: 'Entrada', color: '#81C784' },
                { label: 'Salida', color: '#E57373' },
                { label: 'Descanso', color: '#FFF176' },
                { label: 'Terminando el descanso', color: '#FFB74D' },
                { label: 'Horas extra', color: '#9575CD' },
                { label: 'Terminadas horas extra', color: '#BA68C8' },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: color,
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }} />
                  <span style={{ fontSize: '14px' }}>{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (isEditing || isAdding) && (
          <>
            <div style={{ padding: '1rem' }}>
              <h2>{isAdding ? "Añadir Fichaje" : "Editar Fichaje"}</h2>
              <form onSubmit={isAdding ? handleAddSigning : handleSaveChanges}>
                <IonItem>
                  <IonSelect
                    value={formData.Empleado}
                    placeholder="Selecciona Empleado"
                    onIonChange={(e) =>
                      setFormData({ ...formData, Empleado: e.detail.value })
                    }
                  >
                    {users.map((user) => (
                      <IonSelectOption key={user.id} value={user.id}>
                        {user.properties.Nombre.title[0].plain_text}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonSelect
                    value={formData.Tipo}
                    placeholder="Tipo de fichaje"
                    onIonChange={(e) =>
                      setFormData({ ...formData, Tipo: e.detail.value })
                    }
                  >
                    <IonSelectOption value="Entrada">Entrada</IonSelectOption>
                    <IonSelectOption value="Salida">Salida</IonSelectOption>
                    <IonSelectOption value="Horas extra">Horas extra</IonSelectOption>
                    <IonSelectOption value="Descanso">Descanso</IonSelectOption>
                    <IonSelectOption value="Terminado el descanso">
                      Terminado el descanso
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonInput
                    type="time"
                    placeholder="Hora"
                    value={formData.hora}
                    onIonChange={(e) =>
                      setFormData({ ...formData, hora: e.detail.value! })
                    }
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    type="date"
                    placeholder="Fecha"
                    value={formData.fecha}
                    onIonChange={(e) =>
                      setFormData({ ...formData, fecha: e.detail.value! })
                    }
                  />
                </IonItem>
                <IonButton type="submit" expand="block" style={{ marginTop: '1rem' }}>
                  {isAdding ? "Añadir Fichaje" : "Guardar cambios"}
                </IonButton>
                <IonButton
                  color="medium"
                  expand="block"
                  onClick={handleCancelEdit}
                  style={{ marginTop: '0.5rem' }}
                >
                  Cancelar
                </IonButton>
              </form>
            </div>
          </>
        )
        }
      </IonContent>
    </IonPage>
  );
};

export default AdminSignings;
