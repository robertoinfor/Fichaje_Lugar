import { IonButton, IonContent, IonHeader, IonMenu, IonModal, IonPage, IonRouterLink, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useNavigation } from '../hooks/useNavigation';
import { UserResponse } from '../types/UserResponse';
import { generateToken, messaging } from '../notifications/firebase';
import { onMessage } from 'firebase/messaging';
import CustomBttn from '../components/CustomBttn';
import { Eraser } from 'lucide-react';
import './Home.css'
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const isAdmin = false;
  const focusRef = useRef<HTMLDivElement>(null);
  const [tokenRecovery, setTokenRecovery] = useState("");
  const [enteredToken, setEnteredToken] = useState('');
  const [enteredUser, setEnteredUser] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [realPwd, setRealPwd] = useState('');
  const [showModal, setShowModal] = useState(false);
  const url_connect = import.meta.env.VITE_URL_CONNECT;

  useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log(payload);
    })
  }, [])


  const handleLogin = async () => {
    try {
      const response = await Axios.post<UserResponse>(url_connect + 'login', { login, password });
      const userName = response.data;
      generateToken(response.data.id);
      handleClear();
      localStorage.setItem('userName', userName.nombre);
      localStorage.setItem('id', response.data.id)
      navigation.push('/home/signing', 'forward', 'push');
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

  function generateVerificationToken(length: number = 16): string {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function forgotPassword() {
    try {
      const response = await Axios.get(url_connect + `GetUserByName/${enteredUser}`);

      if (response.data.results.length === 0) {
        console.log("Usuario no encontrado");
        return;
      }
      const user = response.data.results[0];
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);

      const tokenId = generateVerificationToken();
      setTokenRecovery(tokenId);
      await Axios.post(url_connect + 'PostToken', {
        Id: tokenId,
        Estado: "Sin usar",
        Empleado: user.id,
      });
      setMessage("Se ha enviado un correo a " + maskEmail(user.properties.Email.email) + " con el token de recuperación.")
    } catch (error) {
      console.error('Error al recuperar la contraseña:', error);
    }
  }

  const handleTokenVerification = async () => {
    if (enteredToken === tokenRecovery && tokenRecovery) {
      try {
        const response = await Axios.post(url_connect + 'GetDecryptedPassword', {
          token: enteredToken
        });

        if (response.status === 200) {
          setRealPwd(response.data.password);
          setShowPassword(true);
        } else {
          setMessage('No se pudo recuperar la contraseña.');
        }
      } catch (error) {
        setMessage("Hubo un error al recuperar la contraseña.");
      }
    } else {
      setMessage("El token ingresado no es válido.");
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
              <h1>Fichaje</h1>
              <div className="login-divider" />
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
                  <CustomBttn text="ACCEDER" onClick={handleLogin} width="160px" />
                </div>
              </form>
              <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                <div className="p-4">
                  <h2 className="text-xl">Recuperación de Contraseña</h2>
                  <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={enteredUser}
                    onChange={(e) => setEnteredUser(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <IonButton onClick={forgotPassword}>Enviar Token</IonButton>

                  {message && <p>{message}</p>}
                  <div>
                    <input
                      type="text"
                      placeholder="Token de recuperación"
                      value={enteredToken}
                      onChange={(e) => setEnteredToken(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    <IonButton onClick={handleTokenVerification}>Verificar Token</IonButton>
                  </div>

                  {showPassword && <p>Contraseña recuperada: {realPwd}</p>}

                  <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
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