export interface Signing {
    id: string;
    properties: {
        Id: { title: [{ text: { content: string } }] },
        Empleado: { relation: [{ id: string }] },
        Tipo: { select: { name: string } },
        Fecha_hora: { date: { start: string } },
        Hora: { formula: { string: string } },
        Fecha: { formula: { string: string } };
    };
}