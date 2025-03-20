importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyANVCuYATVI0iWxjCTYN2hSy_36vbxZKi0",
    authDomain: "lugar-480e8.firebaseapp.com",
    projectId: "lugar-480e8",
    storageBucket: "lugar-480e8.firebasestorage.app",
    messagingSenderId: "951737555296",
    appId: "1:951737555296:web:8db61b83467fc1fa1f2605",
    measurementId: "G-0GDH8GQV7F"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });