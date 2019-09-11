function deleteCookies() {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        eraseCookie(cookies[i].split("=")[0]);
    }
}

function eraseCookie(name) {   
    document.cookie = `${name}=; Max-Age=-99999999;`;  
}

function setTokenCookie(token, name) {
    let duration = 365; // Duration in days
    let expiration = (new Date((new Date()).getTime() + duration * 86400000)).toUTCString();; 
    document.cookie = `${name}=${token}; expires=${expiration}; path=/`;
}

function getTokenCookie(name) {
    var nameEQ = name + "=";
    var cookieSegments = document.cookie.split(';');
    for (let i = 0; i < cookieSegments.length; i++) {
        let curr = cookieSegments[i];
        if (curr.includes(name)) {
            return curr.split("=")[1];
        }
    }
    return null;
}

function setSessionToken(token) {
    setTokenCookie(token, "session-token");
}

function setUpdateToken(token) {
    setTokenCookie(token, "update-token");
}

function getSessionToken() {
    return getTokenCookie("session-token");
}

function getUpdateToken() {
    return getTokenCookie("update-token");
}
