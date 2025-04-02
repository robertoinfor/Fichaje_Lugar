import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel
} from '@ionic/react';

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

interface UserFormProps {
  initialData?: UserFormData;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserFormData>({
    Nombre: initialData?.Nombre || "",
    Email: initialData?.Email || "",
    Pwd: initialData?.Pwd || "",
    Rol: initialData?.Rol || "",
    Fecha_alta: initialData?.Fecha_alta || "",
    Horas: initialData?.Horas || 0,
    Foto: initialData?.Foto || "",
  });

  const handleChange = (field: keyof UserFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, FotoFile: files[0] }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{initialData ? "Editar Usuario" : "Añadir Usuario"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonInput
              placeholder="Nombre de usuario"
              value={formData.Nombre}
              onIonChange={e => handleChange('Nombre', e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="text"
              placeholder="Email"
              value={formData.Email}
              onIonChange={e => handleChange('Email', e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="password"
              placeholder="Contraseña"
              value={formData.Pwd}
              onIonChange={e => handleChange('Pwd', e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonSelect
              value={formData.Rol}
              placeholder="Selecciona Rol"
              onIonChange={e => handleChange('Rol', e.detail.value)}
            >
              <IonSelectOption value="Administrador">Administrador</IonSelectOption>
              <IonSelectOption value="Empleado">Empleado</IonSelectOption>
              <IonSelectOption value="Alumno en prácticas">Alumno en prácticas</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonInput
              type="date"
              placeholder="Fecha de alta"
              value={formData.Fecha_alta}
              onIonChange={e => handleChange('Fecha_alta', e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="number"
              placeholder="Horas de contrato"
              value={formData.Horas ? formData.Horas.toString() : ""}
              onIonChange={e => handleChange('Horas', parseFloat(e.detail.value!))}
            />
          </IonItem>
          <IonItem>
            <IonLabel>Foto</IonLabel>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </IonItem>
          {formData.Foto && (
            <IonItem>
              <img src={formData.Foto} alt="Foto actual" style={{ width: '100px', height: 'auto' }} />
            </IonItem>
          )}
          <IonButton type="submit" expand="block" style={{ marginTop: '1rem' }}>
            Guardar cambios
          </IonButton>
          <IonButton color="medium" expand="block" onClick={onCancel} style={{ marginTop: '0.5rem' }}>
            Cancelar
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default UserForm;
