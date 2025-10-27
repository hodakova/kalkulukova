export function logout(alertMessage) {
    sessionStorage.clear();
    sessionStorage.setItem("alertTitle", "You have been logged out.");
    sessionStorage.setItem("alertMessage", alertMessage);
    window.location.href = "../index.html";
}
