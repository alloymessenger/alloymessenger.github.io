requests = function () {
    function getCourses(callback) {
        let req = new XMLHttpRequest();
        let classesURL = `${serverURL}/api/courses/`;
        req.open("GET", classesURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                courses = JSON.parse(req.responseText);
                callback(courses);
            }
        }
        req.send();
    }
    
    function getCourseInfo(courseID, callback) {
        let req = new XMLHttpRequest();
        let courseURL = `${serverURL}/api/course/${courseID}/`;
        req.open("GET", courseURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                let course = JSON.parse(req.responseText);
                callback(course);
            }
        }
        req.send();
    }
    
    function getRoomsInCourse(courseID, callback) {
        let req = new XMLHttpRequest();
        let roomsURL = `${serverURL}/api/course/${courseID}/rooms/`;
        req.open("GET", roomsURL, true);
        req.onreadystatechange = (e) => {
            if (req.readyState == 4 && req.status == 200) {
                var rooms = JSON.parse(req.responseText);
                callback(rooms);
            }
        }
        req.send();
    }
    
    function getMessagesInRoom(courseID, roomID, callback) {
        let req = new XMLHttpRequest();
        let messagesURL = `${serverURL}/api/course/${courseID}/room/${roomID}/`;
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
        getCourseInfo: getCourseInfo,
        getRoomsInCourse: getRoomsInCourse,
        getMessagesInRoom: getMessagesInRoom
    }
}()

