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
socketJeu.on("nouveauJoueur", function (idAdversaire) {
    nbJoueur++;
    var logJoueur = document.querySelector(".lj".concat(idAdversaire));
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("ncoJoueur");
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("coJoueur");
});
socketJeu.on("UIjoueurPret", function (idJoueurPret) {
    adversairePret = true;
    var logJoueur = document.querySelector(".lj".concat(idJoueurPret));
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("coJoueur");
    logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("rdyJoueur");
});
socketJeu.on("lancementPartie", function (premierTour) {
    tour = premierTour;
    partieLancee = true;
    bateauAdversaire = 17;
    var tourPartie = document.querySelector("#joueur");
    tourPartie.innerHTML = tour === 0 ? "Joueur 1" : "Joueur 2";
    BOUTON_COMMENCER === null || BOUTON_COMMENCER === void 0 ? void 0 : BOUTON_COMMENCER.removeEventListener('click', commencerPartie);
});
socketJeu.on("actualiserTour", function (infoTour, gagner) {
    tour = (tour + 1) % 2;
    var infoPartie = document.querySelector("#dernier-coup");
    var tourPartie = document.querySelector("#joueur");
    infoPartie.innerHTML = infoTour;
    if (gagner) {
        tourPartie.innerHTML = "VICTOIRE de ".concat(tourPartie.innerHTML);
        var casesCliquables = document.querySelectorAll(".eau");
        casesCliquables.forEach(function (td) {
            if (td.classList.contains("cliquable")) {
                td.removeEventListener('click', tirer);
            }
        });
    }
    else {
        tourPartie.innerHTML = tourPartie.innerHTML === "Joueur 1" ? "Joueur 2" : "Joueur 1";
    }
});
function verifierGagner() {
    console.log(bateauAdversaire, bateauJoueur);
    return !bateauAdversaire;
}
function tirer(_case) {
    var _a;
    var etat;
    if (!partieLancee)
        return;
    var logJoueurId = Number((_a = document.querySelector(".tireJoueur")) === null || _a === void 0 ? void 0 : _a.classList[1]);
    //gagnant = verifierGagner()
    if (!gagnant && logJoueurId === tour) {
        touche = false;
        var cible = Number(_case.target.id);
        socketJeu.emit('tireJoueur', tour, cible, function (data) {
            touche = data;
            _case.target.classList.remove("cliquable");
            _case.target.removeEventListener('click', tirer);
            if (touche) {
                etat = "touché";
                bateauAdversaire--;
                // Mise a jour des classes de la case
                _case.target.classList.add("touche-adversaire");
                gagnant = verifierGagner();
            }
            else {
                etat = "raté";
                _case.target.classList.add("rate-adversaire");
            }
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
function commencerPartie() {
    var _a, _b;
    //console.log(adversairePret)
    var infoPartie = document.querySelector("#dernier-coup");
    infoPartie.innerHTML = "";
    if (nbJoueur !== 2 || SELECTEUR_BATEAUX.children.length > 0) {
        infoPartie.innerHTML = "Vous devez placer tous vos bateaux et attendre que votre adversaire se connecte avant de lancer la partie";
    }
    else {
        var logJoueurId = Number((_a = document.querySelector(".tireJoueur")) === null || _a === void 0 ? void 0 : _a.classList[1]) + 1;
        //console.log(logJoueurId)
        socketJeu.emit("joueurPret", logJoueurId);
        if (!adversairePret) {
            BOUTON_COMMENCER === null || BOUTON_COMMENCER === void 0 ? void 0 : BOUTON_COMMENCER.removeEventListener('click', commencerPartie);
            var logJoueur = document.querySelector(".lj".concat(logJoueurId));
            logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("coJoueur");
            logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("rdyJoueur");
            var casesCliquables = document.querySelectorAll("#adversaire td");
            casesCliquables.forEach(function (td) {
                if (td.classList.contains("cliquable")) {
                    td.addEventListener('click', tirer);
                }
            });
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
            //console.log(grille)
            socketJeu.emit("grilleJoueur", grille_1, logJoueurId);
        }
        else {
            var logJoueurId_1 = Number((_b = document.querySelector(".tireJoueur")) === null || _b === void 0 ? void 0 : _b.classList[1]) + 1;
            var logJoueur = document.querySelector(".lj".concat(logJoueurId_1));
            logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.remove("coJoueur");
            logJoueur === null || logJoueur === void 0 ? void 0 : logJoueur.classList.add("rdyJoueur");
            /*
            const tourPartie = document.querySelector("#joueur")
            tourPartie!.innerHTML = Math.random() < 0.5 ? "Joueur 1" : "Joueur 2"
            BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)
            */
            var premierTour = Math.random() < 0.5 ? 0 : 1;
            var casesCliquables = document.querySelectorAll("#adversaire td");
            casesCliquables.forEach(function (td) {
                td;
                if (td.classList.contains("cliquable")) {
                    td.addEventListener('click', tirer);
                }
            });
            var grille_2 = [];
            var casesJoueur = document.querySelectorAll("#joueur td.eau");
            casesJoueur.forEach(function (td) {
                if (td.classList.contains("bateau")) {
                    grille_2.push(true);
                }
                else {
                    grille_2.push(false);
                }
            });
            socketJeu.emit("grilleJoueur", grille_2, logJoueurId_1);
            socketJeu.emit("joueursPrets", premierTour);
        }
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
            cellule.id = "".concat(10 * i + j);
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
    //console.log(emplacement)
    var emplacementValide;
    //let limite = Math.ceil(emplacement / 10) * 10
    //console.log(limite)
    if (orientation === 'horizontaux') {
        if (Math.floor((Number(emplacement) + bateau.Taille - 1) / 10) == Math.floor(emplacement / 10)) {
            emplacementValide = emplacement;
        }
        else {
            emplacementValide = Math.ceil(emplacement / 10) * 10 - bateau.Taille;
        }
    }
    else {
        if ((Number(emplacement) / 10 + bateau.Taille - 1) < 10) {
            emplacementValide = emplacement;
        }
        else {
            emplacementValide = Number(emplacement) - 10 * (bateau.Taille - 1);
        }
    }
    //console.log(emplacementValide)
    var casesBateau = [];
    for (var i = 0; i < bateau.Taille; i++)
        if (orientation === 'horizontaux') {
            casesBateau.push(casesJouables[Number(emplacementValide) + i]);
        }
        else {
            casesBateau.push(casesJouables[Number(emplacementValide) + 10 * i]);
        }
    //console.log(casesBateau)
    /*
    let valide

    if (orientation === 'horizontaux') {
        casesBateau.every((_case, indice) => {
            if (emplacement > 90) {
                valide = Number(casesBateau[0].id) % 10 - 1 <= 10 - (casesBateau.length - indice)
            } else {
                valide = Number(casesBateau[0].id) % 10 <= 10 - (casesBateau.length - indice)
            }

        })
    } else {
        casesBateau.every((_case, indice) => {
            valide = Number(casesBateau[0].id) < 90 + (10 * indice + 1)
        })
    }

    console.log(valide)
    */
    var libre = casesBateau.every(function (_case) { return !_case.classList.contains("occupee"); });
    //console.log(libre)
    if (libre) {
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
    //console.log()
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
