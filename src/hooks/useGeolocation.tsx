import { useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export const useGeolocation = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: string;

    Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
      (position, err) => {
        if (err) {
          console.error("Error viendo ubicación:", err);
          setError(err.message || 'Error al obtener ubicación');
          return;
        }

        if (position) {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      }
    ).then((id) => {
      watchId = id;
    });

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);


  return { coords, error };
};
export default useGeolocation;

