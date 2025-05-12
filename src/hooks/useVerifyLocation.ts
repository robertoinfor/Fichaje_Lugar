import { useCallback, useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import axios from 'axios';
import { calcDistanceMts } from '../utils/geo';
import { Poi } from '../types/Poi';

export const useVerifyLocation = () => {
  const [isInside, setIsInside] = useState(false);
  const [nearPoint, setNearPoint] = useState<Poi | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pide los permisos de ubicación, la comprueba y verifica si está dentro del radio
  const checkLocation = useCallback(async () => {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
      const position = await Geolocation.getCurrentPosition({
        timeout: 10000,
        enableHighAccuracy: true
      });
      const { latitude, longitude } = position.coords;

      // Recojo las localizaciones y las guardo
      const response = await axios.get(import.meta.env.VITE_URL_CONNECT + 'locations');
      const pois: Poi[] = response.data.results.map((page: any) => ({
        key: page.id,
        name: page.properties.Nombre.title[0].text.content,
        location: {
          lat: page.properties.Latitud.number,
          lng: page.properties.Longitud.number,
        },
      }));

      let masCercano: Poi | null = null;
      let distanciaMinima = Infinity;

      // Por cada punto, compruebo la distancia en metros entre el punto actual y el punto
      for (const poi of pois) {
        const distancia = calcDistanceMts(latitude, longitude, poi.location.lat, poi.location.lng);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          masCercano = poi;
        }
      }

      // Si estoy a un mínimo de doscientos metros, guardo que estoy dentro de ese punto y el más cercano
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