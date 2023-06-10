const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname + '/public')));

const botName = 'Chatroom bot';

io.on('connection', socket => {
    //listen to the event joinRoom
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);


        //Welcome message by the chatbot
        socket.emit('message', formatMessage(botName, 'You have joined the conversation'));

        //Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Display the name of the room and the users list
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        //Emit a sound to other users when a user connects
        io.to(user.room).emit('notifSound');
    });


    //listen to the event chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        //Display current date of the message and the user's name who send the message for all users
        io.to(user.room).emit('message', formatMessage(user.username, msg));

        //Emit sound to other users when a user sends a message
        socket.broadcast.to(user.room).emit('notifSound');
    });

    //Run when a user leaves the chat 
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            //Broadcast when a user disconnects
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            //added
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

            //Emit sound to other users when a user disconnects
            socket.broadcast.to(user.room).emit('notifSound');
        }
    });
});

server.listen('3000', () => {
    console.log('Server listening to port 3000');
});

