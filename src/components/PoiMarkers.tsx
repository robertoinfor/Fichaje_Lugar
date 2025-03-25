import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { Circle } from './Circle';
import { AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import type { Poi } from '../types/Poi';

interface PoiMarkersProps {
  pois: Poi[];
  isDeletingPoint?: boolean;
  onDelete?: (id: string) => void;
  onMarkerSelect?: (poi: Poi) => void;
  circleCenter: google.maps.LatLng | null;
}

const PoiMarkers: React.FC<PoiMarkersProps> = ({ pois, isDeletingPoint, onDelete, onMarkerSelect, circleCenter }) => {
  const map = useMap();
  const markersRef = useRef<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  const handleMarkerClick = useCallback((poi: Poi) => {
    if (isDeletingPoint && onDelete) {
      onDelete(poi.key);
    } else if (onMarkerSelect) {
      onMarkerSelect(poi);
    } else if (map) {
      map.panTo(new google.maps.LatLng(poi.location.lat, poi.location.lng));
    }
  }, [isDeletingPoint, onDelete, onMarkerSelect, map]);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
    if (marker) {
      markersRef.current[key] = marker;
    } else {
      delete markersRef.current[key];
    }
    if (clusterer.current) {
      clusterer.current.clearMarkers();
      clusterer.current.addMarkers(Object.values(markersRef.current));
    }
  }, []);

  return (
    <>
      {circleCenter && (
        <Circle
          radius={200}
          center={circleCenter}
          strokeColor={'#0c4cb3'}
          strokeOpacity={1}
          strokeWeight={3}
          fillColor={'#3b82f6'}
          fillOpacity={0.3}
        />
      )}
      {pois.map((poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={marker => setMarkerRef(marker, poi.key)}
          clickable={true}
          onClick={() => handleMarkerClick(poi)}
        >
          <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default PoiMarkers;
