import React, { useEffect, useState } from "react";
import { Calendar, dayjsLocalizer, View, NavigateAction } from "react-big-calendar";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import "react-big-calendar/lib/css/react-big-calendar.css";
import './Calendar.css'
import { CalendarEvent } from "../types/CalendarEvent";
import { CSSProperties } from "react";

const localizer = dayjsLocalizer(dayjs);
dayjs.locale('es');

interface CustomCalendarProps {
    events: CalendarEvent[];
    onSelectEvent?: (event: CalendarEvent) => void;
    onMonthChange?: (date: Date) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ events, onSelectEvent, onMonthChange }) => {
    const url_connect = import.meta.env.VITE_URL_CONNECT
    const isMobile = window.innerWidth < 768;
    const [currentView, setCurrentView] = useState<View>(isMobile ? "day" : "month");
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [festivos, setFestivos] = useState<CalendarEvent[]>([]);
    const fetchFestivos = async (year: number) => {
        try {
            const res = await fetch(`${url_connect}holidays/${year}`);
            const data = await res.json();
            const mapped = data.map((f: any) => ({
                title: f.name,
                start: new Date(f.date),
                end: new Date(f.date),
                allDay: true,
                type: "Festivo"
            }));
            setFestivos(mapped);
        } catch (err) {
            console.error("Error cargando festivos:", err);
        }
    };

    const handleViewChange = (view: View) => {
        setCurrentView(view);
    };

    const handleNavigate = (newDate: Date, newView: View) => {
        setCurrentDate(newDate);
        setCurrentView(newView);
        const año = newDate.getFullYear();
        fetchFestivos(año);
        if (onMonthChange) {
            onMonthChange(newDate);
          }
    };

    const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
        setCurrentDate(slotInfo.start);
        setCurrentView("day");
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        if (event.type === "Festivo") return;
        onSelectEvent?.(event);
      };
      

    const eventColors: Record<string, string> = {
        E: "#6eff6c",
        S: "#ff2b2b",
        HE: "#9575CD",
        FHE: "#BA68C8",
        D: "#85eeff",
        FD: "#00ACC1",
        Festivo: "#ffb347",
    };

    const getEventStyle = (event: CalendarEvent): { style: CSSProperties } => {
      const backgroundColor = event.type === "Festivo"
        ? "#ffe0b2"
        : eventColors[event.type] || "gray";
    
      return {
        style: {
          backgroundColor,
          color: event.type === "Festivo" ? "#e65100" : "black",
          borderRadius: "5px",
          fontWeight: event.type === "Festivo" ? 600 : "normal",
          border: "none",
          pointerEvents: event.type === "Festivo" ? "none" : "auto",
        },
      };
    };

    useEffect(() => {
        const año = currentDate.getFullYear();
        fetchFestivos(año);
    }, []);

    const dayPropGetter = (date: Date) => {
        const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        const isFestivo = festivos.some(f => isSameDay(new Date(f.start), date));

        if (isFestivo) {
            return {
                style: {
                    backgroundColor: "#ffe0b2",
                },
            };
        }

        return {};
    };
    
    return (
        <div style={{ height: "90vh", width: "90vw" }}>
            <Calendar
                localizer={localizer}
                events={[...events, ...festivos]}
                startAccessor="start"
                endAccessor="end"

                view={currentView}
                views={isMobile ? { day: true } : { month: true, week: true, day: true, work_week: true }} onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}

                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                drilldownView="day"

                dayPropGetter={dayPropGetter}
                eventPropGetter={getEventStyle}
                style={{ height: "100%" }}
                popup

                messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día"
                }}
            />
        </div>
    );
};

export default CustomCalendar;
