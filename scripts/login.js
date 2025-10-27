import { auth, database } from './firebase.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { alertPopup } from './alert_popup.js';

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const usersRef = ref(database, "users");
        const queryByUsername = query(usersRef, orderByChild("username"), equalTo(username));
        const snapshot = await get(queryByUsername);

        if (!snapshot.exists()) {
            alertPopup("Username not found!", "Enter another username or create one!");
            return;
        }

        const userData = Object.values(snapshot.val())[0];

        await signInWithEmailAndPassword(auth, userData.email, password);

        sessionStorage.setItem("kalkulukovaUID", userData.uid);
        sessionStorage.setItem("alertTitle", "Login successful!");
        sessionStorage.setItem("alertMessage", `Welcome back to Kalkulukova, ${userData.nameGiven}!`);
        
        window.location.href = "home.html";
    } catch (error) {
        console.error("Error during login with username and password:", error.message);
        alertPopup("Login failed!", error.message);
    }
});

document.getElementById("google-login-button").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            alertPopup("User does not exist in the database.", "Please signup first.");
            return;
        }
        const userData = snapshot.val();
  
        sessionStorage.clear();
        sessionStorage.setItem("kalkulukovaUID", user.uid);
        sessionStorage.setItem("loginWithGoogle", "yes");
        sessionStorage.setItem("alertTitle", "Login successful!");
        sessionStorage.setItem("alertMessage", `Welcome back to Kalkulukova, ${userData.nameGiven}!`);

        window.location.href = "home.html";
    } catch (error) {
        console.error("Error during Login with Google:", error.message);
        alert("Login with Google failed!", error.message);
    }
});
