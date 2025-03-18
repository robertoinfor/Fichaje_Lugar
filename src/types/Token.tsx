export interface Token {
    id: string,
    properties: {
        Generado: { date: { start: string } },
        Empleado: { relation: [{ id: string }] },
        Caduca: { date: { start: string } },
        Estado: { status: { name: string } },
        Id: { title: [{ text: { content: string } }] }
    }
}