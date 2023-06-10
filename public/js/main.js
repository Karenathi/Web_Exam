const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const audio = new Audio('notification_sound/sound.mp3');

const{username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//emit the event joinRoom
socket.emit('joinRoom', {username, room});


//Listen to the event roomUsers
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);

})

//Listen to the event message
socket.on('message', message => {
    console.log((message));
    outputMessage(message);

//Scroll when the message-box is full
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    const msg =e.target.elements.msg.value;

    
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

    //Emit a notification sound to everyone except the user who submits the message
    socket.broadcast.emit('notifSound');
});

//listen to the notification sound
socket.on('notifSound', () =>{
    notifSound();
});

//Sent message function
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`  <p class="meta"> ${message.username} <span> ${message.time} </span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//The name of the room function
function outputRoomName(room){
    roomName.innerText = room;
}

//List of users function
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

//notification sound function
function notifSound(){
    audio.play();
}


