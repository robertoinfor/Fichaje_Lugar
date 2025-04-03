export interface UserFormData {
  Nombre: string;
  Email: string;
  Pwd: string;
  Rol: string;
  Fecha_alta: string;
  Horas: number;
  Foto?: string;
  FotoFile?: File;
}