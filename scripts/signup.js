import { auth, database } from './firebase.js'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, set, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { alertPopup } from './alert_popup.js';

async function isUsernameAvailable(username) {
    const usernameQuery = query(ref(database, "users"), orderByChild("username"), equalTo(username));
    const snapshot = await get(usernameQuery);
    return !snapshot.exists();
}

async function generateUniqueUsername(baseUsername) {
    let username = baseUsername;
    let count = 0;

    while (!(await isUsernameAvailable(username))) {
        count++;
        username = `${baseUsername}${count}`;
    }

    return username;
}

document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const nameGiven = document.getElementById("given-name").value;
    const nameFamily = document.getElementById("family-name").value;
    const profilePictureUrl = document.getElementById("profile-picture-url").value;

    if (password !== confirmPassword) {
        alertPopup("Passwords do not match!", "");
        return;
    }

    try {
        if (!(await isUsernameAvailable(username))) {
            alertPopup("Username is already taken.", "Please choose another one.");
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await set(ref(database, `users/${user.uid}`), {
            uid: user.uid,
            username: username,
            email: email,
            nameGiven: nameGiven,
            nameFamily: nameFamily,
            profilePicture: profilePictureUrl,
            createdAt: new Date().toISOString()
        });
        const fullName = nameFamily ? `${nameGiven} ${nameFamily}` : nameGiven;

        sessionStorage.clear();
        sessionStorage.setItem("kalkulukovaUID", user.uid);
        sessionStorage.setItem("alertTitle", "Account created successfully!")
        sessionStorage.setItem("alertMessage", `Welcome to Kalkulukova, ${fullName}!`);

        window.location.href = "home.html";
    } catch (error) {
        console.error(error);
        alertPopup("Signup failed!", error.message);
    }
});

document.getElementById("google-signup-button").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        const baseUsername = user.email.split("@")[0];
        let finalUsername = baseUsername;

        const nameParts = (user.displayName || "").trim().split(" ").filter(Boolean);
        const nameGiven = nameParts[0];
        const nameFamily = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        if (!snapshot.exists()) {
            finalUsername = await generateUniqueUsername(baseUsername);

            await set(userRef, {
                uid: user.uid,
                username: finalUsername,
                email: user.email,
                nameGiven: nameGiven,
                nameFamily: nameFamily,
                profilePicture: user.photoURL,
                createdAt: new Date().toISOString()
            });
        }
        const fullName = nameFamily ? `${nameGiven} ${nameFamily}` : nameGiven;

        sessionStorage.clear();
        sessionStorage.setItem("kalkulukovaUID", user.uid);
        sessionStorage.setItem("loginWithGoogle", "yes");
        sessionStorage.setItem("alertTitle", "Account created successfully!");
        sessionStorage.setItem("alertMessage", `Welcome to Kalkulukova, ${fullName}!`);

        window.location.href = "home.html";
    } catch (error) {
        console.error("Error during Signup with Google:", error);
        alertPopup("Signup with Google failed!", error.message);
    }
});
