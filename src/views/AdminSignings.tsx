import React, { useState, useEffect, useMemo } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonMenu, IonSelect, IonSelectOption, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import Axios from 'axios';
import dayjs from 'dayjs';
import CustomCalendar from '../components/CustomCalendar';
import { CalendarEvent } from '../types/CalendarEvent';
import { Signing } from '../types/Signing';
import { User } from '../types/User';
import { Location } from '../types/Location';
import Menu from '../components/Menu';
import TopBar from '../components/TopBar';
import ExportToExcel from '../components/ExportToExcel';
import { Buffer } from 'buffer';
import ExportToPdf from '../components/ExportToPdf';
import './AdminSignings.css'
import Footer from '../components/Footer';
import { useAuthGuard } from '../hooks/useAuthUser';
import CustomBttn from '../components/CustomBttn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
(window as any).Buffer = Buffer;
dayjs.extend(utc);
dayjs.extend(timezone);

const url_connect = import.meta.env.VITE_URL_CONNECT;

const AdminSignings: React.FC = () => {
  useAuthGuard();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    Empleado: '',
    Tipo: '',
    Fecha_hora: '',
    fecha: '',
    hora: '',
    Localizacion: ''
  });
  const typeMap: { [key: string]: string } = {
    "Entrada": "E",
    "Salida": "S",
    "Descanso": "D",
    "Terminado el descanso": "FD",
    "Horas extra": "HE",
    "Terminadas horas extra": "FHE",
  };

  // Verifica que el usuario es administrador
  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol === 'Administrador') {
      setIsAdmin(true);
    }
  }, []);

  // Recoge todas las localizaciones
  const fetchLocations = async () => {
    try {
      const response = await Axios.get(url_connect + 'locations/');
      setLocations(response.data.results);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Función para traducir la información de los eventos a los eventos de los Calendario
  const mapFichajeToEvent = (fichaje: Signing, users: User[]): CalendarEvent => {
    const dateString = fichaje.properties.Fecha.formula.string;
    const timeString = fichaje.properties.Hora.formula.string;
    const startDate = dayjs.tz(`${dateString}T${timeString}`, 'Atlantic/Canary').toDate();
    console.log(startDate)
    const locationId = fichaje.properties.Localizacion.relation[0]?.id;
    const localizacion = locations.find(loc => loc.id === locationId);
    const locationName = localizacion ? localizacion.properties.Nombre.title[0].text.content : "Sin ubicación";
    const employeeId = fichaje.properties.Empleado.relation[0]?.id;
    const user = users.find(u => u.id === employeeId);
    const empleadoNombre = user ? user.properties['Nombre de usuario'].title[0].plain_text : "Desconocido";

    return {
      empleadoId: employeeId,
      id: fichaje.id,
      title: `${empleadoNombre} - ${timeString}`,
      start: startDate,
      end: startDate,
      allDay: false,
      type: fichaje.properties.Tipo.select.name,
      location: locationId,
      locationName: locationName
    };
  };

  // Recojo todos los fichajes de todos los usuarios
  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    try {
      const response = await Axios.get(url_connect + 'signings/allsignings');
      const fichajes: Signing[] = response.data.results;
      const mappedEvents = fichajes.map((fichaje: Signing) => {
        const fullType = fichaje.properties.Tipo.select.name;
        const abbreviation = typeMap[fullType] || fullType;
        const event = mapFichajeToEvent(fichaje, users);
        event.type = abbreviation;
        return event;
      });
      setEvents(mappedEvents);
      return mappedEvents;
    } catch (error) {
      console.error("Error fetching signings:", error);
      return [];
    }
  };

  // Recojo todos los usuarios
  const fetchUsers = async () => {
    try {
      const response = await Axios.get(url_connect + 'users/');
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

  // Recojo los datos del fichaje pulsado
  const handleSelectEvent = (event: CalendarEvent) => {
    const fullType = Object.entries(typeMap)
      .find(([abre]) => abre === event.type)?.[0]
      || event.type;

    setSelectedEvent(event);
    setIsEditing(true);
    setFormData({
      Empleado: event.empleadoId ?? "",
      Tipo: fullType,
      Fecha_hora: dayjs(event.start).format("YYYY-MM-DDTHH:mm"),
      fecha: dayjs(event.start).format("YYYY-MM-DD"),
      hora: dayjs(event.start).format("HH:mm"),
      Localizacion: event.location ?? ""
    });
  };

  // Guardo los cambios del fichaje seleccionado
  const handleSaveChanges = async () => {
    const updatedFormData = {
      ...formData,
      Fecha_hora: `${formData.fecha}T${formData.hora}`,
    };
    try {
      Axios.put(`${url_connect}signings/${selectedEvent?.id}/update`, updatedFormData)
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

  // Activo el modo adición del fichaje
  const handleAddMode = () => {
    setIsAdding(true);
  };

  // Subo el fichaje
  const handleAddSigning = async () => {
    const updatedFormData = {
      ...formData,
      Fecha_hora: `${formData.fecha}T${formData.hora}`,
    };
    Axios.post(url_connect + 'signings/',
      updatedFormData
    ).then(() => {
      fetchEvents()
    }).catch((error) => {
      console.log(error);
    });
    fetchEvents();
    setIsAdding(false)
  }

  // Limpio variables
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
      hora: "",
      Localizacion: ""
    }
    )
  };

  // Filtro los eventos según lo que haya en el buscador 
  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return events.filter(ev => {
      const title = ev.title.toLowerCase();
      const abbr = ev.type.toLowerCase();
      const full = Object
        .keys(typeMap)
        .find(k => typeMap[k].toLowerCase() === abbr)
        ?.toLowerCase() || '';
      return (
        title.includes(term) ||
        abbr.includes(term) ||
        full.includes(term)
      );
    });
  }, [events, searchTerm]);

  const filteredEventsByMonth = filteredEvents.filter(ev =>
    ev.start.getMonth() === calendarDate.getMonth() &&
    ev.start.getFullYear() === calendarDate.getFullYear()
  );

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
        <div className="signings-section">
          <div className="signings-box">
            <h1 className="config-title">Todos los fichajes</h1>
            <div className="config-divider" />
            {!isEditing && !isAdding ? (
              <>
                <div className="header-row">
                  <div className="search-input">
                    <IonInput
                      placeholder="Buscar por nombre o tipo de evento"
                      value={searchTerm}
                      onIonInput={e => setSearchTerm(e.detail.value!)}
                    />
                  </div>
                  <div className="toolbar-buttons">
                    <CustomBttn onClick={handleAddMode} text='Añadir fichaje' width='15vw' />
                    <ExportToExcel
                      eventos={filteredEventsByMonth.map(ev => {
                        const [nombre, hora] = (ev.title || '').split(' - ');
                        return {
                          nombre,
                          fecha: ev.start.toISOString().split('T')[0],
                          hora,
                          tipo: ev.type,
                        };
                      })}
                      nombreArchivo={"Fichajes"}
                    />

                    <ExportToPdf
                      eventos={filteredEventsByMonth.map(ev => {
                        const [nombre, hora] = (ev.title || '').split(' - ');
                        return {
                          nombre,
                          fecha: ev.start.toISOString().split('T')[0],
                          hora,
                          tipo: ev.type,
                        };
                      })}
                      nombreArchivo="Fichajes"
                    />
                  </div>
                  <div className="legend-row">
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
                </div>

                <div className="calendar-wrapper">
                  <CustomCalendar events={filteredEvents} onSelectEvent={handleSelectEvent} onMonthChange={setCalendarDate}
                  />
                </div>
              </>
            ) : (isEditing || isAdding) && (
              <>
                <IonCard className="user-card">
                  <IonCardHeader>
                    <IonCardTitle className="form-title">
                      {isAdding ? "Añadir fichaje" : "Editar fichaje"}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <form>
                      <IonItem>
                        <IonSelect
                          placeholder="Empleado"
                          value={formData.Empleado}
                          onIonChange={e => setFormData({ ...formData, Empleado: e.detail.value! })}
                        >
                          {users.map(user => (
                            <IonSelectOption key={user.id} value={user.id}>
                              {user.properties['Nombre de usuario'].title[0].plain_text}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>

                      <IonItem>
                        <IonSelect
                          placeholder="Tipo de fichaje"
                          value={formData.Tipo}
                          onIonChange={e => setFormData({ ...formData, Tipo: e.detail.value! })}
                        >
                          <IonSelectOption value="Entrada">Entrada</IonSelectOption>
                          <IonSelectOption value="Salida">Salida</IonSelectOption>
                          <IonSelectOption value="Descanso">Descanso</IonSelectOption>
                          <IonSelectOption value="Terminado el descanso">Terminado descanso</IonSelectOption>
                          <IonSelectOption value="Horas extra">Horas extra</IonSelectOption>
                          <IonSelectOption value="Terminadas horas extra">Terminadas extra</IonSelectOption>
                        </IonSelect>
                      </IonItem>

                      <IonItem>
                        <IonInput
                          type="date"
                          placeholder="Fecha"
                          value={formData.fecha}
                          onIonChange={e => setFormData({ ...formData, fecha: e.detail.value! })}
                        />
                      </IonItem>

                      <IonItem>
                        <IonInput
                          type="time"
                          placeholder="Hora"
                          value={formData.hora}
                          onIonChange={e => setFormData({ ...formData, hora: e.detail.value! })}
                        />
                      </IonItem>

                      <IonItem>
                        <IonSelect
                          placeholder="Localización"
                          value={formData.Localizacion}
                          onIonChange={e => setFormData({ ...formData, Localizacion: e.detail.value! })}
                        >
                          {locations.map(loc => (
                            <IonSelectOption key={loc.id} value={loc.id}>
                              {loc.properties.Nombre.title[0].text.content}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>

                      <CustomBttn
                        text={isAdding ? "Añadir" : "Guardar"}
                        onClick={isAdding ? handleAddSigning : handleSaveChanges}
                        width="100%"
                      />

                      {isEditing && (
                        <CustomBttn
                          text="Eliminar"
                          onClick={() => setShowDeleteAlert(true)}
                          width="100%"
                        />
                      )}

                      <CustomBttn
                        text="Cancelar"
                        onClick={handleCancelEdit}
                        width="100%"
                      />
                    </form>
                  </IonCardContent>
                </IonCard>
              </>
            )}
          </div>
        </div>
        <Footer />
      </IonContent>
    </IonPage >
  );
};

export default AdminSignings;
