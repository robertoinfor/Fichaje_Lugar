import React from "react";
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import PoiMarkers from "./PoiMarkers";
import InfoWindow from "./InfoWindow";
import { Poi } from "../types/Poi";
import './GoogleMap.css';
import SearchBox from "./SearchBoxMap";

interface GoogleMapProps {
  isMobile: boolean;
  locations: Poi[];
  isDeletingPoint: boolean;
  userCoords: google.maps.LatLngLiteral | null;
  circleCenter: google.maps.LatLng | null;
  selectedPoi: Poi | null;
  onMapClick: (ev: any) => void;
  onDelete: (id: string) => void;
  onMarkerSelect: (poi: Poi) => void;
  onEdit: () => void;
  onCloseInfo: () => void;
  apiKey: string;
  mapId: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  isMobile,
  locations,
  isDeletingPoint,
  userCoords,
  circleCenter,
  selectedPoi,
  onMapClick,
  onDelete,
  onMarkerSelect,
  onEdit,
  onCloseInfo,
  apiKey,
  mapId
}) => {
  return (
    <div
      className="map-layout"
      style={{
        order: 1,
        flex: isMobile ? 'none' : 1,
        width: isMobile ? '100%' : undefined,
        height: isMobile ? '50vh' : '100%'
      }}
    >
      <APIProvider apiKey={apiKey} libraries={['places']} >
        {/* Mapa */}
        <Map
          defaultZoom={15}
          defaultCenter={{ lat: 28.079672, lng: -15.451525 }}
          onClick={onMapClick}
          mapId={mapId}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Barra de búsqueda */}
          <SearchBox />

          {/* Puntos en el mapa */}
          <PoiMarkers
            pois={locations}
            isDeletingPoint={isDeletingPoint}
            onDelete={onDelete}
            onMarkerSelect={onMarkerSelect}
            circleCenter={circleCenter}
          />
          {/* Mi ubicación */}
          {userCoords && (
            <AdvancedMarker position={userCoords} title="Tu ubicación">
              <Pin background="#4285F4" glyphColor="#fff" borderColor="#1a73e8" />
            </AdvancedMarker>
          )}

          {/* Pestaña para ver el nombre y poder editar el punto */}
          {selectedPoi && (
            <InfoWindow
              position={selectedPoi.location}
              name={selectedPoi.name}
              onEdit={onEdit}
              onClose={onCloseInfo}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default GoogleMap;
