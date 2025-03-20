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

useEffect(() => {
  generateToken();
  onMessage(messaging, (payload) => {
    console.log(payload);
  })
}, [])


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await Axios.post<UserResponse>('http://localhost:8000/login', { login, password });
      const userName = response.data;
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
      const response = await Axios.get(`http://localhost:8000/GetUserByName/${enteredUser}`);

      if (response.data.results.length === 0) {
        console.log("Usuario no encontrado");
        return;
      }
      const user = response.data.results[0];
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);

      const tokenId = generateVerificationToken();
      setTokenRecovery(tokenId);
      await Axios.post('http://localhost:8000/PostToken', {
        Id: tokenId,
        Estado: "Sin usar",
        Caduca: now.toISOString(),
        Generado: new Date().toISOString(),
        Empleado: user.id,
      });
      setMessage("Se ha enviado un correo a " + maskEmail(user.properties.Email.email) + " con el token de recuperación.")
    } catch (error) {
      console.error('Error al recuperar la contraseña:', error);
    }
  }

  const handleTokenVerification = async () => {
    if (enteredToken === tokenRecovery) {
      try {
        const response = await Axios.post('http://localhost:8000/GetDecryptedPassword', {
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

          <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
              <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Inicia sesión con tu cuenta
                  </h1>
                  <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Usuario/Email</label>
                      <input type="text" name="text" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input type={showPwd ? "text" : "password"} name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 dark:text-gray-300"
                        onClick={() => setShowPwd(!showPwd)}
                      >
                        {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <p>{message}</p>
                        <div className="flex items-center h-5">
                          <input id="remember" aria-describedby="remember"
                            type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                            Remember me
                          </label>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Iniciar Sesión</button>
                  </form>
                  <IonButton onClick={handleClear}>Limpiar</IonButton>
                  <IonButton onClick={() => setShowModal(true)}>¿Has olvidado tu contraseña?</IonButton>

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
              </div>
            </div>
          </section>
        </div>
      </IonContent >
    </IonPage >
  );
};


export default Home;
