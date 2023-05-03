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
////////////////////////////////////////////////////////////////////////////
// Indiquer s'il y a gagnant
var gagnant = false;
// ??? Nombre de bateau du joueur courant
var bateauJoueur;
// ??? Nombre de bateau de l'adversaire
var bateauAdversaire;
// État du joueur
var joueurPret = false;
// État de l'adversaire
var adversairePret = false;
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
        // Si c'est le Joueur 1
        if (identifiantJoueurConnecte === 0) {
            // Nom du joueur
            nomJoueur = "Joueur 1";
            // Rôle du joueur
            roleJoueur = "joueur";
            // Si c'est le Joueur 2
        }
        else if (identifiantJoueurConnecte === 1) {
            // Nom du joueur
            nomJoueur = "Joueur 2";
            // Rôle du joueur
            roleJoueur = "adversaire";
            // Si c'est le Joueur X
        }
        else {
            console.log("Erreur : identifiant du joueur connect\u00E9 inconnu !");
            // On s'arrête
            return;
        }
    }
});
function verifierGagner() {
    return !bateauJoueur || !bateauAdversaire;
}
function tirer(_case) {
    var etat;
    if (!gagnant) {
        if (_case.target.classList.contains('occupee')) {
            etat = "touché";
            bateauAdversaire--;
            // Mise a jour des classes de la case
            _case.target.classList.remove("occupee");
            _case.target.classes.remove("cliquable");
            _case.target.classList.add("touche-adversaire");
            var caseClasses = _case.target.classList;
            console.log(caseClasses);
            gagnant = verifierGagner();
        }
        else {
            etat = "raté";
            _case.target.classList.remove("cliquable");
            _case.target.removeEventListener('click', tirer);
            _case.target.classList.add("rate-adversaire");
        }
    }
    //Mise a jour info et tour
    var infoPartie = document.querySelector("#dernier-coup");
    var tourPartie = document.querySelector("#joueur");
    // parce que je suis vraiment trop con à avoir commencer mes id a 1 personne fait ça wtf
    var correspondance = ['NULL',
        'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10',
        'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10',
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
        'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10',
        'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10',
        'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10',
        'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10',
        'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10',
        'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10'];
    infoPartie.innerHTML = "".concat(tourPartie === null || tourPartie === void 0 ? void 0 : tourPartie.innerHTML, " a ").concat(etat, " ").concat(correspondance[Number(_case.target.id)]);
    if (gagnant) {
        tourPartie.innerHTML = "VICTOIRE de ".concat(tourPartie.innerHTML);
    }
    else {
        tourPartie.innerHTML = tourPartie.innerHTML === "Joueur 1" ? "Joueur 2" : "Joueur 1";
    }
}
function commencerPartie() {
    console.log(identifiantJoueurConnecte);
    var infoPartie = document.querySelector("#dernier-coup");
    infoPartie.innerHTML = "";
    if (SELECTEUR_BATEAUX.children.length > 0) {
        infoPartie.innerHTML = "Placer tout vos bateaux avant de lancer la partie";
        bateauJoueur = 18;
        bateauAdversaire = 18;
    }
    else {
        var tourPartie = document.querySelector("#joueur");
        tourPartie.innerHTML = Math.random() < 0.5 ? "Joueur 1" : "Joueur 2";
        BOUTON_COMMENCER === null || BOUTON_COMMENCER === void 0 ? void 0 : BOUTON_COMMENCER.removeEventListener('click', commencerPartie);
        var casesCliquables = document.querySelectorAll("#adversaire td");
        casesCliquables.forEach(function (td) {
            if (td.classList.contains("cliquable")) {
                td.addEventListener('click', tirer);
            }
        });
    }
}
BOUTON_COMMENCER === null || BOUTON_COMMENCER === void 0 ? void 0 : BOUTON_COMMENCER.addEventListener('click', commencerPartie);
var divGrilleJeu = document.querySelector('#grille');
function creerGrille(mode, nom) {
    var grilleJeu = document.createElement('table');
    grilleJeu.style.padding = "0";
    grilleJeu.style.borderSpacing = "5";
    grilleJeu.style.backgroundColor = "#000000";
    grilleJeu.classList.add("grille-jeu");
    grilleJeu.id = mode;
    creerEntete(grilleJeu);
    creerLignes(grilleJeu, mode);
    if (mode === "adversaire") {
        grilleJeu.querySelectorAll("td").forEach(function (td) {
            if (td.classList.contains("cliquable")) {
                td.onpointerenter = function () {
                    td.classList.add("jouable");
                };
                td.onpointerleave = function () {
                    td.classList.remove("jouable");
                };
            }
        });
    }
    divGrilleJeu === null || divGrilleJeu === void 0 ? void 0 : divGrilleJeu.append(grilleJeu);
}
function creerEntete(grilleJeu) {
    var entete = document.createElement('tr');
    entete.style.backgroundColor = "#ffffff";
    var celluleVide = document.createElement('th');
    celluleVide.style.width = "25";
    celluleVide.classList.add("case-grille");
    entete.append(celluleVide);
    for (var i = 0; i < 10; i++) {
        var enteteCellule = document.createElement('th');
        enteteCellule.style.verticalAlign = "center";
        enteteCellule.style.alignContent = "center";
        enteteCellule.classList.add("case-grille");
        enteteCellule.append("".concat(String.fromCharCode(65 + i)));
        entete.append(enteteCellule);
    }
    grilleJeu.append(entete);
}
function creerLignes(grilleJeu, mode) {
    for (var i = 0; i < 10; i++) {
        var ligne = document.createElement('tr');
        ligne.style.backgroundColor = "#ffffff";
        var numeroCellule = document.createElement('td');
        numeroCellule.style.textAlign = "center";
        numeroCellule.style.verticalAlign = "middle";
        numeroCellule.classList.add('case-grille');
        numeroCellule.append("".concat(i + 1));
        ligne.append(numeroCellule);
        for (var j = 0; j < 10; j++) {
            var cellule = document.createElement('td');
            cellule.classList.add("case-grille");
            cellule.classList.add("eau");
            if (mode === 'adversaire') {
                cellule.classList.add('cliquable');
            }
            cellule.id = "".concat(10 * i + (j + 1));
            ligne.append(cellule);
        }
        grilleJeu.append(ligne);
    }
}
creerGrille("joueur", nomJoueur);
creerGrille("adversaire", "En attente...");
var porteAvions = { Taille: 5 };
var croiseur = { Taille: 4 };
var contreTorpilleur1 = { Taille: 3 };
var contreTorpilleur2 = { Taille: 3 };
var torpilleur = { Taille: 2 };
var BATEAUX = [porteAvions, croiseur, contreTorpilleur1, contreTorpilleur2, torpilleur];
var bateauSelectionne;
function placerBateau(bateau, emplacement) {
    var casesJouables = document.querySelectorAll('#joueur td.eau');
    var orientation = SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.getAttribute("id");
    console.log(emplacement);
    var emplacementValide;
    var limite = Math.ceil(emplacement / 10) * 10;
    //console.log(limite)
    if (orientation === 'horizontaux') {
        if (emplacement <= limite - bateau.Taille) {
            emplacementValide = emplacement;
        }
        else {
            emplacementValide = limite - (bateau.Taille - 1);
        }
    }
    else {
        if (emplacement <= 100 - 10 * bateau.Taille) {
            emplacementValide = emplacement;
        }
        else {
            emplacementValide = emplacement - 10 * bateau.Taille + 10;
        }
    }
    console.log(emplacementValide);
    var casesBateau = [];
    for (var i = 0; i < bateau.Taille; i++)
        if (orientation === 'horizontaux') {
            console.log(casesJouables[Number(emplacementValide) + i - 1]);
            casesBateau.push(casesJouables[Number(emplacementValide) + i - 1]);
        }
        else {
            casesBateau.push(casesJouables[Number(emplacementValide) + 10 * i - 1]);
        }
    console.log(casesBateau);
    var valide;
    if (orientation === 'horizontaux') {
        casesBateau.every(function (_case, indice) {
            if (emplacement > 90) {
                valide = Number(casesBateau[0].id) % 10 - 1 <= 10 - (casesBateau.length - indice);
            }
            else {
                valide = Number(casesBateau[0].id) % 10 <= 10 - (casesBateau.length - indice);
            }
        });
    }
    else {
        casesBateau.every(function (_case, indice) {
            valide = Number(casesBateau[0].id) < 90 + (10 * indice + 1);
        });
    }
    console.log(valide);
    var libre = casesBateau.every(function (_case) { return !_case.classList.contains("occupee"); });
    console.log(libre);
    if (valide && libre) {
        casesBateau.forEach(function (_case) {
            _case.classList.add("".concat(emplacementValide, "-").concat(bateau.Taille));
            _case.classList.add("bateau");
            _case.classList.add("occupee");
            //_case.classList.remove("eau")
            bateauSelectionne.remove();
        });
        bateauJoueur++;
    }
}
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
function tournerBateaux() {
    var textBoutonTourner = document.querySelector('#orientation');
    textBoutonTourner.innerHTML = (textBoutonTourner === null || textBoutonTourner === void 0 ? void 0 : textBoutonTourner.innerHTML) === "verticaux" ? "horizontaux" : "verticaux";
    var listeBateaux = Array.prototype.slice.call(SELECTEUR_BATEAUX === null || SELECTEUR_BATEAUX === void 0 ? void 0 : SELECTEUR_BATEAUX.children);
    console.log();
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
boutonTourner === null || boutonTourner === void 0 ? void 0 : boutonTourner.addEventListener('click', tournerBateaux);
