import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1uIznyb2D1jtlRWfX7wdatrchDwkv7HA",
  authDomain: "sanskrit-setu-6419d.firebaseapp.com",
  projectId: "sanskrit-setu-6419d",
  storageBucket: "sanskrit-setu-6419d.firebasestorage.app",
  messagingSenderId: "572551272156",
  appId: "1:572551272156:web:c0e9c0ac326915776c4619",
  measurementId: "G-NC8XLH9T33",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
