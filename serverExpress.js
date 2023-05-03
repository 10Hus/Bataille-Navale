"use strict";
/////////////////
//   IMPORTS   //
/////////////////
exports.__esModule = true;
exports.PERSONNE = void 0;
var express_1 = require("express");
var http = require("http");
var socketio = require("socket.io");
var path_1 = require("path");
////////////////////
//   CONSTANTES   //
////////////////////
// Identifiant de connexion arbitraire (exporter pour jeu.ts)
exports.PERSONNE = 42;
// Nombre maximum de joueur pouvant se connecter au jeu
var NOMBRE_MAXIMUM_JOUEUR = 2;
// Port d'écoute du serveur
var PORT = 8080;
// Création d'un Tableau "joueurConnections" de taille 2 pour stocker les connexions des joueurs
// Exemple : [null, null] -> [0, true] -> [0, true][1, true] -> ...
var TABLEAU_JOUEUR_CONNEXION = [null, null];
/////////////////////////
//   SERVEUR EXPRESS   //
/////////////////////////
// Création de l'application Express
var app = (0, express_1["default"])();
// Création du serveur HTTP à partir de l'application Express
var server = http.createServer(app);
// Création de l'instance Socket.io à partir du serveur HTTP
var io = new socketio.Server(server);
// Définition d'un middleware pour servir les fichiers statiques dans le dossier "Client"
app.use(express_1["default"].static(path_1["default"].join(__dirname, 'Client')));
// Démarrage du serveur
server.listen(PORT, function () {
    console.log("Le serveur est bien lanc\u00E9 !");
    console.log("Le serveur est accessible via l'url : localhost:".concat(PORT, "\n"));
});
///////////////////
//   Événement   //
///////////////////
// Événement lors d'une connexion d'un client à la Socket.io
io.on("connection", function () {
    //////////////////////
    // PARTIE CONNEXION //
    //////////////////////
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    // Création d'un "identifiantJoueurConnecte" le temps qu'une connexion arrive
    var identifiantJoueurConnecte = exports.PERSONNE;
    // Aucune place n'a été trouvée
    var placeTrouvee = false;
    // Indice possible pour le prochain joueur connecté
    var identifiantJoueurDisponible = 0;
    // On cherche si une connexion est disponnible pour le joueur qui veut se connecter
    while (!placeTrouvee && (identifiantJoueurDisponible < NOMBRE_MAXIMUM_JOUEUR)) {
        // La place du joueur "identifiantJoueurDisponible" est libre donc il peut se connecter
        if (TABLEAU_JOUEUR_CONNEXION[identifiantJoueurDisponible] === null) {
            // Sauvegarde de l'identifiant du joueur qui vient de se connecter
            identifiantJoueurConnecte = identifiantJoueurDisponible;
            // Une place a été trouvée
            placeTrouvee = true;
            // Mise à jour du tableau de connexion avec la nouvelle connection du client
            TABLEAU_JOUEUR_CONNEXION[identifiantJoueurDisponible] = true;
            // La place du joueur "identifiantJoueurDisponible" n'est pas libre donc il ne peut pas se connecter    
        }
        // L'indice possible pour le prochain joueur connecté passe au suivant
        identifiantJoueurDisponible++;
    }
    // Il n'y a plus d'indice possible pour le prochain joueur
    if (identifiantJoueurDisponible >= NOMBRE_MAXIMUM_JOUEUR) {
        console.log("Erreur, aucune connexion disponnilbe, attendait la fin de la partie en cours ...");
    }
    ////////////////////
    // PARTIE MESSAGE //
    ////////////////////
    // Envoi d'un message au client pour lui donner son "identifiantJoueurConnecte"
    io.emit('identifiantJoueur', identifiantJoueurConnecte);
    console.log("Debug : Le joueur ".concat(identifiantJoueurConnecte, " a re\u00E7u son identifiant !"));
});
