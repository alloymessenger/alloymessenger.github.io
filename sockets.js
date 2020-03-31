// Setting up sockets with socket.io

sockets = function() {
    let socket;
    let clientScript = document.createElement("script");
    clientScript.src = `${serverURL}/socket.io/socket.io.js`;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(clientScript);

    function init(queryParams, callback) {
        try {
            socket = io.connect(serverURL, {secure: true, query: queryParams});
            socket.on('error', function (err) {
                if (err == "Invalid session token") {
                    console.log("Invalid session token. Updating...")
                    updateToken(callback)
                }
                else {
                    console.log("Socket error: ", err);
                }
            })
            socket.on('connect', () => {
                callback();
            })
        }
        catch (err) {
            if (err.name == "ReferenceError") {
                console.log("Couldn't connect to server.");
                setTimeout(() => {
                    head.removeChild(clientScript);
                    var newScript = document.createElement('script');
                    newScript.src = `${serverURL}/socket.io/socket.io.js`;
                    head.appendChild(newScript);
                    clientScript = newScript;
                    init(queryParams, callback)
                }, 3000);
            }
        }
    }

    function updateToken(callback) {
        let req = new XMLHttpRequest()
        let updateURL = `${serverURL}/api/updatetoken/`;
        let params = {
            'updateToken': getUpdateToken(),
            'googleID': googleID
        }
        req.open("POST", updateURL, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                let sessionToken = JSON.parse(req.responseText).session_token;
                console.log(sessionToken)
                setSessionToken(sessionToken)
                init(`googleID=${googleID}&sessionToken=${sessionToken}`, callback);
            }
            else if (req.status == 400) {
                console.log("Invalid update token. Redirecting to sign in page.");
                window.location = "/login.html"
            }
        }
        req.send(JSON.stringify(params))
    }

    function registerMessageHandler() {
        socket.on('message', (data) => {
            addMessages(data);
            scrollToBottom();
        });
    }
    function unregisterMessageHandler() {
        socket.off('message');
    }
    function registerAssignmentHandler() {
        socket.on('new_room', (data) => {
            addAssignmentToSidebar(data);
        })
    }
    function unregisterAssignmentHandler() {
        socket.off('new_room');
    }
    function joinCourse(courseID, name, callback) {
        socket.emit('join_course', {courseID, name}, callback);
        registerAssignmentHandler();
    }
    function leaveCourse(courseID, name, callback) {
        socket.emit('leave_course', {courseID, name}, callback);
        unregisterAssignmentHandler();
    }
    function joinAssignment(roomID, courseID, name, callback) {
        window.roomID = roomID;
        window.courseID = courseID;
        socket.emit('join_room', {roomID, courseID, name}, callback)
        registerMessageHandler();
    }
    function leaveAssignment(roomID, courseID, name, callback) {
        socket.emit('leave_room', {roomID, courseID, name}, callback)
        unregisterMessageHandler();
    }
    function messageCourse(roomID, courseID, name, photoLink, time, message, callback) {
        socket.emit('message', {roomID, courseID, name, photoLink, time, message}, callback)
    }
    function addAssignment(courseID, roomName, callback) {
        socket.emit('new_room', {courseID, roomName}, callback)
    }
    function getUserInfo(callback) {
        socket.emit('get_user_info', callback)
    }
    function addUserToCourse(courseID, callback) {
        socket.emit('add_user_to_course', {courseID}, callback)
    }
    function removeUserFromCourse(courseID, callback) {
        socket.emit('remove_user_from_course', {courseID}, callback)
    }

    return {
        init: init,
        joinCourse: joinCourse,
        leaveCourse: leaveCourse,
        joinAssignment: joinAssignment,
        leaveAssignment: leaveAssignment,
        messageCourse: messageCourse,
        addAssignment: addAssignment,
        getUserInfo: getUserInfo,
        addUserToCourse: addUserToCourse,
        removeUserFromCourse: removeUserFromCourse
    }
}();
