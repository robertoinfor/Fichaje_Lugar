import { useCallback, useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import { calcDistanceMts } from '../utils/geo';
import { Poi } from '../types/Poi';
import { Location } from '../types/Location'

export const useVerifyLocation = () => {
  const [isInside, setIsInside] = useState(false);
  const [nearPoint, setNearPoint] = useState<Poi | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLocation = useCallback(async () => {
    try {
      let latitude: number, longitude: number;

      if (Capacitor.getPlatform() === 'web') {
        // API del navegador para web
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } else {
        // Capacitor plugin para apps nativas
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        const position = await Geolocation.getCurrentPosition({
          timeout: 20000,
          enableHighAccuracy: false
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      // Obtener localizaciones activas
      const response = await axios.get(import.meta.env.VITE_URL_CONNECT + 'locations');
      const pois: Poi[] = response.data.results
        .filter((page: Location) => page.properties.Estado.status.name === 'Activo')
        .map((page: any) => ({
          key: page.id,
          name: page.properties.Nombre.title[0].text.content,
          location: {
            lat: page.properties.Latitud.number,
            lng: page.properties.Longitud.number,
          },
        }));

      let masCercano: Poi | null = null;
      let distanciaMinima = Infinity;

      for (const poi of pois) {
        const distancia = calcDistanceMts(latitude, longitude, poi.location.lat, poi.location.lng);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          masCercano = poi;
        }
      }

      const dentro = distanciaMinima <= 200;
      setIsInside(dentro);
      setNearPoint(dentro ? masCercano : null);
    } catch (err: any) {
      console.error('Error al verificar ubicación cercana:', err);
      setError('Error al verificar ubicación.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLocation();
    const interval = setInterval(() => {
      checkLocation();
    }, 100000);

    return () => clearInterval(interval);
  }, [checkLocation]);

  return { isInside, nearPoint, loading, error, checkLocation };
};
