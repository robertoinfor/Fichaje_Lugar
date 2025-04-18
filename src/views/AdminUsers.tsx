import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonMenu
} from '@ionic/react';
import Axios from 'axios';
import { User } from '../types/User';
import UserForm from '../components/UserForm';
import Menu from '../components/Menu';
import TopBar from '../components/TopBar';
import { UserFormData } from '../types/UserFormData';

const url_connect = import.meta.env.VITE_URL_CONNECT;

const AdminUsersView: React.FC = () => {
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
    const isAdmin = true; // cambiar
    const [users, setUsers] = useState<User[]>([]);
    const [editingMode, setEditingMode] = useState(false);
    const [addMode, setAddingMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await Axios.get(url_connect + 'GetUsers');
            setUsers(response.data.results);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [editingMode, addMode]);

    const handleEdit = async (user: User) => {
        try {
            const response = await Axios.post(url_connect + 'GetDecryptedPasswordByUserId', {
                userId: user.id
            });
            const decryptedPassword = response.data.password;
            const userWithPassword = {
                ...user,
                decryptedPwd: decryptedPassword
            };

            setSelectedUser(userWithPassword);
            setEditingMode(true);
        } catch (error) {
            console.error("Error al obtener la contraseña:", error);
        }
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setAddingMode(true);
    };

    const handleSave = async (formData: UserFormData) => {
        const usernameToCheck = formData["Nombre de usuario"].trim().toLowerCase();

        const isDuplicate = users.some(user => {
            const existingUsername = user.properties["Nombre de usuario"].title[0].plain_text.trim().toLowerCase();
            if (editingMode && selectedUser && user.id === selectedUser.id) {
                return false;
            }
            return existingUsername === usernameToCheck;
        });
    
        if (isDuplicate) {
            alert("Ya existe un usuario con ese nombre de usuario.");
            return;
        }
        let dataToSend = { ...formData } as any;
        if (formData.FotoFile) {
            const uploadData = new FormData();
            uploadData.append('file', formData.FotoFile);
            const uploadResponse = await Axios.post(url_connect + 'upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            dataToSend.FotoUrl = uploadResponse.data.fileUrl;
        }

        dataToSend.Foto = {
            files: [
                {
                    type: "external",
                    name: dataToSend["Nombre de usuario"] + "_perfil",
                    external: { url: dataToSend.FotoUrl }
                }
            ]
        };

        try {
            if (editingMode && selectedUser) {
                await Axios.put(url_connect + `UpdateUser/${selectedUser.id}`, dataToSend);
            } else if (addMode) {
                await Axios.post(url_connect + 'PostUser', dataToSend);
            }
            setEditingMode(false);
            setAddingMode(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };


    const handleChangeState = async (id: string) => {
        let status = selectedUser?.properties.Estado?.status?.name || "";
        let newStatus = "";
        if (status === "Activo") {
            newStatus = "Inactivo";
        } else if (status === "Inactivo") {
            newStatus = "Activo";
        }
        if (selectedUser) {
            const updatedUser = {
              ...selectedUser,
              properties: {
                ...selectedUser.properties,
                Estado: {
                  ...selectedUser.properties.Estado,
                  status: {
                    ...selectedUser.properties.Estado.status,
                    name: newStatus
                  }
                }
              }
            };
            setSelectedUser(updatedUser);
          }
          
        try {
            await Axios.put(url_connect + 'UpdateUserState/' + id, { Estado: newStatus });
            await fetchUsers();
            const updatedUser = users.find(u => u.id === id);
            if (updatedUser) {
                setSelectedUser(updatedUser);
            }
        } catch (error) {
            console.error("Error updating state:", error);
        }
    };


    const handleCancel = () => {
        setEditingMode(false);
        setAddingMode(false);
        setSelectedUser(null);
    };

    return (
        <IonPage>
            <IonMenu side="end" content-id="main-content" ref={setMenu}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Menú</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Menu admin={isAdmin}></Menu>
                </IonContent>
            </IonMenu>

            <TopBar onMenuClick={() => menu?.open()} />

            <IonContent id="main-content">
                {!(editingMode || addMode) ? (
                    <>
                        <IonButton onClick={handleAdd}>Añadir Usuario</IonButton>
                        <IonList>
                            {users.map(user => {
                                const fotoUrl = user.properties.Foto.files[0].external.url;
                                console.log(fotoUrl)
                                return (
                                    <IonItem key={user.id}>
                                        <IonLabel>
                                            <img src={fotoUrl} alt="Foto del usuario" style={{ width: '100px', height: 'auto' }} />
                                            <h2>{user.properties['Nombre de usuario'].title[0].plain_text}</h2>
                                            <p>{user.properties.Email.email}</p>
                                            <p>{user.properties.Rol.select.name}</p>
                                        </IonLabel>
                                        <IonButton onClick={() => handleEdit(user)}>✎</IonButton>
                                    </IonItem>
                                );
                            })}

                        </IonList>

                    </>
                ) : (
                    <>
                        <UserForm
                            key={selectedUser ? selectedUser.id : 'new'}
                            initialData={
                                editingMode && selectedUser
                                    ? {
                                        id: selectedUser.id,
                                        "Nombre de usuario": selectedUser.properties['Nombre de usuario'].title[0].plain_text,
                                        Email: selectedUser.properties.Email.email,
                                        Pwd: (selectedUser as any).decryptedPwd || "",
                                        Rol: selectedUser.properties.Rol.select.name,
                                        Fecha_alta: selectedUser.properties.Fecha_alta.date.start,
                                        Horas: selectedUser.properties.Horas.number,
                                        Foto: selectedUser.properties.Foto.files[0].external.url,
                                        Estado: selectedUser.properties.Estado.status.name,
                                        "Nombre completo": selectedUser.properties['Nombre completo'].rich_text[0].text.content
                                    }
                                    : undefined
                            }
                            onSave={handleSave}
                            onCancel={handleCancel}
                            editing={editingMode}
                            onChangeStatus={handleChangeState}
                        />
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default AdminUsersView;
