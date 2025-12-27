// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoScW3bIlHMczJ7RQ64A86kCS4h7mPCyA",
  authDomain: "teehubshop-43bcb.firebaseapp.com",
  projectId: "teehubshop-43bcb",
  storageBucket: "teehubshop-43bcb.firebasestorage.app",
  messagingSenderId: "804223644617",
  appId: "1:804223644617:web:6f646d081f523363732e18",
  measurementId: "G-VN1Y9MLTNJ",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Optional: Enable analytics only in browser (avoid SSR errors)
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) getAnalytics(app);
  });
}

// ✅ Add this line
export { app, RecaptchaVerifier, signInWithPhoneNumber };
