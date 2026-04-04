// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyAagsxmjGfN16XijYhcGNG_9yQQyCZ4NRQ",
    authDomain: "mitaxi-ccf5a.firebaseapp.com",
    projectId: "mitaxi-ccf5a",
    storageBucket: "mitaxi-ccf5a.firebasestorage.app",
    messagingSenderId: "739770773255",
    appId: "T1:739770773255:web:70eaa23b593fa19e3bdfa2",
    measurementId: "G-DB0LCFTR5Q"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);