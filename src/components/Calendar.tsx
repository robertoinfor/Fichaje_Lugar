import React, { useState } from "react";
import { Calendar, dayjsLocalizer, View, NavigateAction } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './Calendar.css'

import { CalendarEvent } from "../types/CalendarEvent";

const localizer = dayjsLocalizer(dayjs);

interface CustomCalendarProps {
    events: CalendarEvent[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ events }) => {
    const [currentView, setCurrentView] = useState<View>("month");
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const handleViewChange = (view: View) => {
        setCurrentView(view);
    };

    const handleNavigate = (newDate: Date, newView: View, action: NavigateAction) => {
        setCurrentDate(newDate);
        setCurrentView(newView);
    };

    const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
        setCurrentDate(slotInfo.start);
        setCurrentView("day");
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setCurrentDate(event.start);
        setCurrentView("day");
    };

    const eventColors: Record<string, string> = {
        Entrada: "green",
        Salida: "red",
        "Horas extra": "blue",
        "Terminadas horas extra": "darkblue",
        Descanso: "orange",
        "Terminado el descanso": "darkorange",
    };

    const getEventStyle = (event: CalendarEvent) => {
        const backgroundColor = eventColors[event.type] || "gray";
        return {
            style: {
                backgroundColor,
                color: "white",
                borderRadius: "5px",
                padding: "5px",
                height: "auto",
                minHeight: "40px",
                whiteSpace: "normal",
            },
        };
    };

    return (
        <div style={{ height: "90vh", width: "90vw" }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"

                view={currentView}
                onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}

                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}

                drilldownView="day"

                eventPropGetter={getEventStyle}
                style={{ height: "100%" }}
                popup
            />
        </div>
    );
};

export default CustomCalendar;
