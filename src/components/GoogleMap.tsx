import React, { useCallback, useEffect, useState } from "react";
import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import Axios from "axios";
import PoiMarkers from './PoiMarkers';
import { Poi } from "../types/Poi";
import "./GoogleMap.css";
import MarkerInfo from "./InfoWindow";
import { useGeolocation } from "../hooks/useGeolocation";
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';


const GoogleMap: React.FC = () => {
    const url_connect = import.meta.env.VITE_URL_CONNECT;
    const [locations, setLocations] = useState<Poi[]>([]);
    const [isAddingPoint, setIsAddingPoint] = useState<boolean>(false);
    const [isDeletingPoint, setIsDeletingPoint] = useState<boolean>(false);
    const [newPointName, setNewPointName] = useState("");
    const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
    const [circleCenter, setCircleCenter] = useState<google.maps.LatLng | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editPointName, setEditPointName] = useState("");
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const { coords: userCoords } = useGeolocation();
    const api_maps = import.meta.env.VITE_API_MAPS ?? "";
    const id_map = import.meta.env.VITE_ID_MAP ?? "";

    const fetchLocations = useCallback(() => {
        Axios.get(url_connect + 'GetLocations')
            .then((response) => {
                const fetchedPois: Poi[] = response.data.results.map((page: any) => ({
                    key: page.id,
                    name: page.properties.Nombre.title[0].text.content,
                    location: {
                        lat: page.properties.Latitud.number,
                        lng: page.properties.Longitud.number,
                    },
                }));
                setLocations(fetchedPois);
            })
            .catch((error: any) => {
                console.error(error);
            });
    }, [url_connect]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleMapClick = useCallback((ev: any) => {
        if (!isAddingPoint) return;
        const eventData = ev.detail || ev;
        if (!eventData.latLng) {
            console.warn("latLng no encontrada en el evento.");
            return;
        }
        const { lat, lng } = eventData.latLng;
        const newPoi: Poi = {
            name: newPointName,
            key: newPointName,
            location: { lat, lng },
        };

        setLocations(prev => [...prev, newPoi]);
        Axios.post(url_connect + 'PostLocation', {
            Longitud: lng,
            Latitud: lat,
            Nombre: newPointName,
        }).then(() => {
            fetchLocations();
        }).catch((error) => {
            console.error("Error uploading location to Notion:", error);
        });
        setIsAddingPoint(false);
        setNewPointName("");
    }, [isAddingPoint, newPointName, url_connect]);

    const handleDelete = useCallback((id: string) => {
        Axios.delete(url_connect + 'DeleteLocation/' + id)
            .then((response) => {
                console.log("Location deleted:", response.data);
                setLocations(prev => prev.filter(loc => loc.key !== id));
            })
            .catch((error) => {
                console.error("Error deleting location:", error);
            });
        setIsDeletingPoint(false);
    }, [url_connect]);

    const handleMarkerSelect = useCallback((poi: Poi) => {
        setSelectedPoi(poi);
        setCircleCenter(new google.maps.LatLng(poi.location.lat, poi.location.lng));
    }, []);

    const handleEdit = useCallback(() => {
        if (selectedPoi) {
            setEditingKey(selectedPoi.key);
            setIsEditing(true);
            setEditPointName(selectedPoi.name);
            setSelectedPoi(null);
        }
    }, [selectedPoi]);

    const saveEdit = useCallback(() => {
        if (!editingKey) return;

        Axios.put(url_connect + 'UpdateLocation/' + editingKey, {
            Nombre: editPointName,
        }).catch((error) => {
            console.error("Error al actualizar la ubicación:", error);
        });

        setLocations(prev =>
            prev.map(loc =>
                loc.key === editingKey ? { ...loc, name: editPointName } : loc
            )
        );
        setSelectedPoi(prev => {
            if (!prev) return null;
            return { ...prev, name: editPointName };
        });
        setIsEditing(false);
        setEditPointName("");
        fetchLocations();
        setCircleCenter(null)
    }, [selectedPoi, editPointName, url_connect]);

    return (
        <div className="container">
            <div className="map-container">
                <APIProvider apiKey={api_maps}>
                    <Map
                        defaultZoom={15}
                        defaultCenter={{ lat: 28.079672069880512, lng: -15.451525477127293 }}
                        onCameraChanged={(ev: MapCameraChangedEvent) => console.log()}
                        onClick={handleMapClick}
                        mapId={id_map}
                    >
                        <PoiMarkers
                            pois={locations}
                            isDeletingPoint={isDeletingPoint}
                            onDelete={handleDelete}
                            onMarkerSelect={handleMarkerSelect}
                            circleCenter={circleCenter}
                        />
                        {userCoords && (
                            <AdvancedMarker
                                position={userCoords}
                                title="Tu ubicación"
                            >
                                <Pin background="#4285F4" glyphColor="#fff" borderColor="#1a73e8" />
                            </AdvancedMarker>
                        )}

                        {selectedPoi && (
                            <MarkerInfo
                                position={selectedPoi.location}
                                name={selectedPoi.name}
                                onEdit={handleEdit}
                                onClose={() => {
                                    setSelectedPoi(null);
                                    setCircleCenter(null);
                                }}
                            />
                        )}
                    </Map>
                </APIProvider>
            </div>
            <div className="sidebar">
                <button onClick={() => { setIsAddingPoint(true); setIsDeletingPoint(false); setSelectedPoi(null); }}>
                    {isAddingPoint ? "Haz clic en el mapa para agregar el punto" : "Agregar punto"}
                </button>
                {isAddingPoint && (
                    <div>
                        <label>
                            Nombre:
                            <input
                                type="text"
                                value={newPointName}
                                onChange={(e) => setNewPointName(e.target.value)}
                            />
                        </label>
                    </div>
                )}
                {isEditing && (
                    <div style={{ marginTop: '20px' }}>
                        <label>
                            Editar nombre:
                            <input
                                type="text"
                                value={editPointName}
                                onChange={(e) => setEditPointName(e.target.value)}
                                style={{ marginLeft: '8px' }}
                            />
                        </label>
                        <button onClick={saveEdit} style={{ marginLeft: '8px' }}>
                            Guardar
                        </button>
                    </div>
                )}

                <button onClick={() => { setIsDeletingPoint(true); setIsAddingPoint(false); setSelectedPoi(null); }}>
                    {isDeletingPoint ? "Haz clic en un marcador para eliminarlo" : "Eliminar punto"}
                </button>
            </div>
        </div>
    );
};

export default GoogleMap;
