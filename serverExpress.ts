import express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import path from 'path'

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);
const port = 8080

app.use(express.static(path.join(__dirname, 'Client')))

server.listen(port, () => {
    console.log(`Running at localhost:${port}`);
});


const joueurConnections: any[] = [null, null]
io.on("connection", (...params: any) => {
    let idJoueur = 666
    let place = false
    let i = 0
    while (!place && (i < 2)) {
        if (joueurConnections[i] === null) {
            idJoueur = i
            place = true
            joueurConnections[i] = true

        }
        i++
    }

    io.emit('idJoueur', idJoueur)
    console.log(`Le joueur ${idJoueur + 1} s'est connecté.`);

    if (idJoueur === 666) {
        return
    }
});

