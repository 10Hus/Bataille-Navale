/////////////////
//   IMPORTS   //
/////////////////

import express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import path from 'path'



////////////////////
//   CONSTANTES   //
////////////////////

// Identifiant de connexion arbitraire
const PERSONNE = 42;

// Nombre maximum de joueur pouvant se connecter au jeu
const NOMBRE_MAXIMUM_JOUEUR = 2;

// Port d'écoute du serveur
const PORT = 8080

// Création d'un Tableau "joueurConnections" de taille 2 pour stocker les connexions des joueurs
// Exemple : [null, null] -> [0, true] -> [0, true][1, true] -> ...
const TABLEAU_JOUEUR_CONNEXION: any[] = [null, null]



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
io.on("connection", (...params:any) => {

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

    // Il n'y a plus d'indice possible pour le prochain joueur
    if (identifiantJoueurDisponible >= NOMBRE_MAXIMUM_JOUEUR) {
        console.log(`Debug : Erreur, aucune connexion disponnilbe, attendait la fin de la partie en cours ...`);
    }

    ////////////////////
    // PARTIE MESSAGE //
    ////////////////////

    // Envoi d'un message au client pour lui donner son "identifiantJoueurConnecte"
    io.emit('identifiantJoueur', identifiantJoueurConnecte)

    console.log(`Debug : Le joueur ${identifiantJoueurConnecte} a reçu son identifiant !`);

});