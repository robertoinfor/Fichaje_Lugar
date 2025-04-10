export interface CalendarEvent {
    empleadoId?: string;
    id: string,
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    type: string;
    location: string,
    locationName: string
}
