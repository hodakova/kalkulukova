export function alertPopup(alertTitle, alertMessage) {
    if (alertTitle) {
        document.getElementById("alertPopup").style.display = "flex";
        document.getElementById("alertTitle").innerHTML = alertTitle;
        if(alertMessage) {
            document.getElementById("alertMessage").innerHTML = alertMessage;
        }
        else {
            document.getElementById("alertMessage").style.display = "none";
        }
        document.getElementById('alertPopupOKButton').addEventListener('click', () => {
            document.getElementById("alertPopup").style.display = "none";
            document.getElementById("alertTitle").innerHTML = "‍";
            if(alertMessage) {
                document.getElementById("alertMessage").innerHTML = "‍";
            }
            else {
                document.getElementById("alertMessage").style.display = "flex";
            }
            if(sessionStorage.getItem("alertTitle")) {
                sessionStorage.removeItem("alertTitle");
            }
            if(sessionStorage.getItem("alertMessage")) {
                sessionStorage.removeItem("alertMessage");
            }
        });
    }
}

export function alertFromSessionStoragePopup() {
    const alertTitle = sessionStorage.getItem("alertTitle");
    const alertMessage = sessionStorage.getItem("alertMessage");

    alertPopup(alertTitle, alertMessage);
}

alertFromSessionStoragePopup();
