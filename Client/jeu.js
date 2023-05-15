////////////////////
//   CONSTANTES   //
////////////////////
// Identifiant de connexion arbitraire (exporter pour jeu.ts)
var PERSONNE = 42;
// Sélectionne le premier élément de la page HTML qui a un identifiant "info-serveur"
var INFO_SERVEUR = document.querySelector("#info-serveur");
////////////////////////////////////////////////////////////////////////////
// Sélectionne le premier élément de la page HTML qui a une classe "bateaux"
var SELECTEUR_BATEAUX = document.querySelector('.bateaux');
// Sélectionne le premier élément de la page HTML qui a un identifiant "jouer"
var BOUTON_COMMENCER = document.querySelector('#jouer');
///////////////////
//   VARIABLES   //
///////////////////
// Création d'un "identifiantJoueurConnecte" le temps qu'une connexion arrive
var identifiantJoueurConnecte = PERSONNE;
// Nom du joueur
var nomJoueur = "";
// Rôle du joueur
var roleJoueur = "";
// Nombre de joueurs connectes
var nbJoueur = 0;
////////////////////////////////////////////////////////////////////////////
// Indiquer s'il y a gagnant
var gagnant = false;
// ??? Nombre de bateau du joueur courant
var bateauJoueur;
// ??? Nombre de bateau de l'adversaire
var bateauAdversaire;
// État du joueur
var joueurPret = false; // Pas utilisee
// État de l'adversaire
var adversairePret = false;
// supercherie
var partieLancee = false;
var tour;
var touche = false;
////////////////
//   Client   //
////////////////
// Connexion du client au serveur avec Socket.io
var socketJeu = io();
///////////////////
//   Événement   //
///////////////////
// Écoute de l'événement 'identifiantJoueur' émis par le serveur
socketJeu.on('idJoueur', function (idJoueur) {
    console.log("Debug : \u00C9v\u00E8nement \"identifiantJoueur\" re\u00E7u !");
    console.log("Debug : idJoueur vaut : " + idJoueur);
    // Si trop de joueurs sont connectés
    if (idJoueur === PERSONNE) {
        // Mise à jour de INFO_SERVEUR dans la page HTML
        INFO_SERVEUR.innerHTML = "Trop de joueurs sont connectés !";
        // S'il y a moins de 3 joueurs connectés
    }
    else {
        // Récupération de l'identifiant du joueur qui vient de se connecter
        identifiantJoueurConnecte = Number(idJoueur);
        socketJeu.emit("connectionJoueur", identifiantJoueurConnecte);
        //console.log(identifiantJoueurConnecte)
        // Sauvegarde de l'id du joueur dans le code html de la page (pas mieux atm)
        var divIdJoueur = document.querySelector('.idJoueur');
        divIdJoueur === null || divIdJoueur === void 0 ? void 0 : divIdJoueur.classList.add("".concat(identifiantJoueurConnecte));
        divIdJoueur === null || divIdJoueur === void 0 ? void 0 : divIdJoueur.classList.remove('idJoueur');
        // Si c'est le Joueur 1
        if (identifiantJoueurConnecte === 0) {
            nbJoueur = 1;
            document.title = "Joueur 1 | Pourquoi Paul ?";
            // Nom du joueur
            nomJoueur = "Joueur 1";
            // Rôle du joueur
            roleJoueur = "joueur";
            // Actualisation de l'interface de connection
            var logJoueur = document.querySelector(".lj".concat(identifiantJoueurConnecte + 1));
            logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("ncoJoueur");
            logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("coJoueur");
            // Si c'est le Joueur 2
        }
        else if (identifiantJoueurConnecte === 1) {
            nbJoueur = 2;
            document.title = "Joueur 2 | Pourquoi Paul ?";
            // Nom du joueur
            nomJoueur = "Joueur 2";
            // Rôle du joueur
            roleJoueur = "adversaire";
            // Actualisation de l'interface de connection
            var logJoueur1 = document.querySelector(".lj".concat(identifiantJoueurConnecte));
            logJoueur1 === null || logJoueur1 === void 0 ? void 0 : logJoueur1.classList.remove("ncoJoueur");
            logJoueur1 === null || logJoueur1 === void 0 ? void 0 : logJoueur1.classList.add("coJoueur");
            var logJoueur2 = document.querySelector(".lj".concat(identifiantJoueurConnecte + 1));
            logJoueur2 === null || logJoueur2 === void 0 ? void 0 : logJoueur2.classList.remove("ncoJoueur");
            logJoueur2 === null || logJoueur2 === void 0 ? void 0 : logJoueur2.classList.add("coJoueur");
            // Si c'est le Joueur X
        }
        else {
            console.log("Erreur : identifiant du joueur connect\u00E9 inconnu !");
            // On s'arrête
            return;
        }
    }
});
// Lorsqu'un nouveau joueur se connecte, on met à jour son statut dans la liste des joueurs
socketJeu.on("nouveauJoueur", function (idAdversaire) {
    nbJoueur++;
    var logJoueur = document.querySelector(".lj".concat(idAdversaire));
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("ncoJoueur");
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("coJoueur");
});
// Lorsqu'un joueur est prêt, on met à jour son statut dans la liste des joueurs
socketJeu.on("UIjoueurPret", function (idJoueurPret) {
    adversairePret = true;
    var logJoueur = document.querySelector(".lj".concat(idJoueurPret));
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("coJoueur");
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("rdyJoueur");
});
// Lorsque la partie est lancée, on met à jour le tour, on marque le début de la partie et on retire la possibilité de lancer la partie
socketJeu.on("lancementPartie", function (premierTour) {
    tour = premierTour;
    partieLancee = true;
    bateauAdversaire = 17;
    // Mis à jour du joueur actuel
    var tourPartie = document.querySelector("#joueur");
    tourPartie.innerHTML = tour === 0 ? "Joueur 1" : "Joueur 2";
    // Retire la possibilité de lancer la partie en cliquant sur le bouton
    BOUTON_COMMENCER === null || BOUTON_COMMENCER === void 0 ? void 0 : BOUTON_COMMENCER.removeEventListener('click', commencerPartie);
});
// Mise à jour du tour
socketJeu.on("actualiserTour", function (infoTour, gagner) {
    // Changement du tour 
    tour = (tour + 1) % 2;
    // On récupère les éléments HTML nécessaires pour la mise à jour de la page
    var infoPartie = document.querySelector("#dernier-coup");
    var tourPartie = document.querySelector("#joueur");
    // Mise à jour de l'affichage 
    infoPartie.innerHTML = infoTour;
    // Si il y a un gagant
    if (gagner) {
        // On affiche un message de victoire
        tourPartie.innerHTML = "VICTOIRE de ".concat(tourPartie.innerHTML);
        // On désactive les cases cliquables
        var casesCliquables = document.querySelectorAll(".eau");
        casesCliquables.forEach(function (td) {
            if (td.classList.contains("cliquable")) {
                td.removeEventListener('click', tirer);
            }
        });
    }
    // Si il n'y a pas de gagnant 
    else {
        // On met à jour le tour affiché 
        tourPartie.innerHTML = tourPartie.innerHTML === "Joueur 1" ? "Joueur 2" : "Joueur 1";
    }
});
socketJeu.on("tireAdverse", function (cible) {
    var caseCiblee = document.querySelectorAll("#joueur td.eau");
    caseCiblee.forEach(function (td) {
        if (td.id === String(cible)) {
            if (td === null || td === void 0 ? void 0 : td.classList.contains('occupee')) {
                td.classList.add("touche-joueur");
            }
            else {
                td === null || td === void 0 ? void 0 : td.classList.add("rate-joueur");
            }
        }
    });
});
// Fonction pour vérifier si il y a un gagant ou non
function verifierGagner() {
    return !bateauAdversaire;
}
// Fonction appelée à chaque tir
function tirer(_case) {
    var _a;
    var etat;
    // Si la partie n'est pas encore lancée, la fonction ne fait rien
    if (!partieLancee) {
        return;
    }
    // On récupère l'identifiant du joueur qui vient tirer
    var logJoueurId = Number((_a = document.querySelector(".tireJoueur")) === null || _a === void 0 ? void 0 : _a.classList[1]);
    // Si un joueur a gagné, on ne fait plus rien
    if (!gagnant && logJoueurId === tour) {
        touche = false;
        // On récupère l'identifiant de la case ciblée
        var cible = Number(_case.target.id);
        // On envoie un événement au serveur pour lui indiquer que le joueur a tiré sur la case
        socketJeu.emit('tireJoueur', tour, cible, function (data) {
            touche = data;
            // On désactive la case sur laquelle le joueur a cliqué
            _case.target.classList.remove("cliquable");
            _case.target.removeEventListener('click', tirer);
            // Si le joueur a touché un bateau
            if (touche) {
                etat = "touché";
                bateauAdversaire--;
                // Mise a jour des classes de la case
                _case.target.classList.add("touche-adversaire");
                gagnant = verifierGagner();
            }
            // Si le joueur n'a pas touché un bateau
            else {
                etat = "raté";
                // Mise a jour des classes de la case
                _case.target.classList.add("rate-adversaire");
            }
            // Mis à jour de l'affichage 
            var tourPartie = document.querySelector("#joueur");
            var correspondance = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1',
                'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2',
                'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3', 'J3',
                'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4',
                'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5',
                'A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6', 'J6',
                'A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7', 'J7',
                'A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8', 'J8',
                'A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9', 'J9',
                'A10', 'B10', 'C10', 'D10', 'E10', 'F10', 'G10', 'H10', 'I10', 'J10',];
            socketJeu.emit("tourSuivant", "".concat(tourPartie === null || tourPartie === void 0 ? void 0 : tourPartie.innerHTML, " a ").concat(etat, " ").concat(correspondance[Number(_case.target.id)]), gagnant);
        });
    }
    else {
        return;
    }
}
// Fonction appelée au début de la partie
function commencerPartie() {
    var _a;
    console.log("aa");
    var infoPartie = document.querySelector("#dernier-coup");
    infoPartie.innerHTML = "";
    // On vérifie qu'il y ait 2 joueurs et que celui qui clique à poser tous ses baetaux 
    if (nbJoueur !== 2 || SELECTEUR_BATEAUX.children.length > 0) {
        infoPartie.innerHTML = "Vous devez placer tous vos bateaux et attendre que votre adversaire se connecte avant de lancer la partie";
    }
    else {
        // On récuper l'ID du joueur actuel, et on signal qu'il est prêt
        var logJoueurId = Number((_a = document.querySelector(".tireJoueur")) === null || _a === void 0 ? void 0 : _a.classList[1]) + 1;
        socketJeu.emit("joueurPret", logJoueurId);
        // On enlève le fait de pouvoir cliquer sur le bouton
        //BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)
        // On change son état en prêt
        var logJoueur = document.querySelector(".lj".concat(logJoueurId));
        logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("coJoueur");
        logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("rdyJoueur");
        // On met tous les cas en cliquable 
        var casesCliquables = document.querySelectorAll("#adversaire td");
        casesCliquables.forEach(function (td) {
            if (td.classList.contains("cliquable")) {
                td.addEventListener('click', tirer);
            }
        });
        // On envoie la grille du joueur au serveur
        var grille_1 = [];
        var casesJoueur = document.querySelectorAll("#joueur td.eau");
        casesJoueur.forEach(function (td) {
            if (td.classList.contains("bateau")) {
                grille_1.push(true);
            }
            else {
                grille_1.push(false);
            }
        });
        socketJeu.emit("grilleJoueur", grille_1, logJoueurId);
        // On vérifie si l'adversaire est prêt également, on le signale au serveur
        if (adversairePret) {
            var premierTour = Math.random() < 0.5 ? 0 : 1;
            socketJeu.emit("joueursPrets", premierTour);
        }
    }
}
// On lie le bouton et la fonction 
BOUTON_COMMENCER === null || BOUTON_COMMENCER === void 0 ? void 0 : BOUTON_COMMENCER.addEventListener('click', commencerPartie);
var divGrilleJeu = document.querySelector('#grille');
// Création de la grille
function creerGrille(mode, nom) {
    // Cration de l'éléement
    var grilleJeu = document.createElement('table');
    // Style de la grille
    grilleJeu.style.padding = "0";
    grilleJeu.style.borderSpacing = "5";
    grilleJeu.style.backgroundColor = "#000000";
    grilleJeu.classList.add("grille-jeu");
    grilleJeu.id = mode;
    // Ajoue de l'entete et des lignes
    creerEntete(grilleJeu);
    creerLignes(grilleJeu, mode);
    // Si la grille est celle de l'adversaire on ajoute des événements  
    if (mode === "adversaire") {
        grilleJeu.querySelectorAll("td").forEach(function (td) {
            if (td.classList.contains("cliquable")) {
                // Ajouter la classe "jouable" quand le curseur entre dans la case
                td.onpointerenter = function () {
                    td.classList.add("jouable");
                };
                // Enlève la classe "jouable" quand le curseur quitte dans la case
                td.onpointerleave = function () {
                    td.classList.remove("jouable");
                };
            }
        });
    }
    // Ajout de la grille au divGrilleJeu si il existe 
    divGrilleJeu === null || divGrilleJeu === void 0 ? void 0 : divGrilleJeu.append(grilleJeu);
}
// Fonction pour faire l'entete d'une grille
function creerEntete(grilleJeu) {
    // Création d'une ligne pour l'entete
    var entete = document.createElement('tr');
    entete.style.backgroundColor = "#ffffff";
    // Création d'une case vide en haut à gauche
    var celluleVide = document.createElement('th');
    celluleVide.style.width = "25";
    celluleVide.classList.add("case-grille");
    entete.append(celluleVide);
    // Ajout des lettres A à J dans l'entete
    for (var i = 0; i < 10; i++) {
        var enteteCellule = document.createElement('th');
        enteteCellule.style.verticalAlign = "center";
        enteteCellule.style.alignContent = "center";
        enteteCellule.classList.add("case-grille");
        enteteCellule.append("".concat(String.fromCharCode(65 + i)));
        entete.append(enteteCellule);
    }
    // Ajout de l'entête à la grille de jeu
    grilleJeu.append(entete);
}
// Fonction pour faire les lignes de la grille
function creerLignes(grilleJeu, mode) {
    // Pour chaque ligne de la grille
    for (var i = 0; i < 10; i++) {
        var ligne = document.createElement('tr');
        ligne.style.backgroundColor = "#ffffff";
        // Création de la première cellule qui comporte uniquement le numéro de la ligne
        var numeroCellule = document.createElement('td');
        numeroCellule.style.textAlign = "center";
        numeroCellule.style.verticalAlign = "middle";
        numeroCellule.classList.add('case-grille');
        numeroCellule.append("".concat(i + 1));
        ligne.append(numeroCellule);
        // Pour chaque cellule de la grille
        for (var j = 0; j < 10; j++) {
            // On crée une cellule qu'on rempli d'eau 
            var cellule = document.createElement('td');
            cellule.classList.add("case-grille");
            cellule.classList.add("eau");
            // On la rend cliquable si c'est l'adversaire
            if (mode === 'adversaire') {
                cellule.classList.add('cliquable');
            }
            // On donne à chaque cellule un id allant de 0 à 99
            cellule.id = "".concat(10 * i + j);
            // On ajoute la cellule à la ligne
            ligne.append(cellule);
        }
        // On ajoute la ligne à la grille
        grilleJeu.append(ligne);
    }
}
// On crée les grilles du joueur et de l'adevrsaire 
creerGrille("joueur", nomJoueur);
creerGrille("adversaire", "En attente...");
// Création des bateaux avec leurs tailles 
var porteAvions = { Taille: 5 };
var croiseur = { Taille: 4 };
var contreTorpilleur1 = { Taille: 3 };
var contreTorpilleur2 = { Taille: 3 };
var torpilleur = { Taille: 2 };
var BATEAUX = [porteAvions, croiseur, contreTorpilleur1, contreTorpilleur2, torpilleur];
var bateauSelectionne;
// Fonction appelée pour poser les bateaux
function placerBateau(bateau, emplacement) {
    // On récupère les cases jouables
    var casesJouables = document.querySelectorAll('#joueur td.eau');
    // On récupére l'orientation actuelle
    var orientation = SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.getAttribute("id");
    var emplacementValide;
    // Si on est à l'horizontal
    if (orientation === 'horizontaux') {
        // On vérife si il y a la place pour le mettre
        if (Math.floor((Number(emplacement) + bateau.Taille - 1) / 10) == Math.floor(emplacement / 10)) {
            emplacementValide = emplacement;
        }
        // Si ce n'est pas le cas, on le met là où il y a de la place
        else {
            emplacementValide = Math.ceil(emplacement / 10) * 10 - bateau.Taille;
        }
    }
    // Si on est à la verticale
    else {
        // On vérife si il y a la place pour le mettre
        if ((Number(emplacement) / 10 + bateau.Taille - 1) < 10) {
            emplacementValide = emplacement;
        }
        // Si ce n'est pas le cas, on le met là où il y a de la place
        else {
            emplacementValide = Number(emplacement) - 10 * (bateau.Taille - 1);
        }
    }
    var casesBateau = [];
    // On note toutes les cases occupées par le bateau
    for (var i = 0; i < bateau.Taille; i++) {
        if (orientation === 'horizontaux') {
            casesBateau.push(casesJouables[Number(emplacementValide) + i]);
        }
        else {
            casesBateau.push(casesJouables[Number(emplacementValide) + 10 * i]);
        }
    }
    var libre = casesBateau.every(function (_case) { return !_case.classList.contains("occupee"); });
    // On met à jour la grille et on retire le bateau de la liste 
    if (libre) {
        casesBateau.forEach(function (_case) {
            _case.classList.add("".concat(emplacementValide, "-").concat(bateau.Taille));
            _case.classList.add("bateau");
            _case.classList.add("occupee");
            bateauSelectionne.remove();
        });
        bateauJoueur++;
    }
}
// Ajoute un evenement quand on attrape un bateau pour le poser 
var placementBateaux = Array.prototype.slice.call(SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.children);
placementBateaux.forEach(function (placementBateau) {
    placementBateau.addEventListener("dragstart", selectionnerBateau);
});
function selectionnerBateau(bateau) {
    bateauSelectionne = bateau.target;
}
var casesJouables = document.querySelectorAll('#joueur td.eau');
casesJouables.forEach(function (casejouable) {
    casejouable.addEventListener('dragover', placement);
    casejouable.addEventListener('drop', placer);
});
function placement(bateau) {
    bateau.preventDefault();
}
function placer(bateau) {
    var emplacement = bateau.target.id;
    var bateauId = BATEAUX[Number(bateauSelectionne.id)];
    placerBateau(bateauId, emplacement);
}
var boutonTourner = document.querySelector('#tourner');
// Fonction pour changer l'orientation des bateaux
function tournerBateaux() {
    // On récupère l'orirentation actuelle, et on la même à jour
    var textBoutonTourner = document.querySelector('#orientation');
    textBoutonTourner.innerHTML = (textBoutonTourner === null || textBoutonTourner === void 0 ? void 0 : textBoutonTourner.innerHTML) === "verticaux" ? "horizontaux" : "verticaux";
    var listeBateaux = Array.prototype.slice.call(SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.children);
    // On met à jour chaque bateau
    if ((SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.getAttribute("id")) === "horizontaux") {
        listeBateaux.forEach(function (listeBateaux) {
            listeBateaux.style.transform = 'rotate(90deg)';
        });
        SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.setAttribute("id", "verticaux");
    }
    else {
        listeBateaux.forEach(function (listeBateaux) {
            listeBateaux.style.transform = "";
        });
        SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.setAttribute("id", "horizontaux");
    }
}
// On lie la fonction et le bouton
boutonTourner === null || boutonTourner === void 0 ? void 0 : boutonTourner.addEventListener('click', tournerBateaux);
