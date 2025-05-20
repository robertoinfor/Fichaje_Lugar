import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { UserFormData } from '../types/UserFormData';
import CustomBttn from './CustomBttn';

interface UserFormProps {
  initialData?: UserFormData;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
  editing: boolean;
  onChangeStatus: (id: string) => Promise<"Activo" | "Inactivo" | undefined>;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSave, onCancel, editing, onChangeStatus }) => {
  const [formData, setFormData] = useState<UserFormData>({
    "Nombre de usuario": initialData?.['Nombre de usuario'] || "",
    Email: initialData?.Email || "",
    Pwd: initialData?.Pwd || "",
    Rol: initialData?.Rol || "",
    Fecha_alta: initialData?.Fecha_alta || "",
    Horas: initialData?.Horas || "00:00",
    Foto: initialData?.Foto || "",
    Estado: initialData?.Estado || "",
    "Nombre completo": initialData?.['Nombre completo'] || ""
  });

  const [repeatPassword, setRepeatPassword] = useState(initialData?.Pwd || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[-_!@#$%^&*])[A-Za-z\d\-_\!@#\$%\^&\*]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData['Nombre de usuario']) newErrors.Nombre = "El nombre de usuario es obligatorio.";
    if (!formData.Email) newErrors.Email = "El email es obligatorio.";
    else if (!emailRegex.test(formData.Email)) newErrors.Email = "Email no válido.";

    if (!formData.Pwd) newErrors.Pwd = "La contraseña es obligatoria.";
    else if (!passwordRegex.test(formData.Pwd)) {
      newErrors.Pwd = "Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.";
    }

    if (!repeatPassword) newErrors.Repeat = "Repite la contraseña.";
    else if (formData.Pwd !== repeatPassword) {
      newErrors.Repeat = "Las contraseñas no coinciden.";
    }

    if (!formData.Rol) newErrors.Rol = "El rol es obligatorio.";
    if (!formData.Fecha_alta) newErrors.Fecha_alta = "La fecha es obligatoria.";
    if (!formData.Horas) newErrors.Horas = "Las horas son obligatorias.";
    if (!formData['Nombre completo']) newErrors.Horas = "Introduzca el nombre completo.";
    if (!formData.Foto) newErrors.Foto = "Añada una foto"

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setRepeatPassword(initialData.Pwd || "");
    }
  }, [initialData]);


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
    if (initialData) {
      finalData.Pwd = initialData.Pwd;
    }

    onSave(finalData);
  };

  const normalizeTime = (timeStr: string): string => {
    const [h, m] = timeStr.split(":");
    const hh = h.length === 1 ? '0' + h : h;
    const mm = m.length === 1 ? '0' + m : m;
    return `${hh}:${mm}`;
  };

  return (
    <IonCard className="user-card">
      <IonCardHeader>
        <IonCardTitle className="form-title">
          {editing ? (
            <>
              Edición de usuarios
            </>
          ) : (
            <>
              Nuevo usuario
            </>
          )}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonInput
              placeholder="Nombre de usuario"
              value={formData['Nombre de usuario']}
              onIonChange={e => handleChange('Nombre de usuario', e.detail.value!)}
            />
          </IonItem>
          {errors.Nombre && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Nombre}</p>}

          <IonItem>
            <IonInput
              placeholder="Nombre completo"
              value={formData['Nombre completo']}
              onIonChange={e => handleChange('Nombre completo', e.detail.value!)}
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
            <IonLabel position="floating" style={{ marginBottom: '10px' }}>Horas de contrato</IonLabel>
            <IonInput
              type="time"
              placeholder="Horas de contrato"
              value={normalizeTime(formData.Horas.toString()) || ""}
              onIonChange={e => handleChange('Horas', e.detail.value!)}
            />
          </IonItem>
          {errors.Horas && <p style={{ color: 'red', marginLeft: 15 }}>{errors.Horas}</p>}

          {formData.Foto && (
            <>
              <IonItem lines="none">
                <img src={formData.Foto} alt="Foto actual" style={{ width: '100px', height: 'auto' }} />
              </IonItem>
              <IonItem lines="none">
                <p style={{ marginLeft: '15px' }}>Inserte una nueva imagen para reemplazar la actual:</p>
              </IonItem>
            </>
          )}
          <IonItem>
            <IonLabel>Foto</IonLabel>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </IonItem>

          {editing && (
            <CustomBttn
              text={formData.Estado === "Activo" ? "Dar de baja" : "Reactivar cuenta"}
              onClick={async () => {
                if (!initialData?.id) return;

                const newEstado = await onChangeStatus(initialData.id);
                if (newEstado) {
                  setFormData(prev => ({
                    ...prev,
                    Estado: newEstado
                  }));
                }
              }}
              width="100%"
            />
          )}

          <CustomBttn
            text={editing ? 'Guardar cambios' : 'Añadir usuario'}
            type="submit"
            width='100%'
          />

          <CustomBttn
            text="Cancelar"
            onClick={onCancel}
            disabled={false}
            width='100%'
          />
        </form>
      </IonCardContent>
    </IonCard>
  );
};

export default UserForm;
