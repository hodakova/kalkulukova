import { database } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { alertPopup, alertFromSessionStoragePopup } from './alert_popup.js';
import { logout } from './logout.js';

const userUID = sessionStorage.getItem("kalkulukovaUID");
if (userUID) {
    const userRef = ref(database, `users/${userUID}`);
    get(userRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();

            const profilePictureUrl = userData.profilePicture;
            const joinedDateIso = userData.createdAt;
            const name = userData.nameGiven + " " + userData.nameFamily;
            const username = userData.username;
            const email = userData.email;

            const profilePictureElement = document.getElementById("profilePicture");
            if(profilePictureUrl) {
                profilePictureElement.classList.remove('default');
                profilePictureElement.src = profilePictureUrl;
            }
            document.addEventListener("error", function(event) {
                let target = event.target;
                if (target.tagName === "IMG" && target.id === "profilePicture") {
                    target.onerror = null;
                    target.classList.add("default");
                    target.src = "../assets/profile.png";
                }
            }, true);

            const joinedDate = new Date(joinedDateIso);
            const formattedDate = joinedDate.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            document.getElementById('joined-date').innerHTML += `${formattedDate}`;
        
            document.getElementById('name').textContent = name;
            document.getElementById('username').textContent = "@" + username;
            document.getElementById('email').textContent = email;

            alertFromSessionStoragePopup();

            function showLogoutPopup() {
                document.getElementById('logoutPopup').style.display = 'flex';
            }
            function closeLogoutPopup() {
                document.getElementById('logoutPopup').style.display = 'none';
            }
            
            document.getElementById('showLogoutPopup').addEventListener('click', showLogoutPopup);
            document.getElementById('logoutPopupCancelButton').addEventListener('click', closeLogoutPopup);
            document.getElementById('logoutPopupOKButton').addEventListener('click', () => {
                logout(`See you, ${userData.nameGiven}!`);
            });
        } else {
            alertPopup("Error!", "No user data found.");
            document.getElementById("alertPopupOKButton").innerHTML = "Logout";
            document.getElementById("alertPopupOKButton").addEventListener('click', () => {  
                document.getElementById("alertPopupOKButton").innerHTML = "Okay";
                logout("Please try relogin.");
            });
        }
    })
    .catch((error) => {
        console.error("Error fetching user data.", error.message);
        alertPopup("Error fetching user data.", error.message);
        document.getElementById("alertPopupOKButton").innerHTML = "Logout";
        document.getElementById("alertPopupOKButton").addEventListener('click', () => {
            document.getElementById("alertPopupOKButton").innerHTML = "Okay";
            logout("Please try relogin.");
        });
    });
}
else {
    alertPopup("Can't load page!", "You must log in to access this page.");
    document.getElementById('alertPopupOKButton').addEventListener('click', () => {
        window.location.href = "home.html";
    });
}
