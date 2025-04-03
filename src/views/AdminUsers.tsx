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
    }, []);

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
                    name: dataToSend.Nombre,
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


    const handleDelete = async (id: string) => {
        try {
            await Axios.delete(url_connect + 'DeleteUser/' + id)
                .then(() => {
                    return fetchUsers();
                })
                .then(() => {
                    setSelectedUser(null);
                    setEditingMode(false);
                })
                .catch((error) => {
                    console.error("Error updating event:", error);
                });
        } catch (error) {
            console.error("Error saving user:", error);
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
                                            <h2>{user.properties.Nombre.title[0].plain_text}</h2>
                                            <p>{user.properties.Email.email}</p>
                                            <p>{user.properties.Rol.select.name}</p>
                                        </IonLabel>
                                        <IonButton onClick={() => handleEdit(user)}>✎</IonButton>
                                        <IonButton onClick={() => handleDelete(user.id)}>🗑️</IonButton>
                                    </IonItem>
                                );
                            })}

                        </IonList>

                    </>
                ) : (
                    <>
                        <UserForm
                            initialData={
                                editingMode && selectedUser
                                    ? {
                                        Nombre: selectedUser.properties.Nombre.title[0].plain_text,
                                        Email: selectedUser.properties.Email.email,
                                        Pwd: (selectedUser as any).decryptedPwd || "",
                                        Rol: selectedUser.properties.Rol.select.name,
                                        Fecha_alta: selectedUser.properties.Fecha_alta.date.start,
                                        Horas: selectedUser.properties.Horas.number,
                                        Foto: selectedUser.properties.Foto.files[0].external.url
                                    }
                                    : undefined
                            }
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />

                    </>
                )}


            </IonContent>
        </IonPage>
    );
};

export default AdminUsersView;
