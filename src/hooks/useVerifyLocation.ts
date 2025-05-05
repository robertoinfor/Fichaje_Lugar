import { useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import axios from 'axios';
import { calcularDistanciaMetros } from '../utils/geo';
import { Poi } from '../types/Poi';

export const useVerifyLocation = () => {
  const [estaDentro, setEstaDentro] = useState(false);
  const [puntoCercano, setPuntoCercano] = useState<Poi | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLocation = async () => {
    try {
      const permiso = await Geolocation.checkPermissions();
      if (permiso.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
      const posicion = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = posicion.coords;

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

      for (const poi of pois) {
        const distancia = calcularDistanciaMetros(latitude, longitude, poi.location.lat, poi.location.lng);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          masCercano = poi;
        }
      }

      const dentro = distanciaMinima <= 200;
      setEstaDentro(dentro);
      setPuntoCercano(dentro ? masCercano : null);
    } catch (err: any) {
      console.error('Error al verificar ubicación cercana:', err);
      setError('Error al verificar ubicación.');
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    checkLocation();

    const interval = setInterval(() => {
      checkLocation();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkLocation]);

  return { estaDentro, puntoCercano, cargando, error, checkLocation, };
};