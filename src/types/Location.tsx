export interface Location {
    id: string;
    properties: {
        Longitud: {
            number: string;
        };
        Latitud: string;
        Nombre: { title: [{ text: { content: string } }] };
        Estado: { status: {name : string}}
    };
}