import { database } from './firebase.js';
import { ref, push, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { alertPopup } from "./alert_popup.js";

export async function updateUserActivity(category, type, data) {
    const userUID = sessionStorage.getItem("kalkulukovaUID");
    if(userUID) {
        try {
            if(!["quizzes", "topics", "calculators"].includes(category)) throw new Error("Invalid category");

            const activityRef = ref(database, `users/${userUID}/activities/${category}/${type}`);
            const newActivityRef = push(activityRef);
            await update(newActivityRef, data);
        }
        catch(error) {
            console.error("Error updating activity:", error);
            alertPopup("Error updating activity:", error.message);
        }
    }
}
