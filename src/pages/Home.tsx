import { IonContent, IonHeader, IonMenu, IonModal, IonPage, IonRouterLink, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Eraser, Eye, EyeOff } from 'lucide-react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useNavigation } from '../hooks/useNavigation';
import { UserResponse } from '../types/UserResponse';
import CustomBttn from '../components/CustomBttn';
import './Home.css'
import Footer from '../components/Footer';
import { generateToken, messaging } from '../notifications/firebase';
import { getToken, onMessage } from 'firebase/messaging';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const isAdmin = false;
  const focusRef = useRef<HTMLDivElement>(null);
  const [enteredToken, setEnteredToken] = useState('');
  const [enteredUser, setEnteredUser] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [realPwd, setRealPwd] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState("");
  const url_connect = import.meta.env.VITE_URL_CONNECT;

  useEffect(() => {
    const storedUser = localStorage.getItem('userName');
    const storedId = localStorage.getItem('id');
    if (storedUser && storedId) {
      navigation.push('/home/signing', 'forward', 'push');
    }
  }, [])

  useEffect(() => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then(registration => {
        onMessage(messaging, payload => {
          const { title, body } = payload.notification || {};
          if (title && body) {
            new Notification(title, { body });
          }
        });
      })
      .catch(err => console.error('Error registrando SW:', err));
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (login == "") {
        setMessage("Introduce el nombre de usuario/correo corporativo")
      } else if (password == "") {
        setMessage("Introduce la contraseña")
      } else {
        const response = await Axios.post<UserResponse>(url_connect + 'login', { login, password });
        const userName = response.data;
        handleClear();
        localStorage.setItem('userName', userName.nombre);
        localStorage.setItem('id', response.data.id);
        await generateToken(response.data.id);

        Axios.put(url_connect + 'UpdateUserLog/' + response.data.id, {
          Conexion: "Online"
        });
        navigation.push('/home/signing', 'forward', 'push');
      }
    } catch (error) {
      if (Axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            setMessage("No existe ese usuario.");
            setLogin("")
            setPassword("")
          }
          else if (error.response.status === 401) {
            setMessage("Contraseña incorrecta.");
          }
          else {
            setMessage("Ocurrió un error al intentar iniciar sesión.");
          }
        } else {
          setMessage("Ocurrió un error de red.");
        }
      } else {
        setMessage("Ocurrió un error inesperado.");
      }
    }
  };

  const handleClear = () => {
    setLogin("")
    setPassword("")
    setMessage("")
    setShowPwd(false)
    setEnteredToken("")
    setRealPwd("")
    setMessage("")
    setShowPassword(false)
  }

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  function maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");

    if (localPart.length <= 3) return email;

    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-3);
    const maskedMiddle = "*".repeat(localPart.length - 9 > 0 ? localPart.length - 9 : 3);

    return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
  }

  async function forgotPassword() {
    if (enteredUser == "") { return setMessage("Introduce un usuario.") }
    try {
      const response = await Axios.get(url_connect + `GetUserByName/${enteredUser}`);
      if (response.data.results.length === 0) {
        setMessage("No existe ese usuario.")
        return;
      }
      const user = response.data.results[0];
      setUserId(user.id)
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);

     await Axios.post(url_connect + 'PostToken', {
        Empleado: user.id,
      });
      setMessage("Se ha enviado un correo a " + maskEmail(user.properties.Email.email) + " con el token de recuperación.")
    } catch (error) {
      console.error('Error al recuperar la contraseña:', error);
    }
  }

  const handleTokenVerification = async () => {
    try {
      const response = await Axios.post(
        url_connect + 'VerifyToken',
        { token: enteredToken,
          empleado: userId
         }
      );
      if (response.status = 200) {
        const response2 = await Axios.post(url_connect + 'GetDecryptedPassword', {
          token: enteredToken,
          empleado: userId
        }).then(

        );
        if (response2.status === 200) {
          setRealPwd(response2.data.password);
          setShowPassword(true);
          setMessage("");
        } else {
          setMessage('No se pudo recuperar la contraseña.');
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setMessage("El token ha expirado.");
      } else if (error.response && error.response.status === 404) {
        setMessage("Token no encontrado.");
      } else {
        setMessage("Error al verificar token.");
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      handleClear();
    }
  }, [showModal]);

  return (
    <IonPage>
      <IonMenu side="end" content-id="main-content" ref={setMenu}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menú</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Menu admin={isAdmin} />
        </IonContent>
      </IonMenu>
      <TopBar onMenuClick={() => menu?.open()} />
      <IonContent id="main-content">
        <div ref={focusRef} tabIndex={-1} style={{ outline: 'none' }}>

          <section className="login-section">
            <div className="login-box">
              <div className="login-header">
                <h1>Fichaje</h1>
                <div className="login-divider" />
              </div>
              <form onSubmit={handleLogin}>
                <div className="label-with-eraser">
                  <label className="input-label" htmlFor="login">Ingrese su usuario/email:</label>
                  <Eraser size={20} onClick={() => setLogin("")} className="eraser-icon" />
                </div>
                <div className="input-group">
                  <input
                    id="login"
                    type="text"
                    className="input-field"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                  <span className="input-decor">❯❯</span>
                </div>


                <div className="label-with-eraser">
                  <label className="input-label" htmlFor="password">Ingrese su contraseña:</label>
                  <Eraser size={20} onClick={() => setPassword("")} className="eraser-icon" />
                </div>
                <div className="input-group">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="input-decor password-icon"
                    onClick={() => setShowPwd(!showPwd)}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>


                <div className="forgot-password" onClick={() => setShowModal(true)}>
                  ¿Has olvidado tu contraseña?
                </div>

                <div className="checkbox-group">
                  <input type="checkbox" id="rememberMe" />
                  <label htmlFor="rememberMe">Recordarme la próxima vez</label>
                </div>

                {message && <p className="error-message">{message}</p>}

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <CustomBttn text="ACCEDER" width="160px" type='submit' />
                </div>
              </form>
              <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className='custom-modal'>
                <div className="modal-content">
                  <div className="label-with-eraser">
                    <label className="input-label" htmlFor="recovery-user">Ingrese su usuario:</label>
                  </div>
                  <div className="input-group">
                    <input
                      id="recovery-user"
                      type="text"
                      className="input-field"
                      placeholder="Nombre de usuario"
                      value={enteredUser}
                      onChange={(e) => setEnteredUser(e.target.value)}
                    />
                    <span className="input-decor">❯❯</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CustomBttn text="Mandar clave" onClick={forgotPassword} width="200px" />
                  </div>
                  {message && <p className="error-message" style={{ marginTop: '10px' }}>{message}</p>}

                  <div className="label-with-eraser" style={{ marginTop: '1.5rem' }}>
                    <label className="input-label" htmlFor="recovery-token">Ingrese la clave:</label>
                  </div>
                  <div className="input-group">
                    <input
                      id="recovery-token"
                      type="text"
                      className="input-field"
                      placeholder="Token de recuperación"
                      value={enteredToken}
                      onChange={(e) => setEnteredToken(e.target.value)}
                    />
                    <span className="input-decor">❯❯</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CustomBttn text="Recuperar contraseña" onClick={handleTokenVerification} width="240px" />
                  </div>

                  {showPassword && (
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '1rem' }}>
                      Contraseña: <strong>{realPwd}</strong>
                    </p>
                  )}


                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <CustomBttn text="Cerrar" onClick={() => { setShowModal(false); setMessage("") }} width="140px" />
                  </div>
                </div>
              </IonModal>

            </div>
          </section>
        </div>
        <Footer />
      </IonContent >
    </IonPage >
  );
};

export default Home;