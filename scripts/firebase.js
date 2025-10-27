import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCXLVRn8GWGz5pkDfHlgVcJcXFWbjsHYxM",
    authDomain: "kalkulukova.firebaseapp.com",
    databaseURL: "https://kalkulukova-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kalkulukova",
    storageBucket: "kalkulukova.appspot.com",
    messagingSenderId: "1085042022024",
    appId: "1:1085042022024:web:2578388a3bce759328313d"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database }
