
const socket = io();
const chatForm = document.getElementById('chat-form')


socket.on('message', message => {
    console.log(message);
    const div = document.createElement('div')
    div.innerHTML = `<li class="messages"><p class="messages">${message.username}:<span></span></p>
    <p class="messages">
        ${message.text}
    </p></li>`
    const ul = document.getElementById('messages')
    // const li = document.createElement('li');
    // const p = document.createElement('p');
    // p.textContent = message.text;
    // li.appendChild(p);
    ul.appendChild(div);
})
// socket.on('chatMessage', message => {
//     socket.emit('message', message)

// })

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const msg = event.target.elements.m.value;
    socket.emit('chatMessage', msg)
    event.target.elements.m.value = '';
})

outputMsg = (message) => {
    const ul = document.getElementById('messages')
    const li = document.createElement('li');
    const p = document.createElement('p');
    p.textContent = message;
    li.appendChild(p);
    ul.appendChild(li);

}

/*
const moment = require('moment');

const formatMessage = (username, text) => {
    return {username,
        text,
        time: moment().format('h:mm a')}
}

module.exports = formatMessage;
*/
