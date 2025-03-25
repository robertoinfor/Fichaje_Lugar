import { useState, useEffect } from 'react';
import { getSignings } from '../services/ApiService';
import { CalendarEvent } from '../types/CalendarEvent';
import dayjs from 'dayjs';

export const useSignings = (userId: string) => {
  const [signings, setSignings] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchSignings = async () => {
      try {
        const fichajes = await getSignings(userId);
        const eventos = fichajes.map((fichaje: any) => ({
          title: `${fichaje.properties.Tipo.select.name} ${fichaje.properties.Hora.formula.string}`,
          start: dayjs(`${fichaje.properties.Fecha.formula.string}T${fichaje.properties.Hora.formula.string}`).toDate(),
          end: dayjs(`${fichaje.properties.Fecha.formula.string}T${fichaje.properties.Hora.formula.string}`).toDate(),
          allDay: false,
          type: fichaje.properties.Tipo.select.name,
        }));
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
