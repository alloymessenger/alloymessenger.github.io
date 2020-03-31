function clearElements(ele) {
    while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
    }
}

function scrollToBottom() {
    var messages = document.getElementById("message-holder");
    messages.scrollTop = messages.scrollHeight;
}

function addMessages(data) {
    let messageHolder = document.getElementById("message-holder");
    
    function addMessage(message_data) {
        let row = document.createElement("div");
        row.className = "message-row";
        let newMessage = document.createElement("div");
        let index = displayedMessages.length;
        displayedMessages.push(message_data);
        if (googleID == message_data.googleID) {
            newMessage.className = 'special-speech-bubble';
            if (message_data.name != googleName) {
                newMessage.classList.add("incognito");
            }
        }
        else {
            newMessage.className = 'speech-bubble';
            let profilePhoto = document.createElement("img");
            profilePhoto.src = message_data.photo_link;
            profilePhoto.title = message_data.name;
            profilePhoto.className = "profile-photo";
            row.appendChild(profilePhoto);
        }
        if (index > 0 && displayedMessages[index - 1].googleID == message_data.googleID 
            && displayedMessages[index - 1].name == message_data.name) {
            let previousMessageRow = messageHolder.lastElementChild;
            previousMessageRow.lastElementChild.classList.add("top");
            newMessage.classList.add("bottom");
            if (googleID != message_data.googleID) {
                if (previousMessageRow.childElementCount == 2) {
                    previousMessageRow.removeChild(previousMessageRow.firstElementChild);
                }
            }
        }
        newMessage.innerHTML = message_data.message;
        row.appendChild(newMessage);
        messageHolder.appendChild(row);
    }

    if (Array.isArray(data)) {
        data.forEach(addMessage);
    } else {
        addMessage(data);
    }
}

function clearMessages() {
    displayedMessages = []
    let messageHolder = document.getElementById("message-holder");
    clearElements(messageHolder);
}

function loadRecentCourses() {
    sockets.getUserInfo((user) => {
        getRecentCourses(user);
    })
}

function getColor(num) {
    if (num == 0) return "gray";
    switch (num % 3) {
        case 0:
            return "pink";
        case 1:
            return "blue";
        case 2:
            return "orange";
    }
}

function getRecentCourses(user) {
    var courses = user.courses;
    var sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
    clearElements(sidebarExtension);
    courses.forEach((course) => {
        var color = getColor(course.num_rooms);
        let courseButton = document.createElement("button");
        courseButton.classList.add(color);
        let dot = document.createElement("span");
        dot.className = "dot";
        dot.addEventListener("click", () => {
            removeCourse(course, () => {});
        });
        let courseButtonHTML = `<div class="selected-container"><div class="center-container-left"></div>
                                <div class="center-container-right">
                                    <span class="top">${course.subject} ${course.number}</span>
                                    <span class="middle">${course.name}</span>
                                    <span class="bottom">${course.num_rooms} Room${course.num_rooms == 1 ? "" : "s"}</span>
                                </div></div>`
        courseButton.type = "button";
        courseButton.dataset.id = course.course_id;
        courseButton.innerHTML = courseButtonHTML;
        courseButton.firstElementChild.firstElementChild.appendChild(dot);
        courseButton.addEventListener("click", () => {
            if (displayedCourse) {
                sockets.leaveCourse(displayedCourse.course_id, name, () => {
                    console.log(`Successfully left previous course.`);
                });
            }
            displayedCourse = course;
            sockets.joinCourse(course.course_id, name, () => {
                console.log("Successfully joined course.");
            })
            Array.from(courseButton.parentElement.children).forEach((child) => {
                child.classList.remove("selected");
            })
            courseButton.classList.add("selected")
            loadCourseRooms(course.course_id)
        });
        sidebarExtension.appendChild(courseButton);
    });
    var addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "special";
    var innerText = document.createElement("span");
    innerText.innerHTML = "Add a class...";
    addButton.appendChild(innerText);
    addButton.addEventListener("click", () => {
        displayModal("class");
    });
    sidebarExtension.appendChild(addButton);
}

function loadCourseRooms(courseID) {
    requests.getRoomsInCourse(courseID, (rooms) => {
        var sidebarExtension2 = document.getElementsByClassName("sidebar-extension second")[0];
        clearElements(sidebarExtension2);
        rooms.forEach((room) => {
            var roomButton = document.createElement("button");
            roomButton.type = "button";
            roomButton.addEventListener("click", () => {
                setChatName(`${displayedCourse.subject} ${displayedCourse.number}`, displayedCourse.name, room.name);
                openMessages(room.course_id, room.room_id);
                document.getElementById("courses-button").className = "selected";
                document.getElementById("browse-button").classList.remove("selected");
                displayMessaging();
            });
            var innerText = document.createElement("div");
            innerText.innerHTML = `<span class="top">${room.name}</span>
                                    <span class="bottom">${room.last_message == null ? "Send a message..." : `${getFirstName(room.last_message_name)}: ${room.last_message}`}</span>`;
            roomButton.appendChild(innerText);
            sidebarExtension2.appendChild(roomButton);
        });
        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "special";
        var innerText = document.createElement("span");
        innerText.innerHTML = "Add a room...";
        addButton.appendChild(innerText);
        addButton.addEventListener("click", () => {
            displayModal("room");
        });
        sidebarExtension2.appendChild(addButton);
    })
    openCourseRoomsSidebar();
}

function loadRecentRooms() {
    sockets.getUserInfo((user) => {
        getRecentRooms(user)
    })
}

function getRecentRooms(user) {
    var rooms = user.rooms;
    var sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
    clearElements(sidebarExtension);
    rooms.forEach((room) => {
        var roomButton = document.createElement("button");
        roomButton.type = "button";
        roomButton.addEventListener("click", () => {
            requests.getCourseInfo(room.course_id, (course) => {
                setChatName(`${course.subject} ${course.number}`, course.name, room.name);
                openMessages(room.course_id, room.room_id);
                document.getElementById("groups-button").className = "selected";
                document.getElementById("browse-button").classList.remove("selected");
                displayMessaging();
            })
        });
        var innerText = document.createElement("div");
        innerText.innerHTML = `<span class="top">${room.name}</span>
        <span class="bottom">${room.last_message == null ? "Send a message..." : `${getFirstName(room.last_message_name)}: ${room.last_message}`}</span>`;
        roomButton.appendChild(innerText);
        sidebarExtension.appendChild(roomButton);
    });
}

function openMessages(courseID, roomID) {
    if (inRoom) {
        sockets.leaveRoom(window.roomID, window.courseID, name, () => {
                inRoom = false;
                console.log("Left room successfully.")
                sockets.joinRoom(roomID, courseID, name, () => {
                    window.roomID = roomID;
                    window.courseID = courseID;
                    inRoom = true;
                    console.log("Joined room successfully.")
                });
        });
    }
    else {
        sockets.joinRoom(roomID, courseID, name, () => {
            inRoom = true;
            console.log("Joined room successfully.")
        })
    }
    requests.getMessagesInRoom(courseID, roomID, (messages) => {
        clearMessages();
        addMessages(messages);
    });
}

function closeMessages() {
    if (inRoom) {
        sockets.leaveRoom(roomID, courseID, name, () => {
            inRoom = false;
            console.log("Left room successfully.")
        })
    }
    if (displayedCourse) {
        sockets.leaveCourse(displayedCourse.course_id, name, () => {
            displayedCourse = null;
            console.log("Left course successfully.")
        })
    }
    return null;
}

function sendMessage() {
    var messageField = document.getElementById("message-field").firstElementChild;
    var message = messageField.value;
    var time = new Date().toISOString().slice(0, 19)
    if (messageField.value != '') {
        messageField.value = '';
        sockets.messageCourse(roomID, courseID, name, photoLink, time, message, (success) => 
            {
                if (success) {
                    console.log("Message sent successfully.");
                }
                else {
                    console.log("Message failed to send.");
                }
            });
    }
    return false;
}

function openCoursesSidebar() {
    loadRecentCourses();
    document.getElementsByClassName("sidebar-extension")[0].className = "sidebar-extension";
    document.getElementsByClassName("sidebar-extension second")[0].className = "sidebar-extension second collapsed";
    document.getElementById("main").className = "one-sidebar";
}

function openCourseRoomsSidebar() {
    document.getElementsByClassName("sidebar-extension")[0].className = "sidebar-extension";
    document.getElementsByClassName("sidebar-extension second")[0].className = "sidebar-extension second compact"
    document.getElementById("main").className = "two-sidebars";
}

function openRoomsSidebar() {
    loadRecentRooms();
    document.getElementsByClassName("sidebar-extension")[0].className = "sidebar-extension compact";
    document.getElementsByClassName("sidebar-extension second")[0].className = "sidebar-extension second collapsed"
    document.getElementsByClassName("sidebar-extension second")[0].querySelectorAll("button").forEach(
        (child) => {
            child.style.opacity = "1";
            child.style.transitionDelay = "0.2s";
        }
    )
    document.getElementById("main").className = "one-sidebar";
}

function toggleIncognito(button) {
    if (button.className == "active") {
        button.classList.remove("active");
        name = googleName;
        photoLink = googlePhoto;
    }
    else {
        button.classList.add("active");
        name = "anonymous";
        photoLink = "/icons/incognito-profile-photo.png";
    }
}

function displayModal(styleName) {
    document.getElementById("modal-field").value = "";
    if (styleName == "class") {
        fetchCourses();
        document.getElementById("modal-title").innerHTML = "Search for a class:"
        document.getElementById("search-results").style.display = "block";
        document.getElementById("confirm-modal").className = "search"
    }
    else if (styleName == "room") {
        document.getElementById("modal-title").innerHTML = "Enter room name:"
        document.getElementById("search-results").style.display = "none";
        document.getElementById("confirm-modal").className = "submit"
    }
    document.getElementById("modal").style.display = "block";
}

function hideModal() {
    document.getElementById("modal").style.display = "none";
}

function fetchCourses() {
    if (courses.length == 0) {
        requests.getCourses((courses) => {
            addModalCourseRows(courses);
            addBrowseCourseRows(courses);
        })
    }
}

function submitModal() {
    if (document.getElementById("confirm-modal").className == "submit") {
        sockets.addRoom(displayedCourse.course_id, document.getElementById("modal-field").value.trim(), (result) => {
            hideModal();
        });
    }
}

function addRoomToSidebar(data) {
    var firstSidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
    Array.from(firstSidebarExtension.children).forEach((child) => {
        if (child.classList.contains("selected")) {
            let roomCount = child.firstElementChild.lastElementChild.lastElementChild.innerHTML;
            let numRooms = parseInt(roomCount.substring(0, roomCount.indexOf(" "))) + 1;
            let newColor = getColor(numRooms);
            child.className = `${newColor} selected`
            child.firstElementChild.lastElementChild.lastElementChild.innerHTML = `${numRooms} Room${numRooms == 1 ? "" : "s"}`;
        }
    });

    var secondSidebarExtension = document.getElementsByClassName("sidebar-extension second")[0];
    var roomButton = document.createElement("button");
    roomButton.type = "button";
    var innerText = document.createElement("div");
        innerText.innerHTML = `<span class="top">${data.roomName}</span>
                                <span class="bottom">Send a message...</span>`;
    roomButton.appendChild(innerText);
    roomButton.addEventListener("click", () => {
        setChatName(`${displayedCourse.subject} ${displayedCourse.number}`, displayedCourse.name, data.roomName);
        openMessages(displayedCourse.course_id, data.roomID);
        document.getElementById("courses-button").className = "selected";
        document.getElementById("browse-button").classList.remove("selected");
        displayMessaging();
    });
    secondSidebarExtension.insertBefore(roomButton, secondSidebarExtension.firstElementChild)
}

function addModalCourseRows(courses) {
    window.courses = courses
    var tableRows = document.getElementById("search-results");
    courses.forEach((course) => {
        let row = document.createElement("div");
        row.className = "modal-row";
        let courseID = course.course_id;
        let courseName = `${course.subject} ${course.number}`;
        row.innerHTML = `<div class="search-result" id=${courseID}><div class="center">${courseName}</div></div>`;
        row.firstElementChild.addEventListener("click", () => {
            addCourse(course, hideModal);
        });
        tableRows.appendChild(row);
    });
}

function filter() {
    var input = document.getElementById("modal-field").value;
    var filter = input.toUpperCase();
    var rows = document.getElementsByClassName("modal-row");
    for (i = 0; i < rows.length; i++) {
        var currRowText = rows[i].firstElementChild.firstElementChild.innerHTML.toUpperCase();
        if (currRowText.indexOf(filter) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function getFirstName(fullName) {
    return fullName.split(" ")[0];
}

function addCourse(course, callback) {
    sockets.addUserToCourse(course.course_id, (result) => {
        if (result.success) {
            callback();
            console.log("Class successfully added.")
            var sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
            let courseButton = document.createElement("button");
            var color = getColor(course.num_rooms);
            courseButton.classList.add(color);
            let dot = document.createElement("span");
            dot.className = "dot";
            dot.addEventListener("click", () => {
                removeCourse(course, () => {});
            });
            let courseButtonHTML = `<div class="selected-container"><div class="center-container-left"></div>
                                    <div class="center-container-right">
                                        <span class="top">${course.subject} ${course.number}</span>
                                        <span class="middle">${course.name}</span>
                                        <span class="bottom">${course.num_rooms} Rooms</span>
                                    </div></div>`
            courseButton.type = "button";
            courseButton.dataset.id = course.course_id;
            courseButton.innerHTML = courseButtonHTML;
            courseButton.firstElementChild.firstElementChild.appendChild(dot);
            courseButton.addEventListener("click", () => {
                if (displayedCourse) {
                    sockets.leaveCourse(displayedCourse.course_id, name, () => {
                        console.log(`Successfully left previous course.`);
                    });
                }
                displayedCourse = course;
                sockets.joinCourse(course.course_id, name, () => {
                    console.log("Successfully joined course.");
                })
                Array.from(courseButton.parentElement.children).forEach((child) => {
                    child.classList.remove("selected");
                })
                courseButton.classList.add("selected");
                loadCourseRooms(course.course_id)
            });
            sidebarExtension.insertBefore(courseButton, sidebarExtension.firstElementChild)
        }
        else {
            console.log(result.error);
        }
    });
}

function removeCourse(course, callback) {
    sockets.removeUserFromCourse(course.course_id, (result) => {
        if (result.success) {
            callback();
            console.log("Class successfully removed.")
            let sidebarExtension = document.getElementsByClassName("sidebar-extension")[0];
            sidebarExtension.removeChild(sidebarExtension.querySelectorAll(`[data-id='${course.course_id}']`)[0]);
        }
        else {
            console.log(result.error);
        }
    })
}

function setChatName(courseNumber, courseName, roomName) {
    document.getElementById("class-name").innerHTML = `<b>${courseNumber}</b>: ${courseName}`;
    document.getElementById("group-name").innerHTML = roomName;
}

function displayBrowse() {
    document.getElementById("messaging").classList.add("hidden");
    document.getElementById("browse").classList.remove("hidden");
    fetchCourses();
}

function displayMessaging() {
    document.getElementById("messaging").classList.remove("hidden");
    document.getElementById("browse").classList.add("hidden");
    fetchCourses();
}

function addBrowseCourseRows(classes) {
    var tableRows = document.getElementById("table-rows");
    sockets.getUserInfo((user) => {
        let selectedCourses = user.courses;
        classes.forEach((course) => {
            let div = document.createElement("div");
            let button = document.createElement("button");
            if (selectedCourses.some(e => e.course_id === course.course_id)) {
                button.className = "select check";
            }
            else {
                button.className = "select add";
            }
            button.addEventListener("click", () => {
                browseButtonClick(button, course);
            })
            div.appendChild(button);
            let row = document.createElement("div");
            row.className = "browse-row";
            let tableRow = document.createElement("li");
            tableRow.className = "table-row";
            tableRow.id = course.course_id;
            tableRow.innerHTML = `<div class="col-1">${course.subject}</div>
                                    <div class="col-2">${course.number}</div>
                                    <div class="col-3">${course.name}</div>`;
            tableRow.appendChild(button);
            row.appendChild(tableRow);
            tableRows.appendChild(row);
        });
    })

    function browseButtonClick(button, course) {
        if (button.className == "select add") {
            addCourse(course, () => {
                button.className = "select check";
            });
        }
        else if (button.className == "select check") {
            removeCourse(course, () => {
                button.className = "select add";
            });
        }
    }
}

function filterBrowse() {
    var input = document.getElementById("search").value;
    var filter = input.toUpperCase();
    var rows = document.getElementsByClassName("browse-row");
    for (i = 0; i < rows.length; i++) {
        var currRow = rows[i].getElementsByClassName("table-row")[0];
        var subject = currRow.getElementsByClassName("col-1")[0].textContent.toUpperCase();
        var number = currRow.getElementsByClassName("col-2")[0].textContent;
        var name = currRow.getElementsByClassName("col-3")[0].textContent.toUpperCase();
        var shortTitle = subject + " " + number;
        var longTitle = subject + " " + number + " - " + name;

        if (shortTitle.indexOf(filter) > -1 || longTitle.indexOf(filter) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}