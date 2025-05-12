import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export default function SearchBox() {
    const map = useMap();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!map || !inputRef.current) return;

        const searchBox = new google.maps.places.SearchBox(inputRef.current);

        map.controls[google.maps.ControlPosition.TOP_CENTER].push(inputRef.current);

        map.addListener('bounds_changed', () => {
            searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
        });

        let markers: google.maps.Marker[] = [];
        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (!places || places.length === 0) return;

            markers.forEach(m => m.setMap(null));
            markers = [];

            const bounds = new google.maps.LatLngBounds();
            places.forEach(place => {
                if (!place.geometry || !place.geometry.location) return;

                const m = new google.maps.Marker({
                    map,
                    title: place.name,
                    position: place.geometry.location,
                });
                markers.push(m);

                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });

            map.fitBounds(bounds);
        });
    }, [map]);

    return (
        <input
            ref={inputRef}
            type="text"
            placeholder="Buscar..."
            style={{
                boxSizing: 'border-box',
                border: '1px solid transparent',
                width: '240px',
                height: '32px',
                marginTop: '10px',
                padding: '0 12px',
                borderRadius: '3px',
                fontSize: '14px',
                outline: 'none',
                textOverflow: 'ellipses',
            }}
        />
    );
}
