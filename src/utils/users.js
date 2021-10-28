/**
 * Constant to contain the current users
 *
 * This storage is volitile and will reset if the process restarts
 *
 * @var {Array}
 */
const users = [];

/**
 * Add a user session to storage
 *
 * Username and room will be trimmed and lowercased.
 *
 * @param   {String}  id        A unique ID for the user/room instance
 * @param   {String}  username  The user's display name
 * @param   {String}  room      The room the user is joining
 *
 * @return  {Object}            An object containing an error property if an
 *                              error occured, otherwise the object will
 *                              contain the user stored as a user property.
 */
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) return { error: "Username and Room are required" };

  if (users.find((user) => user.room === room && user.username === username)) {
    // User already exists in this room
    return { error: "User already exists in this room" };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

/**
 * Remove a user session from storage
 *
 * @param   {String}  id  The ID of the user/room instance to remove
 *
 * @return  {Object}      The user removed ({id, username, room})
 */
const removeUser = (id) => {
  const index = users.findIndex((u) => u.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

/**
 * Get a user session by id
 *
 * @param   {String}  id  Unique ID to search by
 *
 * @return  {Object, undefined}      The user ({id, username, room})
 */
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

/**
 * Get all users currently active in the specified room
 *
 * @param   {String}  room  The room to fetch the users for
 *
 * @return  {Array}         Array of objects for each user currently in the
 *                          room ({id, username, room})
 */
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
