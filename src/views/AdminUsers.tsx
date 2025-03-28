import { IonButton, IonContent, IonHeader, IonMenu, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { Fichaje } from '../types/Signing';
import { User } from '../types/User';

const AdminUsers: React.FC = () => {
    const url_connect = import.meta.env.VITE_URL_CONNECT;

    const [nombre, setNombre] = useState("");
    const [pwd, setPwd] = useState("");
    const [email, setEmail] = useState("");
    const [rol, setRol] = useState("");
    const [fecha_alta, setFechaAlta] = useState("");
    const [horas, setHoras] = useState(0);
    const [checkpwd, setCheckPwd] = useState("");

    const [Users, setUsers] = useState<User[]>([]);
    const [Signings, setSignings] = useState<Fichaje[]>([]);
    
    const [showPwd, setShowPwd] = useState(false);
    const [showSecPwd, setSecShowPwd] = useState(false)


    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [isEditable, setIsEditable] = useState(false);

    const [message, setMessage] = useState("");
    const [originalPwd, setOriginalPwd] = useState("");

    const [workedTime, setWorkedTime] = useState(0);
    const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
    const isAdmin = true; // cambiar


    function validateEmail(mail: string) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(mail);
    }

    function validatePwd(password: string) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-.,?"':{}|<>])[A-Za-z\d!@#$%^&*()_+\-.,?"':{}|<>]{8,}$/;
        return regex.test(password);
    }

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (nombre == "" || pwd == "" || email == "" || rol == "" || fecha_alta == "" || Number.isNaN(horas) || checkpwd == "") {
            setMessage("Introduce todos los datos.")
        } else if (pwd != checkpwd) {
            setMessage("Las dos contraseñas son diferentes.")
        } else if (!validatePwd(pwd)) {
            setMessage("No has introducido una contraseña válida (ocho caracteres, una mayúscula, un carácter especial y un número).")
        } else if (!validateEmail(email)) {
            setMessage("No has introducido un email válido ej: prueba@correo.com.")
        } else {
            setMessage("")
            Axios.post(url_connect+'PostUser', {
                Nombre: nombre,
                Pwd: pwd,
                Email: email,
                Rol: rol,
                Fecha_alta: fecha_alta,
                Horas: horas
            }).then(() => {
                handleClear();
                generateData();
            })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    const handleClear = () => {
        setIsEditMode(false)
        setNombre("")
        setEmail("")
        setFechaAlta("")
        setRol("")
        setPwd("")
        setShowPwd(false)
        setHoras(0)
        setCheckPwd("")
        setSecShowPwd(false)
        setIsEditable(false)
    };

    const handleEdit = (user: User) => {
        setNombre(user.properties.Nombre.title[0].plain_text)
        setEmail(user.properties.Email.email)
        setFechaAlta(user.properties.Fecha_alta.date.start)
        setRol(user.properties.Rol.select.name)
        setPwd("");
        setOriginalPwd(user.properties.Pwd.rich_text[0].text.content);
        setCheckPwd("")
        setShowPwd(false)
        setSecShowPwd(false)
        setHoras(user.properties.Horas.number)
        setIsEditMode(true);
        setCurrentUserId(user.id);
    };

    const deleteUser = (id: string) => {
        Axios.delete(url_connect+`DeleteUser/${id}`)
            .then((response) => {
                console.log("Usuario eliminado:", response.data);
                generateData();
            })
            .catch((error) => {
                console.error("Error al eliminar usuario:", error);
            });
    };

    useEffect(() => {
        generateData()
    }, [isEditMode])

    function generateData() {
        Axios.get(url_connect+'GetUsers')
            .then(response => {
                setUsers(response.data.results);
            }).catch(error => {
                console.log(error);
            });
        Axios.get(url_connect+'GetSignings')
            .then(response => {
                setSignings(response.data.results);
            }).catch(error => {
                console.log(error);
            });
    }

    const updateUser = (id: string) => {
        const passwordToSend = pwd === "" ? originalPwd : pwd;
        if (pwd !== "" && !validatePwd(passwordToSend)) {
            setMessage("No has introducido una contraseña válida (ocho caracteres, una mayúscula, un carácter especial y un número).");
            return;
        }
        if (nombre == "" || passwordToSend == "" || email == "" || rol == "" || fecha_alta == "") {
            setMessage("Introduce todos los datos.")
        } else if (pwd != checkpwd) {
            setMessage("Las dos contraseñas no coinciden.")
        } else if (!validateEmail(email)) {
            setMessage("No has introducido un email válido ej: prueba@correo.com.")
        } else {
            setMessage("")

            Axios.put(url_connect+`UpdateUser/${id}`, {
                Nombre: nombre,
                Email: email,
                Pwd: passwordToSend,
                Rol: rol,
                Fecha_alta: fecha_alta,
                Horas: horas
            })
            .catch((error) => {
                console.error("Error al actualizar usuario:", error);
            });
            setIsEditMode(false);
            setIsEditable(false);
            setCurrentUserId("");
            handleClear();
            generateData();
        };
    }

    const calculateWorkedHours = (userId: string, date: string) => {
        const entries = Signings.filter(fichaje => fichaje.properties.Empleado?.relation[0]?.id === userId && fichaje.properties.Fecha.formula.string === date && fichaje.properties.Tipo.select.name === 'Entrada');
        const exits = Signings.filter(fichaje => fichaje.properties.Empleado?.relation[0]?.id === userId && fichaje.properties.Fecha.formula.string === date && fichaje.properties.Tipo.select.name === 'Salida');

        if (entries.length > 0 && exits.length > 0) {
            const entryTime = new Date(entries[0].properties.Fecha_hora.date.start);
            const exitTime = new Date(exits[0].properties.Fecha_hora.date.start);
            setWorkedTime((exitTime.getTime() - entryTime.getTime()) / (1000 * 3600));
        } else {
            setWorkedTime(0)
        }
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
                    <Menu admin = {isAdmin}/>
                </IonContent>
            </IonMenu>
            <TopBar onMenuClick={() => menu?.open()} />
            <IonContent id="main-content">
                <div className="App">
                    <header className="App-header">
                        <div className="form">
                            <form onSubmit={isEditMode ? (e) => { e.preventDefault(); updateUser(currentUserId); generateData() } : handleSubmit}>
                                <p>Nombre de usuario: </p>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={nombre}
                                    onChange={(e) => { setNombre(e.target.value) }}
                                />
                                {!isEditMode ? (
                                    <>
                                        <p>Contraseña:</p><input
                                            type={showPwd ? "text" : "password"}
                                            placeholder="********"
                                            value={pwd}
                                            onChange={(e) => { setPwd(e.target.value); }} />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-gray-300"
                                            onClick={() => setShowPwd(!showPwd)}
                                        >
                                            {!showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                        <p>Introduzca de nuevo la contraseña: </p><input
                                            type={showSecPwd ? "text" : "password"}
                                            placeholder="********"
                                            value={checkpwd}
                                            onChange={(e) => { setCheckPwd(e.target.value); }} />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-gray-300"
                                            onClick={() => setSecShowPwd(!showSecPwd)}
                                        >
                                            {!showSecPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </>) :
                                    (<>
                                        {isEditable ? (<><p>Nueva contraseña: </p>
                                            <input
                                                type={showPwd ? "text" : "password"}
                                                placeholder="********"
                                                value={pwd}
                                                onChange={(e) => { setPwd(e.target.value); }} />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-gray-300"
                                                onClick={() => setShowPwd(!showPwd)}
                                            >
                                                {!showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                            <p>Introduzca la nueva contraseña de nuevo</p><input
                                                type={showSecPwd ? "text" : "password"}
                                                placeholder="********"
                                                value={checkpwd}
                                                onChange={(e) => { setCheckPwd(e.target.value); }} />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-gray-300"
                                                onClick={() => setSecShowPwd(!showSecPwd)}
                                            >
                                                {!showSecPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>

                                        </>) : (
                                            <IonButton onClick={() => setIsEditable(true)}>Cambiar contraseña</IonButton>
                                        )}
                                    </>)}

                                <p>Email</p>
                                <input
                                    type="text"
                                    placeholder="ejemplo@lugargestioncultural.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value) }}
                                />

                                <p>Fecha de alta</p>
                                <input
                                    type="date"
                                    placeholder="dd/mm/yy"
                                    value={fecha_alta}
                                    onChange={(e) => { setFechaAlta(e.target.value) }}
                                />

                                <p>Rol: </p>
                                <select name="select" value={rol} onChange={(e) => { setRol(e.target.value) }}>
                                    <option value=""></option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Empleado">Empleado</option>
                                    <option value="Alumno en prácticas">Alumno en prácticas</option>
                                </select>

                                <p>Horas de contrato</p>
                                <input
                                    type="number"
                                    min="0"
                                    value={horas || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setHoras(value === '' ? 0 : parseFloat(value));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (/[^0-9]/.test(e.key) && e.key !== 'Backspace') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <br />
                                <IonButton type="submit">{isEditMode ? 'Editar Usuario' : 'Añadir Usuario'}</IonButton>
                            </form>
                            <IonButton onClick={handleClear}>Limpiar</IonButton>
                            <p>{message}</p>
                        </div>

                        <div className="Data">
                            <p>API DATA</p>
                            {
                                Users.map((data: any) => {
                                    return (
                                        <div key={data.id}>
                                            <p>Nombre: {data.properties.Nombre.title[0].plain_text}</p>
                                            <p>Pwd: {data.properties.Pwd.rich_text[0].plain_text}</p>
                                            <p>Email: {data.properties.Email.email}</p>
                                            <p>Rol: {data.properties.Rol.select.name}</p>
                                            <p>Fecha de alta: {data.properties.Fecha_alta.date.start}</p>
                                            <p>Horas de contrato: {data.properties.Horas.number}</p>
                                            <p><IonButton onClick={() => handleEdit(data)}>Editar Usuario</IonButton></p>
                                            <p><IonButton onClick={() => deleteUser(data.id)}>Eliminar Usuario</IonButton></p>
                                            <p>-------------------</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </header>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AdminUsers;
