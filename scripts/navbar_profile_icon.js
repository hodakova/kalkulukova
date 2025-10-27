import { database } from './firebase.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const userUID = sessionStorage.getItem("kalkulukovaUID");
if (userUID) {

    document.getElementById('navbarLogin').style.display = 'none';
    // document.getElementById('navbarRanking').style.display = 'block';
    // document.getElementById('navbarProgress').style.display = 'block';
    document.getElementById('navbarProfile').style.display = 'block';

    const userRef = ref(database, `users/${userUID}`);
    get(userRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();

            const profilePictureUrl = userData.profilePicture;
            const profileIconElement = document.getElementById("profileIcon");
            
            if(profilePictureUrl) {
                profileIconElement.classList.remove('default');
                profileIconElement.src = profilePictureUrl;
            }

            document.addEventListener("error", function(event) {
                let target = event.target;
                if (target.tagName === "IMG" && target.id === "profileIcon") {
                    target.onerror = null;
                    target.classList.add("default");

                    function checkImage(path, callback) {
                        const img = new Image();
                        img.onload = () => callback(true);
                        img.onerror = () => callback(false);
                        img.src = path;
                    };
                    
                    const altPicture = "../assets/profile.png";
                    checkImage(altPicture, function(exist) {
                        if(exist) target.src = altPicture;
                        else target.src = "../" + altPicture;
                    });
                }
            }, true);

            if(profilePictureUrl) {
                profileIconElement.classList.remove('default');
                profileIconElement.src = profilePictureUrl;
            }
        } else {
            console.log("No user data found!");
        }
    })
    .catch((error) => {
        console.error("Error fetching user data:", error);
    });
}
