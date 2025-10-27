import { auth, database } from './firebase.js';
import { ref, get, update, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { alertPopup } from './alert_popup.js';

const userUID = sessionStorage.getItem("kalkulukovaUID");
if (userUID) {
    const userRef = ref(database, `users/${userUID}`);
    get(userRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();

            const profilePictureUrl = userData.profilePicture;
            const joinedDateIso = userData.createdAt;
            const nameGiven = userData.nameGiven;
            const nameFamily = userData.nameFamily;
            const username = userData.username;
            const email = userData.email;

            const profilePictureElement = document.getElementById("profilePicture");
            const profilePictureURLElement = document.getElementById('profile-picture-url');

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
            
            document.getElementById('profile-picture-url').value = profilePictureUrl;
            document.getElementById('joined-date').innerHTML += `${formattedDate}`;
            document.getElementById('joined-date-responsive').innerHTML = formattedDate;
            document.getElementById('given-name').value = nameGiven;
            document.getElementById('family-name').value = nameFamily;
            document.getElementById('username').value = username;
            document.getElementById('email').innerHTML = email;

            profilePictureURLElement.addEventListener("input", () => {
                const url = profilePictureURLElement.value;
                if (profilePictureElement) {
                    profilePictureElement.src = url;
                    profilePictureElement.classList.remove('default');
                }
                else {
                    profilePictureElement.classList.add('default');
                }
            });

            document.getElementById("profile-edit-form").addEventListener("submit", async (e) => {
                e.preventDefault();

                const updatePPURL = document.getElementById('profile-picture-url').value;
                const updateNameGiven = document.getElementById('given-name').value;
                const updateNameFamily = document.getElementById('family-name').value;
                const updateUsername = document.getElementById('username').value;

                try {
                    const usernameRef = query(ref(database, "users"), orderByChild("username"), equalTo(updateUsername));
                    const snapshot = await get(usernameRef);
            
                    if (snapshot.exists() && !Object.keys(snapshot.val()).includes(userUID)) {
                        alertPopup("Username is already taken!", "Please choose another one!");
                        return;
                    }
            
                    await update(ref(database, `users/${userUID}`), {
                        profilePicture: updatePPURL,
                        nameGiven: updateNameGiven,
                        nameFamily: updateNameFamily,
                        username: updateUsername,
                    });
            
                    console.log("Profile updated successfully!");
                    sessionStorage.setItem("alertTitle", "Account profile updated successfully!");

                    window.location.href = "account.html";
                } catch (error) {
                    console.error("Error updating profile:", error.message);
                    alertPopup("Error updating profile!", error.message);
                }
            });

            if(!sessionStorage.getItem('loginWithGoogle')) {
                document.getElementById('reset-password').style.display = 'block';
                document.getElementById('reset-password').addEventListener('click', () => {
                    sendPasswordResetEmail(auth, email)
                    .then(() => {
                        console.log(`Password reset email has been sent to ${email}.`);
                        sessionStorage.setItem("alertTitle", `Password reset email has been sent to ${email}.`);
                        sessionStorage.setItem("alertMessage", "Please check your inbox.");

                        window.location.href = "account.html";
                    })
                    .catch((error) => {
                        console.error("Failed to send password reset email:", error.message);
                        alertPopup("Failed to send password reset email!", error.message);
                    });
                });
            }
        } else {
            console.log("No user data found!");
            alertPopup("Error!", "No user data found!")
        }
    })
    .catch((error) => {
        console.error("Error fetching user data:", error);
        alertPopup("Error fetching user data!", error.message);
    });
}
else {
    alertPopup("Can't load page!", "You must log in to access this page.");
    document.getElementById('alertPopupOKButton').addEventListener('click', () => {
        window.location.href = "home.html";
    });
}
