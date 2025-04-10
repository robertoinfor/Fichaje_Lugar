export interface User {
    id: string;
    properties: {
        "Nombre de usuario": {
            title: [{ plain_text: string }];
        };
        Email: { email: string };
        Pwd: { rich_text: [{ text: { content: string } }] };
        Rol: { select: { name: string } };
        Fecha_alta: { date: { start: string } };
        Horas: { number: number };
        Foto: { files: [{ type: string, external: { url: string } }] };
        Conexion: { status: { name: string } };
        Estado: { status: { name: string } };
        "Nombre completo": {rich_text: [{text: {content: string}}]}
    };
}
