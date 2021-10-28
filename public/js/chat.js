const socket = io();

// Elements
const $messageForm = document.querySelector("#new-message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#share-location-btn");
const $messageContainer = document.querySelector("#message-container");
const $sidebarContainer = document.querySelector("#sidebar-container");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Helpers
const sortUserList = (users) => {
  return users.sort((a, b) => {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  });
};

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

// Socket Handlers
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    timestamp: moment(message.createdAt).format("h:mm A"),
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const userList = sortUserList(users);
  const html = Mustache.render(sidebarTemplate, { room, users: userList });
  $sidebarContainer.innerHTML = html;
});

// HTML Event Handlers
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = e.target.elements.message;
  if (!messageInput.value) {
    return;
  }

  $messageFormButton.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", messageInput.value, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.focus();

    if (error) {
      return console.log("err", error);
    }

    $messageFormInput.value = "";
  });
});

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

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
