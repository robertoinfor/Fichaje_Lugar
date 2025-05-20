import { useState, useEffect } from 'react';
import { getSignings } from '../services/ApiService';
import { CalendarEvent } from '../types/CalendarEvent';
import dayjs from 'dayjs';
// 1️⃣ Importa y extiende los plugins
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const ZONE = 'Atlantic/Canary';

export const useSignings = (userId: string) => {
  const [signings, setSignings] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchSignings = async () => {
      try {
        const fichajes = await getSignings(userId);
        const typeMap: { [key: string]: string } = {
          Entrada: 'E',
          Salida: 'S',
          Descanso: 'D',
          'Terminado el descanso': 'FD',
          'Horas extra': 'HE',
          'Terminadas horas extra': 'FHE',
        };

        const eventos = fichajes.map((f: any) => {
          const fecha = f.properties.Fecha.formula.string;
          const hora = f.properties.Hora.formula.string;
          const startDayjs = dayjs.utc(`${fecha}T${hora}`).tz(ZONE);
          const localDate = startDayjs.toDate();
          const formattedTime = startDayjs.format('HH:mm');

          const fullType = f.properties.Tipo.select.name;
          const abbreviation = typeMap[fullType] || fullType;

          return {
            title: `${fullType} - ${formattedTime}`,
            start: localDate,
            end: localDate,
            allDay: false,
            type: abbreviation,
          };
        });

        setSignings(eventos);
      } catch (err) {
        console.error('Error fetching signings:', err);
      }
    };

    if (userId) fetchSignings();
  }, [userId]);

  return signings;
};
