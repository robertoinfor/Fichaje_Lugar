// src/components/GoogleMap.tsx
import React from "react";
import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { AdvancedMarker, Pin }     from '@vis.gl/react-google-maps';
import PoiMarkers                  from "./PoiMarkers";
import MarkerInfo                  from "./InfoWindow";
import { Poi }                     from "../types/Poi";
import './GoogleMap.css';

interface GoogleMapProps {
  isMobile: boolean;
  locations: Poi[];
  isDeletingPoint: boolean;
  userCoords: google.maps.LatLngLiteral | null;
  circleCenter: google.maps.LatLng | null;
  selectedPoi: Poi | null;                   // <-- NUEVO
  onMapClick: (ev: any) => void;
  onDelete: (id: string) => void;
  onMarkerSelect: (poi: Poi) => void;
  onEdit: () => void;                        // <-- NUEVO
  onCloseInfo: () => void;                   // <-- NUEVO
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
      <APIProvider apiKey={apiKey}>
        <Map
          defaultZoom={15}
          defaultCenter={{ lat: 28.079672, lng: -15.451525 }}
          onClick={onMapClick}
          mapId={mapId}
          style={{ width: '100%', height: '100%' }}
        >
          <PoiMarkers
            pois={locations}
            isDeletingPoint={isDeletingPoint}
            onDelete={onDelete}
            onMarkerSelect={onMarkerSelect}
            circleCenter={circleCenter}
          />

          {userCoords && (
            <AdvancedMarker position={userCoords} title="Tu ubicación">
              <Pin background="#4285F4" glyphColor="#fff" borderColor="#1a73e8" />
            </AdvancedMarker>
          )}

          {selectedPoi && (
            <MarkerInfo
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
