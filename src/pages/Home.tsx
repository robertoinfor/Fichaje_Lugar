import { IonButton, IonContent, IonHeader, IonMenu, IonPage, IonRouterLink, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import Axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TopBar from '../components/TopBar';
import Menu from '../components/Menu';
import { useNavigation } from '../hooks/useNavigation';
import { UserResponse } from '../types/UserResponse';

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [menu, setMenu] = useState<HTMLIonMenuElement | null>(null);
  const isAdmin = false;
  const focusRef = useRef<HTMLDivElement>(null);


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
  }

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  async function forgotPassword(email: any) {
    try {
      const response = await Axios.post('http://localhost:8000/forgot-password', { email });

      console.log('Correo de recuperación enviado:', response.data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  }


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
                      <input type="text" name="text" id="text" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                  <form id="forgotPasswordForm" onSubmit={(e) => {
                      e.preventDefault();
                      forgotPassword("robertoinfor03@gmail.com");
                    }}>
                    <input type="email" id="email" placeholder="Introduce tu correo electrónico" required />
                    <button type="submit">Recuperar contraseña</button>
                  </form>                </div>
              </div>
            </div>
          </section>
        </div>
      </IonContent >
    </IonPage >
  );
};


export default Home;
