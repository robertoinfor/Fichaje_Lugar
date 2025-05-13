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

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  if (title && body) {
    self.registration.showNotification(title, { body });
  }
});
