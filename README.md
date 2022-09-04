# NodeJS Chatroom

[View Demo](https://chat-dd.herokuapp.com/)

A simple chat app to explore the functionality of [Express](https://expressjs.com/) with bidirectional communication via [Socket.IO](https://socket.io/). This app was initially written as part of [The Complete Node.js Developer Course](https://www.udemy.com/course/the-complete-nodejs-developer-course-2/learn/lecture/13728904) by [Andrew Mead](https://mead.io).

### Installation

1. Clone the repo

2. Install yarn packages
   ```sh
   yarn install
   ```
3. Run
   ```sh
   yarn serve
   ```

### Limitations

- User, chat, and room data is volatile and will expire when the process restarts. If hosted on a service where the process will be spun down when inactive (eg Heroku) this will reset any stored data.
- Messages in rooms are distributed to clients without persisting them to some sort of storage. If a user leaves and returns, they will not be able to access any sort of message history.

These features would be addressed in future versions, were development on this application to continue beyond its educational use.

## License

Distributed under the MIT License. See [LICENSE.txt](LICENSE.txt) for more information.

## Contact

Project Link: [https://github.com/ddankel-learning/chat--nodejs](https://github.com/ddankel-learning/chat--nodejs)
