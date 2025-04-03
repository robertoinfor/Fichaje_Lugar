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
import { UserFormData } from '../types/UserFormData';

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

  const [repeatPassword, setRepeatPassword] = useState(initialData?.Pwd || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingPassword, setEditingPassword] = useState(!initialData); // si es nuevo, editar directamente

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[-_!@#$%^&*])[A-Za-z\d\-_\!@#\$%\^&\*]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.Nombre) newErrors.Nombre = "El nombre es obligatorio.";
    if (!formData.Email) newErrors.Email = "El email es obligatorio.";
    else if (!emailRegex.test(formData.Email)) newErrors.Email = "Email no válido.";

    if (editingPassword) {
      if (!formData.Pwd) newErrors.Pwd = "La contraseña es obligatoria.";
      else if (!passwordRegex.test(formData.Pwd)) {
        newErrors.Pwd = "Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";
      }

      if (!repeatPassword) newErrors.Repeat = "Repite la contraseña.";
      else if (formData.Pwd !== repeatPassword) {
        newErrors.Repeat = "Las contraseñas no coinciden.";
      }
    }

    if (!formData.Rol) newErrors.Rol = "El rol es obligatorio.";
    if (!formData.Fecha_alta) newErrors.Fecha_alta = "La fecha es obligatoria.";
    if (!formData.Horas) newErrors.Horas = "Las horas son obligatorias.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof UserFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, FotoFile: files[0] }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalData = { ...formData };
    if (!editingPassword && initialData) {
      finalData.Pwd = initialData.Pwd; // si no se edita, mantener la original
    }

    onSave(finalData);
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
          {errors.Nombre && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Nombre}</p>}

          <IonItem>
            <IonInput
              type="text"
              placeholder="Email"
              value={formData.Email}
              onIonChange={e => handleChange('Email', e.detail.value!)}
            />
          </IonItem>
          {errors.Email && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Email}</p>}

          {initialData && !editingPassword && (
            <IonButton
              expand="block"
              color="medium"
              onClick={() => setEditingPassword(true)}
              style={{ marginBottom: '1rem' }}
            >
              Cambiar contraseña
            </IonButton>
          )}

          {editingPassword && (
            <>
              <IonItem>
                <IonInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={formData.Pwd}
                  onIonChange={e => handleChange('Pwd', e.detail.value!)}
                />
                <IonButton slot="end" fill="clear" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </IonButton>
              </IonItem>
              {errors.Pwd && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Pwd}</p>}

              <IonItem>
                <IonInput
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Repetir Contraseña"
                  value={repeatPassword}
                  onIonChange={e => {
                    setRepeatPassword(e.detail.value!);
                    setErrors(prev => ({ ...prev, Repeat: "" }));
                  }}
                />
                <IonButton slot="end" fill="clear" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
                  {showRepeatPassword ? "Ocultar" : "Mostrar"}
                </IonButton>
              </IonItem>
              {errors.Repeat && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Repeat}</p>}
            </>
          )}

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
          {errors.Rol && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Rol}</p>}

          <IonItem>
            <IonInput
              type="date"
              placeholder="Fecha de alta"
              value={formData.Fecha_alta}
              onIonChange={e => handleChange('Fecha_alta', e.detail.value!)}
            />
          </IonItem>
          {errors.Fecha_alta && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Fecha_alta}</p>}

          <IonItem>
            <IonInput
              type="number"
              placeholder="Horas de contrato"
              value={formData.Horas ? formData.Horas.toString() : ""}
              onIonChange={e => handleChange('Horas', parseFloat(e.detail.value!))}
            />
          </IonItem>
          {errors.Horas && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Horas}</p>}

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
