import { useState, useEffect } from 'react';
import { getSignings } from '../services/ApiService';
import { CalendarEvent } from '../types/CalendarEvent';
import dayjs from 'dayjs';

export const useSignings = (userId: string) => {
  const [signings, setSignings] = useState<CalendarEvent[]>([]);

  // Recojo los eventos formateando los datos para tener el formato de los eventos del calendario
  useEffect(() => {
    const fetchSignings = async () => {
      try {
        const fichajes = await getSignings(userId);
        const typeMap: { [key: string]: string } = {
          "Entrada": "E",
          "Salida": "S",
          "Descanso": "D",
          "Terminado el descanso": "FD",
          "Horas extra": "HE",
          "Terminadas horas extra": "FHE",
        };
        const eventos = fichajes.map((fichaje: any) => {
          const fullType = fichaje.properties.Tipo.select.name;
          const abbreviation = typeMap[fullType] || fullType;
          return {
            title: `${fichaje.properties.Tipo.select.name} - ${fichaje.properties.Hora.formula.string}`,
            start: dayjs(`${fichaje.properties.Fecha.formula.string}T${fichaje.properties.Hora.formula.string}`).toDate(),
            end: dayjs(`${fichaje.properties.Fecha.formula.string}T${fichaje.properties.Hora.formula.string}`).toDate(),
            allDay: false,
            type: abbreviation,
          };
        });
        setSignings(eventos);
      } catch (error) {
        console.error("Error fetching signings:", error);
      }
    };

    if (userId) {
      fetchSignings();
    }
  }, [userId]);

  return signings;
};

