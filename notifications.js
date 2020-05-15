Notification.requestPermission();
let hasRequested = false;

function notifyMessage(message) {
    if ("Notification" in window) {
        if (Notification.persmission === "granted") {
            showMessageNotification(message);
        }
        else if (!hasRequested) {
            Notification.requestPermission((permission) => {
                if (permission === "granted") {
                    showMessageNotification(message);
                }
            })
        }
    }
}

function showMessageNotification(message) {
    new Notification()
}