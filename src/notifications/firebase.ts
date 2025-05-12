import { initializeApp } from "firebase/app";
import { getAnalytics }  from "firebase/analytics";
import { getMessaging, getToken }  from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const analytics  = getAnalytics(app);
export const messaging  = getMessaging(app);

// Pido permiso para recibir notificaciones y, una vez aceptado, genero el token FCM y lo subo a Notion
export async function generateToken(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permiso de notificaciones denegado");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    if (!token) {
      console.error("No se pudo generar el token FCM");
      return null;
    }

    await axios.post(
      `${ import.meta.env.VITE_URL_CONNECT}fcm/token`,
      { userId, token }
    );

    return token;
  } catch (err) {
    console.error("Error en generateToken():", err);
    return null;
  }
}
