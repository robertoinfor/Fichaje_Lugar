import { IonContent, IonHeader, IonInput, IonMenu, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Eraser, Eye, EyeOff } from 'lucide-react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useNavigation } from '../hooks/useNavigation';
import { UserResponse } from '../types/UserResponse';
import CustomBttn from '../components/CustomBttn';
import './Home.css'
import '../styles/global.css'
import Footer from '../components/Footer';
import { generateToken, messaging } from '../notifications/firebase';
import { onMessage } from 'firebase/messaging';
import {
  isSupported as messagingSupported
} from 'firebase/messaging';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRemember, setIsRemember] = useState(false)

  const [enteredToken, setEnteredToken] = useState('');
  const [enteredUser, setEnteredUser] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [realPwd, setRealPwd] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [tokenId, setTokenId] = useState('');

  const url_connect = import.meta.env.VITE_URL_CONNECT;

  const passwordRef = useRef<HTMLIonInputElement>(null);

  // Si se han guardado los datos de inicio de sesión, va a la siguiente página
  useEffect(() => {
    const storedUser = localStorage.getItem('rememberedUser');
    
    if (storedUser) {
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
      navigation.push('/home/signing', 'forward', 'push');
    }
  }, []);

  // Comprueba si el usuario es Administrador
  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol === 'Administrador') {
      setIsAdmin(true);
    }
  }, []);

  // Comprueba si el entorno es soportado por Firebase, registra el servicio y espera a la llegada de mensajes
  useEffect(() => {
    messagingSupported().then(supported => {
      if (!supported) {
        console.log('⚠️ Firebase Messaging no soportado en este entorno');
        return;
      }
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(() => {
          onMessage(messaging, payload => {
            const { title, body } = payload.notification || {};
            if (title && body) {
              new Notification(title, { body });
            }
          });
        })
        .catch(err => console.error('Error registrando SW:', err));
    });
  }, []);

  // Recoge los datos de los campos, comprueba que los datos son correctos,
  //  actualiza datos del usuario, genera el token FCM y cambia de vista
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = await passwordRef.current?.getInputElement();
    const finalPassword = input?.value || '';

    try {
      if (!login) {
        setMessage('Introduce el nombre de usuario/correo corporativo');
        return;
      }

      if (!finalPassword) {
        setMessage('Introduce la contraseña');
        return;
      }

      const response = await Axios.post<UserResponse>(
        `${url_connect}users/login`,
        { login, password: finalPassword }
      );
      handleClear();
      localStorage.setItem('userName', response.data.nombre);
      localStorage.setItem('id', response.data.id);
      localStorage.setItem('rol', response.data.rol);

      const supported = await messagingSupported();
      if (supported) {
        try {
          await generateToken(response.data.id);
        } catch (err) {
          console.warn('⚠️ No se pudo generar token FCM:', err);
        }
      } else {
        console.log('⚠️ Omitiendo generación de token FCM');
      }
      Axios.put(`${url_connect}users/${response.data.id}/log`, {
        Conexion: 'Online'
      });
      document.activeElement instanceof HTMLElement && document.activeElement.blur();

      if (isRemember) {
        handleRemember(login, finalPassword)
      }

      navigation.push('/home/signing', 'forward', 'push');
    } catch (error: any) {
      console.error('🔥 Login error:', error);
      if (Axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          setMessage('No existe ese usuario.');
          setLogin('');
          setPassword('');
        } else if (error.response.status === 401) {
          setMessage('Contraseña incorrecta.');
        } else {
          setMessage('Ocurrió un error al intentar iniciar sesión.');
        }
      } else if (Axios.isAxiosError(error)) {
        setMessage('Ocurrió un error de red.');
      } else {
        setMessage('Ocurrió un error inesperado.');
      }
    }
  };

  // Limpia variables
  const handleClear = () => {
    setLogin('');
    setPassword('');
    setMessage('');
    setShowPwd(false);
    setEnteredToken('');
    setRealPwd('');
    setShowPassword(false);
  };

  // Función para recordar 
  const handleRemember = (user: string, pwd: string) => {
    localStorage.setItem('rememberedUser', user)
    localStorage.setItem('rememberedPwd', pwd)
  }

  // Función para ocultar parte del email mostrado
  function maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return email;
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-3);
    const maskedMiddle = '*'.repeat(
      localPart.length - 9 > 0 ? localPart.length - 9 : 3
    );
    return `${visibleStart}${maskedMiddle}${visibleEnd}@${domain}`;
  }

  // Función para enviar el token de recuperación por correo al usuario especificado
  async function forgotPassword() {
    if (!enteredUser) {
      setMessage('Introduce un usuario.');
      return;
    }
    try {
      const response = await Axios.get(
        `${url_connect}users/${enteredUser}`
      );
      if (response.data.results.length === 0) {
        setMessage('No existe ese usuario.');
        return;
      }
      const user = response.data.results[0];
      setUserId(user.id);
      const response2 = await Axios.post(`${url_connect}tokens`, {
        Empleado: user.id
      });
      setTokenId(response2.data.tokenId);
      setMessage(
        `Se ha enviado un correo a ${maskEmail(
          user.properties.Email.email
        )} con el token de recuperación.`
      );
    } catch (err) {
      console.error('Error al recuperar la contraseña:', err);
    }
  }

  // Comprueba que el token introducido existe, te devuelve la contraseña desencriptada y borra el token
  const handleTokenVerification = async () => {
    try {
      const resp = await Axios.post(
        `${url_connect}tokens/decrypt`,
        { token: enteredToken }
      );
      if (resp.status === 200) {
        const resp2 = await Axios.post(
          `${url_connect}users/decrypt`,
          { userId }
        );
        await Axios.delete(
          `${url_connect}tokens/${tokenId}/delete`
        );
        if (resp2.status === 200) {
          setRealPwd(resp2.data.password);
          setShowPassword(true);
          setMessage('');
        } else {
          setMessage('No se pudo recuperar la contraseña.');
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setMessage('El token ha expirado.');
      } else if (err.response?.status === 404) {
        setMessage('El token no es válido.');
      } else {
        setMessage('Error al verificar token.');
      }
    }
  };

  // Limpia campos al abrir la pestaña
  useEffect(() => {
    if (showModal) handleClear();
  }, [showModal]);

  return (
    <IonPage>
      <IonMenu side="end" contentId="main-content" ref={setMenu} type="overlay">
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
      <IonContent id="main-content" fullscreen>
        <div tabIndex={-1} style={{ outline: 'none' }}>
          <section className="login-section">
            <div className="login-box">
              <div className="login-header">
                <h1>Fichaje</h1>
                <div className="login-divider" />
              </div>
              <form onSubmit={handleLogin}>
                <div className="label-with-eraser">
                  <label className="input-label" >Ingrese su usuario/email:</label>
                  <Eraser size={20} onClick={() => setLogin("")} className="eraser-icon" />
                </div>
                <div className="input-group">
                  <IonInput
                    id="login"
                    type="text"
                    className="input-field"
                    value={login}
                    onIonChange={(e) => setLogin(e.detail.value!)}
                    autoFocus
                  />
                  <span className="input-decor">❯❯</span>
                </div>

                <div className="label-with-eraser">
                  <label className="input-label" >Ingrese su contraseña:</label>
                  <Eraser size={20} onClick={() => setPassword("")} className="eraser-icon" />
                </div>
                <div className="input-group">
                  <IonInput
                    ref={passwordRef}
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    className="input-field"
                    value={password}
                    onIonChange={e => setPassword(e.detail.value!)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPwd(s => !s)}
                  >
                    <div className="password-wrapper" style={{ color: 'var(--text-base)' }}>
                      {showPwd
                        ? <EyeOff size={18} color="currentColor" />
                        : <Eye size={18} color="currentColor" />
                      }
                    </div>                  </button>
                </div>

                <div className="forgot-password" onClick={() => setShowModal(true)}>
                  ¿Has olvidado tu contraseña?
                </div>

                <div className="checkbox-group">
                  <input type="checkbox" id="rememberMe" onClick={() => setIsRemember(!isRemember)} />
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