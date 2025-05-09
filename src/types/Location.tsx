export interface Location {
    id: string;
    properties: {
        Longitud: {
            number: string;
        };
        Latitud: {
            number: string;
        };
        Nombre: { title: [{ text: { content: string } }] };
        Estado: { status: {name : string}}
    };
}