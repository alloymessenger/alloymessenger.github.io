requests = function () {
    function getCourses(callback) {
        let req = new XMLHttpRequest();
        let coursesURL = `${serverURL}/api/courses/`;
        req.open("GET", coursesURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                courses = JSON.parse(req.responseText);
                callback(courses);
            }
        }
        req.send();
    }

    function getFilteredCourses(query, callback) {
        let req = new XMLHttpRequest();
        let filteredCoursesURL = `${serverURL}/api/courses/filtered/${query}/`;
        req.open("GET", filteredCoursesURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                courses = JSON.parse(req.responseText);
                callback(courses);
            }
        }
        req.send();
    }

    function getFilteredTopics(query, callback) {
        let req = new XMLHttpRequest();
        let filteredTopicsURL = `${serverURL}/api/topics/filtered/${query}/`;
        req.open("GET", filteredTopicsURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                topics = JSON.parse(req.responseText);
                callback(topics);
            }
        }
        req.send();
    }

    function getTopics(callback) {
        let req = new XMLHttpRequest();
        let topicsURL = `${serverURL}/api/topics/`;
        req.open("GET", topicsURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                topics = JSON.parse(req.responseText);
                callback(topics);
            }
        }
        req.send();
    }
    
    function getChannelInfo(channelID, callback) {
        let req = new XMLHttpRequest();
        let channelURL = `${serverURL}/api/channel/${channelID}/`;
        req.open("GET", channelURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                let channel = JSON.parse(req.responseText);
                callback(channel);
            }
        }
        req.send();
    }
    
    function getMessagesInRoom(channelID, roomID, callback) {
        let req = new XMLHttpRequest();
        let messagesURL = `${serverURL}/api/channel/${channelID}/room/${roomID}/`;
        req.open("GET", messagesURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                messages = JSON.parse(req.responseText);
                callback(messages);
            }
        }
        req.send();
    }

    return {
        getCourses: getCourses,
        getFilteredCourses: getFilteredCourses,
        getTopics: getTopics,
        getFilteredTopics: getFilteredTopics,
        getChannelInfo: getChannelInfo,
        getMessagesInRoom: getMessagesInRoom
    }
}()

