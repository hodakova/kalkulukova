import { database } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { alertPopup, alertFromSessionStoragePopup } from './alert_popup.js';

const userUID = sessionStorage.getItem("kalkulukovaUID");
if (userUID) {
    const userRef = ref(database, `users/${userUID}`);
    get(userRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const name = userData.nameGiven;
            
            document.getElementById("homeDescription").innerHTML = `Welcome to Kalkulukova, ${name}; Your fun learning platform for calculus concepts!`;
            // document.getElementById('homeExploreLogin').style.display = 'flex';

            alertFromSessionStoragePopup();
        } else {
            console.log("No user data found!");
            alertPopup("Error!", "No user data found.");
            document.getElementById("alertPopupOKButton").innerHTML = "Logout";
            document.getElementById("alertPopupOKButton").addEventListener('click', () => {
                document.getElementById("alertPopupOKButton").innerHTML = "Okay";
                logout("Please try relogin.");
            });
        }
    })
    .catch((error) => {
        console.error("Error fetching user data:", error);
        alertPopup("Error fetching user data!", error.message);
        document.getElementById("alertPopupOKButton").innerHTML = "Logout";
        document.getElementById("alertPopupOKButton").addEventListener('click', () => {
            document.getElementById("alertPopupOKButton").innerHTML = "Okay";
            logout("Please try relogin.");
        });
    });
}
