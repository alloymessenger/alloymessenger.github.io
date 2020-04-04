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
    function registerRoomHandler() {
        socket.on('new_room', (data) => {
            addRoomToSidebar(data);
        })
    }
    function unregisterRoomHandler() {
        socket.off('new_room');
    }
    function joinChannel(channelID, name, callback) {
        if (displayedChannel) {
            sockets.leaveChannel(displayedChannel.channel_id, name, () => {
                console.log(`Successfully left previous channel.`);
                socket.emit('join_channel', {channelID, name}, callback);
                registerRoomHandler();
            });
        }
        else {
            socket.emit('join_channel', {channelID, name}, callback);
            registerRoomHandler();
        }
    }
    function leaveChannel(channelID, name, callback) {
        socket.emit('leave_channel', {channelID, name}, callback);
        unregisterRoomHandler();
    }
    function joinRoom(roomID, channelID, name, callback) {
        window.roomID = roomID;
        window.channelID = channelID;
        socket.emit('join_room', {roomID, channelID, name}, callback)
        registerMessageHandler();
    }
    function leaveRoom(roomID, channelID, name, callback) {
        socket.emit('leave_room', {roomID, channelID, name}, callback)
        unregisterMessageHandler();
    }
    function messageChannel(roomID, channelID, name, photoLink, time, message, callback) {
        socket.emit('message', {roomID, channelID, name, photoLink, time, message}, callback)
    }
    function addRoom(channelID, roomName, callback) {
        socket.emit('new_room', {channelID, roomName}, callback)
    }
    function addTopic(topicName, callback) {
        socket.emit('new_topic', {topicName}, callback);
    }
    function getUserInfo(callback) {
        socket.emit('get_user_info', callback)
    }
    function addUserToChannel(channelID, callback) {
        socket.emit('add_user_to_channel', {channelID}, callback)
    }
    function removeUserFromChannel(channelID, callback) {
        socket.emit('remove_user_from_channel', {channelID}, callback)
    }

    return {
        init: init,
        joinChannel: joinChannel,
        leaveChannel: leaveChannel,
        joinRoom: joinRoom,
        leaveRoom: leaveRoom,
        messageChannel: messageChannel,
        addRoom: addRoom,
        addTopic: addTopic,
        getUserInfo: getUserInfo,
        addUserToChannel: addUserToChannel,
        removeUserFromChannel: removeUserFromChannel
    }
}();
