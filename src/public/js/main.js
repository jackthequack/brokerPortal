const socket = io();
const chatform = document.getElementById('chat-form')
socket.on('message', message => {
  
    console.log(message);
})

chatform.addEventListener('submit', (event) => {
    event.preventDefault();
    const msg = event.target.elements.m.value;
    socket.emit('chatMessage', msg)
})
