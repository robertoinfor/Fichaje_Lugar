import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogIn from '../components/LogIn';
import Axios from 'axios';
import { useEffect, useState } from 'react';

interface Usuario {
  Nombre: string,
  Email: string,
  Rol: 'Administrador' | "Empleado" | "Estudiante en prácticas"
  Fecha_alta: Date
}

const Home: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [pwd, setPwd] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [fecha_alta, setFechaAlta] = useState("");
  
  const [APIData, setAPIData] = useState<Usuario[]>([]);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    Axios.post('http://localhost:8000/NotionAPIPost', {
      Nombre: nombre,
      Pwd: pwd,
      Email: email,
      Rol: rol,
      Fecha_alta: fecha_alta
    }).then(() => {
      handleClear
      generateData();
    })
      .catch(error => {
        console.log(error);
      });
  };

  const handleClear = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setNombre("")
    setEmail("")
    setFechaAlta("")
    setRol("")
    setPwd("")

  };

  useEffect(() => {
    generateData()
  }, [])

  function generateData() {
    Axios.get('http://localhost:8000/NotionAPIGet')
      .then(response => {
        setAPIData(response.data.results);
        console.log(response.data.results);
      }).catch(error => {
        console.log(error);
      });
  }

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
              <form onSubmit={handleSubmit}>
                <p>Nombre</p>
                <input
                  type="text"
                  placeholder="Nombre"
                  onChange={(e) => { setNombre(e.target.value) }}
                />

                <p>Contraseña</p>
                <input
                  type="text"
                  placeholder="Contraseña"
                  onChange={(e) => { setPwd(e.target.value) }}
                />

                <p>Email</p>
                <input
                  type="text"
                  placeholder="ejemplo@lugargestioncultural.com"
                  onChange={(e) => { setEmail(e.target.value) }}
                />

                <p>Fecha de alta</p>
                <input
                  type="date"
                  placeholder="dd/mm/yy"
                  onChange={(e) => { setFechaAlta(e.target.value) }}
                />

                <p>Rol: </p>
                <select name="select" onChange={(e) => { setRol(e.target.value) }}>
                <option value=""></option>
                  <option value="Administrador">Administrador</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Alumno en prácticas">Alumno en prácticas</option>
                </select>
                <button type="submit">Submit</button>
              </form>
              <IonButton onClick={handleClear}>Limpiar</IonButton>
            </div>

            <div className="Data">
              <p>API DATA</p>
              {
                APIData.map((data: any) => {
                  return (
                    <div key={data.id}>
                      <p>Nombre: {data.properties.Nombre.title[0].plain_text}</p>
                      <p>Pwd: {data.properties.Pwd.rich_text[0].plain_text}</p>
                      <p>Email: {data.properties.Email.rich_text[0].plain_text}</p>
                      <p>Rol: {data.properties.Rol.rich_text[0].plain_text}</p>
                      <p>Fecha de alta: {data.properties.Fecha_alta.rich_text[0].plain_text}</p>
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
