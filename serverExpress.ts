/////////////////
//   IMPORTS   //
/////////////////

import express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import path from "path"

////////////////////
//   CONSTANTES   //
////////////////////

// Identifiant de connexion arbitraire (exporter pour jeu.ts)
const PERSONNE = 42;

// Nombre maximum de joueur pouvant se connecter au jeu
const NOMBRE_MAXIMUM_JOUEUR = 2;

// Port d'écoute du serveur
const PORT = 8080

// Création d'un Tableau "joueurConnections" de taille 2 pour stocker les connexions des joueurs
// Exemple : [null, null] -> [0, true] -> [0, true][1, true] -> ...
const TABLEAU_JOUEUR_CONNEXION: any[] = [null, null]

// grilles des joueurs
let grilleJ1 : boolean[]
let grilleJ2 : boolean[]

/////////////////////////
//   SERVEUR EXPRESS   //
/////////////////////////

// Création de l'application Express
const app = express();

// Création du serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Création de l'instance Socket.io à partir du serveur HTTP
const io = new socketio.Server(server);

// Définition d'un middleware pour servir les fichiers statiques dans le dossier "Client"
app.use(express.static(path.join(__dirname, 'Client')))

// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`Le serveur est bien lancé !`);
    console.log(`Le serveur est accessible via l'url : localhost:${PORT}\n`);
});

///////////////////
//   Événement   //
///////////////////

// Événement lors d'une connexion d'un client à la Socket.io
io.on("connection", (socket) => {

    //////////////////////
    // PARTIE CONNEXION //
    //////////////////////

    // Création d'un "identifiantJoueurConnecte" le temps qu'une connexion arrive
    let identifiantJoueurConnecte = PERSONNE

    // Aucune place n'a été trouvée
    let placeTrouvee = false

    // Indice possible pour le prochain joueur connecté
    let identifiantJoueurDisponible = 0

    // On cherche si une connexion est disponnible pour le joueur qui veut se connecter
    while (!placeTrouvee && (identifiantJoueurDisponible < NOMBRE_MAXIMUM_JOUEUR)) {

        // La place du joueur "identifiantJoueurDisponible" est libre donc il peut se connecter
        if (TABLEAU_JOUEUR_CONNEXION[identifiantJoueurDisponible] === null) {

            // Sauvegarde de l'identifiant du joueur qui vient de se connecter
            identifiantJoueurConnecte = identifiantJoueurDisponible

            // Une place a été trouvée
            placeTrouvee = true
            
            // Mise à jour du tableau de connexion avec la nouvelle connection du client
            TABLEAU_JOUEUR_CONNEXION[identifiantJoueurDisponible] = true

        // La place du joueur "identifiantJoueurDisponible" n'est pas libre donc il ne peut pas se connecter    
        }

        // L'indice possible pour le prochain joueur connecté passe au suivant
        identifiantJoueurDisponible ++
    }

    console.log(`Debug : identifiantJoueurDisponible : ${identifiantJoueurDisponible}`);

    // Il n'y a plus d'indice possible pour le prochain joueur
    // "identifiantJoueurDisponible - 1" car il vaut un de plus que le dernier identifiantJoueurConnecte
    if (identifiantJoueurDisponible - 1 >= NOMBRE_MAXIMUM_JOUEUR) {
        console.log(`Erreur, aucune connexion disponnilbe, attendez la fin de la partie en cours ...`);
    }

    ////////////////////
    // PARTIE MESSAGE //
    ////////////////////

    // Envoi d'un message au client pour lui donner son "identifiantJoueurConnecte"
    socket.emit('idJoueur', identifiantJoueurConnecte)

    if (placeTrouvee){
        console.log(`Debug : Le joueur ${identifiantJoueurConnecte} a reçu son identifiant !`);
    }

    // Lorsqu'un joueur se connecte
    socket.on("connectionJoueur", (idJoueur) => {
        socket.broadcast.emit("nouveauJoueur", (idJoueur+1))
    })

    // Lorsqu'un joueur est prêt à jouer
    socket.on("joueurPret", (idJoueur) => {
        socket.broadcast.emit("UIjoueurPret", idJoueur)
    })

    // Lorsqu'un joueur envoie sa grille de jeu
    socket.on("grilleJoueur", (grille, idJoueur)=> {
        if (idJoueur === 1) {
            grilleJ1 = grille
        } else {
            grilleJ2 = grille
        }
    })

    // Lorsque les deux joueurs sont prêts, on lance la partie
    socket.on("joueursPrets", (premierTour) => {
        socket.emit("lancementPartie", premierTour)
        socket.broadcast.emit("lancementPartie", premierTour)
    })

    // Lorsqu'un joueur tire, on vérifie si il a touché ou non
    socket.on("tireJoueur", function(tour, cible, fn) {
        let verifTouche
        if (tour === 0) {
            verifTouche = grilleJ2[cible]
        } else {
            verifTouche = grilleJ1[cible]
        }
        fn(verifTouche)
    })

    // Changement de tour
    socket.on("tourSuivant", (infoTire, gagnant) => {
        socket.emit("actualiserTour", infoTire, gagnant)
        socket.broadcast.emit("actualiserTour", infoTire, gagnant)
    })

});