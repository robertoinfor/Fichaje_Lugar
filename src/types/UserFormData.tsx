export interface UserFormData {
  id?: string;
  "Nombre de usuario": string;
  Email: string;
  Pwd: string;
  Rol: string;
  Fecha_alta: string;
  Horas: number;
  Foto?: string;
  FotoFile?: File;
  Estado: string;
  "Nombre completo": string
}