// /src/types/User.ts

export interface User {
    id: string;
    properties: {
        Nombre: {
            title: [{ plain_text: string }];
        };
        Email: { email: string };
        Pwd: { rich_text: [{ text: { content: string } }] };
        Rol: { select: { name: string } };
        Fecha_alta: { date: { start: string } };
        Horas: { number: number };
    };
}
