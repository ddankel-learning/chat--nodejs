/**
 * Generate a message object to send to the client
 *
 * @param   {String}  username  Username the message originated at (default: 'Admin')
 * @param   {String}  text      The text of the message to send
 *
 * @return  {Object}
 */
const generateMessage = ({ username = "Admin", text }) => ({
  username,
  text,
  createdAt: new Date().getTime(),
});

/**
 * Generatre a location message object to send to the client
 *
 * @param   {String}  username   The username the message originated at
 * @param   {Float}   longitude  The location's longitude
 * @param   {Float}   latitude   The location's latitude
 *
 * @return  {Object}
 */
const generateLocationMessage = ({ username, longitude, latitude }) => ({
  username,
  url: `https://google.com/maps/?q=${latitude},${longitude}`,
  createdAt: new Date().getTime(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
