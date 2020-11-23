

const socket = io();
const chatform = document.getElementById('chat-form')
socket.on('message', message => {
    let div = document.createElement('div');
    div.style.paddingLeft = 50;
    div.textContent = message;
    div.style.backgroundColor = 'black';
    div.style.color = 'white';
    document.body.append(div);
    console.log(message);
})

chatform.addEventListener('submit', (event) => {
    event.preventDefault();
    const msg = event.target.elements.m.value;
    socket.emit('chatMessage', msg)
})
