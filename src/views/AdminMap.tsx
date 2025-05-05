import React, { useState, useCallback, useEffect } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle,
    IonContent, IonMenu, IonGrid, IonRow, IonCol
} from '@ionic/react';

import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import GoogleMap from '../components/GoogleMap';
import CustomBttn from '../components/CustomBttn';
import { useGeolocation } from '../hooks/useGeolocation';
import Axios from 'axios';
import { Poi } from '../types/Poi';
import Footer from '../components/Footer';
import './AdminMap.css'

const useIsMobile = (bp = 600) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < bp);
    useEffect(() => {
        const m = () => setIsMobile(window.innerWidth < bp);
        window.addEventListener('resize', m);
        return () => window.removeEventListener('resize', m);
    }, [bp]);
    return isMobile;
};

const AdminMap: React.FC = () => {
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);

    const isMobile = useIsMobile();

    const url_connect = import.meta.env.VITE_URL_CONNECT;
    const [locations, setLocations] = useState<Poi[]>([]);
    const [oldlocations, setOldLocations] = useState<Poi[]>([]);
    const [circleCenter, setCircleCenter] = useState<google.maps.LatLng | null>(null);
    const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

    const [message, setMessage] = useState("");
    const [newPointName, setNewPointName] = useState("");
    const [editPointName, setEditPointName] = useState("");
    const [editingKey, setEditingKey] = useState<string | null>(null);

    const [isAddingPoint, setIsAddingPoint] = useState(false);
    const [isDeletingPoint, setIsDeletingPoint] = useState(false);
    const [isShowingOld, setShowOldLocations] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { coords: userCoords } = useGeolocation();

    const fetchLocations = useCallback(() => {
        Axios.get(url_connect + 'locations/').then(res => {
            const activos = res.data.results
                .filter((p: any) => p.properties.Estado.status.name === "Activo")
                .map((p: any): Poi => ({
                    key: p.id,
                    name: p.properties.Nombre.title[0].text.content,
                    location: {
                        lat: p.properties.Latitud.number,
                        lng: p.properties.Longitud.number
                    }
                }));
            const inact = res.data.results
                .filter((p: any) => p.properties.Estado.status.name === "Inactivo")
                .map((p: any): Poi => ({
                    key: p.id,
                    name: p.properties.Nombre.title[0].text.content,
                    location: {
                        lat: p.properties.Latitud.number,
                        lng: p.properties.Longitud.number
                    }
                }));
            setLocations(activos);
            setOldLocations(inact);
        }).catch(console.error);
    }, [url_connect]);
    useEffect(fetchLocations, [fetchLocations]);

    const handleMapClick = useCallback((ev: any) => {
        if (!isAddingPoint) return;
        const latLng = ev.detail?.latLng || ev.latLng;
        const { lat, lng } = ev.detail?.latLng || ev.latLng;
        if (!latLng || !newPointName.trim()) {
            setMessage("❌ Introduce un nombre.");
            return;
        }
        if (locations.some(l => l.name.toLowerCase() === newPointName.trim().toLowerCase())) {
            setMessage("❌ Ya existe.");
            return;
        }
        Axios.post(url_connect + 'locations/', {
            Longitud: lng,
            Latitud: lat,
            Nombre: newPointName
        }).then(() => fetchLocations())
            .catch(console.error);
        setIsAddingPoint(false);
        setNewPointName("");
    }, [
        isAddingPoint, newPointName, locations, url_connect, fetchLocations
    ]);

    const handleDelete = useCallback((id: string) => {
        Axios.put(url_connect + `locations/${id}/changeState`, { Estado: "Inactivo" })
            .then(() => {
                setLocations(ls => ls.filter(l => l.key !== id));
            }).catch(console.error);
        setIsDeletingPoint(false);
    }, [url_connect]);

    const handleMarkerSelect = useCallback((poi: Poi) => {
        setSelectedPoi(poi);
        setCircleCenter(new google.maps.LatLng(poi.location.lat, poi.location.lng));
    }, []);

    const handleEditStart = () => {
        if (!selectedPoi) return;
        setEditingKey(selectedPoi.key);
        setEditPointName(selectedPoi.name);
        setIsEditing(true);
        setSelectedPoi(null);
    };

    const saveEdit = () => {
        if (!editingKey) return;

        Axios.put(
            `${url_connect}locations/${editingKey}/changeName`,
            { Nombre: editPointName }
        )
        fetchLocations();

        setSelectedPoi(prev =>
            prev && prev.key === editingKey
                ? { ...prev, name: editPointName }
                : prev
        );
        setIsEditing(false);
        setEditPointName("");
    };

    const reactivateLocation = (id: string) => {
        Axios.put(url_connect + `locations/${id}/changeState`, { Estado: "Activo" })
            .then(() => fetchLocations())
            .catch(console.error);
        setShowOldLocations(false);
    };

    return (
        <IonPage>
            <IonMenu side="end" content-id="main-content" ref={setMenu}>
                <IonHeader><IonToolbar><IonTitle>Menú</IonTitle></IonToolbar></IonHeader>
                <IonContent><Menu admin /></IonContent>
            </IonMenu>

            <TopBar onMenuClick={() => menu?.open()} />

            <IonContent id="main-content" fullscreen>
                <section className="map-section">
                    <div className="map-box">
                        <h1>Localizaciones</h1>
                        <div className="map-divider" />

                        <div className="layout">
                            <div className="map-wrapper">
                                <GoogleMap
                                    isMobile={isMobile}
                                    locations={locations}
                                    isDeletingPoint={isDeletingPoint}
                                    userCoords={userCoords}
                                    circleCenter={circleCenter}
                                    selectedPoi={selectedPoi}
                                    onMapClick={handleMapClick}
                                    onDelete={handleDelete}
                                    onMarkerSelect={handleMarkerSelect}
                                    onEdit={handleEditStart}
                                    onCloseInfo={() => setSelectedPoi(null)}
                                    apiKey={import.meta.env.VITE_API_MAPS!}
                                    mapId={import.meta.env.VITE_ID_MAP!}
                                />
                            </div>

                            <div className="sidebar">
                                <CustomBttn
                                    onClick={() => {
                                        setIsAddingPoint(true);
                                        setIsDeletingPoint(false);
                                        setShowOldLocations(false);
                                        setMessage("");
                                    }}
                                    text="Añadir ubicación"
                                />
                                <CustomBttn
                                    onClick={() => {
                                        setIsDeletingPoint(true);
                                        setIsAddingPoint(false);
                                        setShowOldLocations(false);
                                        setMessage("");
                                    }}
                                    text="Eliminar ubicación"
                                />
                                <CustomBttn
                                    onClick={() => {
                                        setShowOldLocations(true);
                                        setIsAddingPoint(false);
                                        setIsDeletingPoint(false);
                                        setMessage("");
                                        fetchLocations();
                                    }}
                                    text="Recuperar ubicación"
                                />

                                <div className="error-space">
                                    {message && <p className="sidebar-error">{message}</p>}
                                </div>

                                {isAddingPoint && (
                                    <div className="sidebar-section">
                                        <h4 className="section-title">Nombre de ubicación</h4>
                                        <input
                                            className="field-input"
                                            type="text"
                                            value={newPointName}
                                            onChange={e => setNewPointName(e.target.value)}
                                            placeholder="Escribe aquí..."
                                        />
                                    </div>
                                )}

                                {isDeletingPoint && (
                                    <div className="sidebar-section">
                                        <p className="section-text">
                                            Haz clic en un marcador para eliminarlo.
                                        </p>
                                    </div>
                                )}

                                {isShowingOld && (
                                    <div className="sidebar-section">
                                        <h4 className="section-title">Ubicaciones inactivas</h4>
                                        <ul className="inactive-list">
                                            {oldlocations.map(loc => (
                                                <li
                                                    key={loc.key}
                                                    className="inactive-item"
                                                    onClick={() => reactivateLocation(loc.key)}
                                                >
                                                    {loc.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="sidebar-edit">
                                        <label className="edit-label" htmlFor="editPoint">
                                            Editar nombre de ubicación
                                        </label>
                                        <input
                                            id="editPoint"
                                            className="edit-input"
                                            type="text"
                                            value={editPointName}
                                            onChange={e => setEditPointName(e.target.value)}
                                        />
                                        <div className="edit-buttons">
                                            <button className="save-btn" onClick={saveEdit}>
                                                Guardar
                                            </button>
                                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </IonContent>
        </IonPage >
    );
};

export default AdminMap;
