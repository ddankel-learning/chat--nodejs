const socket = io();

// Elements

/************************************************************
 * DOM Elements
 */
const $messageForm = document.querySelector("#new-message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#share-location-btn");
const $messageContainer = document.querySelector("#message-container");
const $sidebarContainer = document.querySelector("#sidebar-container");

/************************************************************
 * Templates
 */
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

/************************************************************
 * Options
 */
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

/************************************************************
 * Helpers
 */

/**
 * Sort an array of User objects alphabetically by the username property (ascending)
 *
 * @param   {Array}  users   Array of User objects
 *
 * @return  {Array}          Sorted user objects
 */
const sortUserList = (users) => {
  return users.sort((a, b) => {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  });
};

/**
 * Auto-scroll the message container to accomodate new messages
 *
 * If the message container is currently scrolled to the top of the newest
 * message, scroll down to show the newest message.  Otherwise do nothing.
 */
const autoScroll = () => {
  const $newMessage = $messageContainer.lastElementChild;
  const newMessageHeight =
    parseInt($newMessage.offsetHeight) +
    parseInt(getComputedStyle($newMessage).marginTop) +
    parseInt(getComputedStyle($newMessage).marginBottom);
  const visibleHeight = $messageContainer.offsetHeight;
  const containerHeight = $messageContainer.scrollHeight;
  const scrollOffset = $messageContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageContainer.scrollTop = $messageContainer.scrollHeight;
  }
};

/************************************************************
 * Socket.io Event Handlers
 */

/**
 * Handle the new message event
 *
 * Render the message using the proper template and autoscroll if necessary.
 *
 * @example message:
 *  {
 *    username:  "Joe",
 *    message:   "Hello!",
 *    timestamp: 1635394442
 *  }
 */
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

/**
 * Handle a new `locationMessage` event
 *
 * Render the message using the proper template.
 *
 * @example message:
 *  {
 *    username:  "Joe",
 *    url:       "https://google.com/maps/?q=0,0",
 *    timestamp: 1635394442
 *  }
 */
socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

/**
 * Handle a new `roomData` event
 *
 * This event is emitted when a new user joins or leaves.  It updates the
 * sidebar with the room name and the new user list (sorted alphabetically)
 *
 * @example message:
 *  {
 *    room:  "general",
 *    users: [{
 *              id:       "ANcEJFstCKHsKn-jAAAJ",
 *              room:     "general chat",
 *              username: "Joe"
 *            },
 *            ...
 *            ]
 * }
 */
socket.on("roomData", ({ room, users }) => {
  const userList = sortUserList(users);
  const html = Mustache.render(sidebarTemplate, { room, users: userList });
  $sidebarContainer.innerHTML = html;
});

/************************************************************
 * HTML Event Handlers
 */

/**
 * Handle submissions on the new message form
 *
 * - Do nothing if the message is blank
 * - Send a sendMessage event to the server
 * - Disable button while message is being sent
 * - Re-enable button upon callback
 * - Display error if any occured
 */
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = e.target.elements.message;

  if (!messageInput.value.trim()) {
    $messageFormInput.value = ""; // Reset just in case msg was "    "
    $messageFormInput.focus();
    return;
  }

  $messageFormButton.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", messageInput.value, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.focus();

    if (error) {
      alert(error);
    }

    $messageFormInput.value = "";
  });
});

/**
 * Handle clicks on the Send Location button
 *
 * - Display error message if geolocation is not supported
 * - Send a sendLocation event to the server
 * - Disable button while geolocation is processing and message is being sent
 * - Re-enable button upon callback
 */
$locationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      $locationButton.removeAttribute("disabled");
    });
  });
});

/************************************************************
 * Subscription
 */

/**
 * Send event to join the current room, or display error if an error occurs
 */
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
