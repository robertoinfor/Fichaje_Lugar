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

  useEffect(() => {
    const verificar = async () => {
      try {
        const posicion = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = posicion.coords;

        const response = await axios.get(import.meta.env.VITE_URL_CONNECT + 'GetLocations');
        const pois: Poi[] = response.data.results.map((page: any) => ({
          key: page.id, // Este es el ID de Notion
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

    verificar();
  }, []);

  return { estaDentro, puntoCercano, cargando, error };
};