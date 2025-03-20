import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyANVCuYATVI0iWxjCTYN2hSy_36vbxZKi0",
  authDomain: "lugar-480e8.firebaseapp.com",
  projectId: "lugar-480e8",
  storageBucket: "lugar-480e8.firebasestorage.app",
  messagingSenderId: "951737555296",
  appId: "1:951737555296:web:8db61b83467fc1fa1f2605",
  measurementId: "G-0GDH8GQV7F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Permiso concedido para notificaciones");

      const token = await getToken(messaging, {
        vapidKey: "BH48DIZLNmSmKoLAMSrd85RlwrryxldY3eB6tqKaPwKOS_7JW27J4JVxVXwibWfGb9sOTexIl0g_1WPz3Fw3uRA",
      });

      if (token) {
        console.log("Token generado:", token);

        await fetch("/saveUserToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } else {
        console.log("No se pudo generar el token FCM");
      }
    } else {
      console.log("Permiso no concedido para notificaciones");
    }
  } catch (error) {
    console.error("Error al generar el token FCM:", error);
  }
};
