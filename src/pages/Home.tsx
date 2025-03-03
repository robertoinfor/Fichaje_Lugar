import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogIn from '../components/LogIn';
import Axios from 'axios';
import { useEffect, useState } from 'react';

interface Usuario {
  id: string,
  properties: {
    Nombre: {
      title:
      [{ plain_text: string }]
    },
    Email: { email: string },
    Pwd: { rich_text: [{ text: { content: string } }] },
    Rol: { select: { name: string } }
    Fecha_alta: { date: { start: string } }
  }
}

interface Fichaje {
  Empleado: string,
  Tipo: "Entrada" | "Salida" | "Horas extra" | "Descanso"
  Fecha_hora: Date
}

const Home: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [pwd, setPwd] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [fecha_alta, setFechaAlta] = useState("");

  const [Users, setUsers] = useState<Usuario[]>([]);
  const [Signings, setSignings] = useState<Fichaje[]>([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");



  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    Axios.post('http://localhost:8000/PostUser', {
      Nombre: nombre,
      Pwd: pwd,
      Email: email,
      Rol: rol,
      Fecha_alta: fecha_alta
    }).then(() => {
      handleClear();
      generateData();
    })
      .catch(error => {
        console.log(error);
      });
  };

  const handleClear = () => {
    setNombre("")
    setEmail("")
    setFechaAlta("")
    setRol("")
    setPwd("")
  };

  const handleEdit = (user: Usuario) => {
    setNombre(user.properties.Nombre.title[0].plain_text)
    setEmail(user.properties.Email.email)
    setFechaAlta(user.properties.Fecha_alta.date.start)
    setRol(user.properties.Rol.select.name)
    setPwd(user.properties.Pwd.rich_text[0].text.content)
    setIsEditMode(true);
    setCurrentUserId(user.id);
  };

  const deleteUser = (id: string) => {
    console.log("ID del usuario a eliminar:", id);

    Axios.delete(`http://localhost:8000/DeleteUser/${id}`)
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
  }, [])

  function generateData() {
    Axios.get('http://localhost:8000/GetUsers')
      .then(response => {
        setUsers(response.data.results);
      }).catch(error => {
        console.log(error);
      });
    Axios.get('http://localhost:8000/GetSignings')
      .then(response => {
        setSignings(response.data.results);
      }).catch(error => {
        console.log(error);
      });
  }

  const getEmployeeName = (id: string) => {
    const user = Users.find(
      (user: any) => user.id === id
    );
    return user;
  };

  const updateUser = (id: string) => {
    Axios.put(`http://localhost:8000/UpdateUser/${id}`, {
      Nombre: nombre,
      Email: email,
      Pwd: pwd,
      Rol: rol,
      Fecha_alta: fecha_alta,
    })
      .then((response) => {
        console.log("Usuario actualizado:", response.data);
        generateData();
        setIsEditMode(false);
        setCurrentUserId("");
        handleClear();
      })
      .catch((error) => {
        console.error("Error al actualizar usuario:", error);
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registro de usuarios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="App">
          <header className="App-header">
            <div className="form">
              <form onSubmit={isEditMode ? (e) => { e.preventDefault(); updateUser(currentUserId); } : handleSubmit}>
                <p>Nombre</p>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value) }}
                />

                <p>Contraseña</p>
                <input
                  type="text"
                  placeholder="Contraseña"
                  value={pwd}
                  onChange={(e) => { setPwd(e.target.value) }}
                />

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
                <br />
                <IonButton type="submit">{isEditMode ? 'Editar Usuario' : 'Añadir Usuario'}</IonButton>
              </form>
              <IonButton onClick={handleClear}>Limpiar</IonButton>
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
                      <p><IonButton onClick={() => handleEdit(data)}>Editar Usuario</IonButton></p>
                      <p><IonButton onClick={() => deleteUser(data.id)}>Eliminar Usuario</IonButton></p>
                      <p>-------------------</p>
                    </div>
                  )
                })
              }
            </div>

            <div className="Signings">
              <p>FICHAJES</p>
              {
                Signings.map((data: any) => {
                  return (
                    <div key={data.id}>
                      <p>Empleado: {getEmployeeName(data.properties.Empleado.relation[0].id)?.properties.Nombre.title[0].plain_text}</p>
                      <p>Tipo: {data.properties.Tipo.select.name}</p>
                      <p>Fecha y hora: {data.properties.Fecha_hora.date.start}</p>
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

export default Home;
