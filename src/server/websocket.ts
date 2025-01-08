import http from "http";
import {WebSocket, WebSocketServer } from "ws"; // Import the `ws` library

interface RoomConfig {
readonly room: string,
members: WebSocket[],
numMember: number,
prevMembers: WebSocket[]
createdAt?: Date
}

const rooms: RoomConfig[] = [];
const clientToRoom = new Map<WebSocket, string>();

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, WebSocket!");
});

server.listen(8080, () => {
    console.log("Server is running on port 8080");
});

function genNewID(): string{
    const dateStr = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${dateStr}-${randomStr}`;
}

function createNewRoom(ws: WebSocket){
    const roomId: string = genNewID();
    rooms.push({
    room: roomId,
    numMember: 1,
    members: [ws],
    prevMembers: [],
    createdAt: new Date(),
});

clientToRoom.set(ws, roomId);
}

const wsServer = new WebSocketServer({
server: server, // Use the http server for WebSocket
});

wsServer.on("connection", (ws) => {
    console.log("New WebSocket connection established");
    if (rooms.length === 0){
            console.log("No rooms creating new room...")
            createNewRoom(ws)
    } else {
    let found: Boolean = false;
    rooms.forEach(room => {
    if (room.numMember === 1 && !room.prevMembers.find(element => element != ws)){
            found = true;
            room.members.push(ws);
            room.numMember++;
            clientToRoom.set(ws, room.room);
            console.log("Found open room, connecting now...")         
            console.log(clientToRoom);
    }
    });
    if(!found){
            console.log("No unvisted rooms checking previously visited");
            rooms.forEach(room => {
                if (room.numMember === 1){
                        found = true;
                        room.members.push(ws);
                        room.numMember++;
                        clientToRoom.set(ws, room.room);
                        console.log("Found open room, connecting now...")         
                        console.log(clientToRoom);
                }
            });
        }
    if(!found){
        console.log("No open room... Creating new room...");
        createNewRoom(ws);
    }}

    // Handle messages from the client
    ws.on("message", (message) => {
        console.log("Received: " + message);
        const roomId: string = clientToRoom.get(ws) || "null";
        if (roomId === "null"){
            console.error(ws, " does not have a room assiged");
            return;
        }
        rooms.forEach(room => {
            if(room.room === roomId){
                room.members.forEach(member => {
                    if(member !== ws){
                        console.log("Sending message...");
                        member.send(message.toString());
                    }
                })
            }
        })
    });

    // Handle client disconnect
    ws.on("close", () => {
        const roomId: string = clientToRoom.get(ws) || "null";
        if (roomId === "null"){
            console.error(ws, " does not have a room assigned");
            return;
        }
        rooms.forEach(room => {
            if(room.room === roomId){
                room.prevMembers.push(ws);
                console.log("Before removal ", room.members.length)
                room.members = room.members.filter(member => member != ws);
                room.numMember -= 1;
                console.log("After removal ", room.members.length)
            }
        })
        console.log("Client disconnected");
    });
});
        