import { WebSocket } from 'ws';
import * as readline from "node:readline"
const socket = new WebSocket('ws://localhost:8080');

socket.on('open', () => {
  console.log('Connected to WebSocket server');
  socket.send('Hello, Server!');
});

socket.onmessage = (event) => {
    const message = event.data;
    console.log('Message from server:', message);
};

socket.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

const rl= readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">"
})

rl.prompt()
rl.on("line", (input: string) => {
    socket.send(input);
    rl.prompt();
})
