////////////////////
//   CONSTANTES   //
////////////////////

// Identifiant de connexion arbitraire (exporter pour jeu.ts)
const PERSONNE = 42;

// Sélectionne le premier élément de la page HTML qui a un identifiant "info-serveur"
const INFO_SERVEUR = document.querySelector("#info-serveur")

////////////////////////////////////////////////////////////////////////////

// Sélectionne le premier élément de la page HTML qui a une classe "bateaux"
const SELECTEUR_BATEAUX = document.querySelector('.bateaux')

// Sélectionne le premier élément de la page HTML qui a un identifiant "jouer"
const BOUTON_COMMENCER = document.querySelector('#jouer')

///////////////////
//   VARIABLES   //
///////////////////

// Création d'un "identifiantJoueurConnecte" le temps qu'une connexion arrive
let identifiantJoueurConnecte = PERSONNE

// Nom du joueur
let nomJoueur = "";

// Rôle du joueur
let roleJoueur = "";

// Nombre de joueurs connectes
let nbJoueur = 0;

////////////////////////////////////////////////////////////////////////////

// Indiquer s'il y a gagnant
let gagnant = false

// ??? Nombre de bateau du joueur courant
let bateauJoueur: number

// ??? Nombre de bateau de l'adversaire
let bateauAdversaire: number

// État du joueur
let joueurPret = false // Pas utilisee

// État de l'adversaire
let adversairePret = false

// supercherie
let partieLancee = false
let tour : number
let touche = false



////////////////
//   Client   //
////////////////

// Connexion du client au serveur avec Socket.io
const socketJeu = io();





///////////////////
//   Événement   //
///////////////////

// Écoute de l'événement 'identifiantJoueur' émis par le serveur
socketJeu.on('idJoueur', (idJoueur: number) => {
	console.log(`Debug : Évènement "identifiantJoueur" reçu !`);
	console.log(`Debug : idJoueur vaut : ` + idJoueur);

	// Si trop de joueurs sont connectés
	if (idJoueur === PERSONNE) {
		
		// Mise à jour de INFO_SERVEUR dans la page HTML
		INFO_SERVEUR!.innerHTML = "Trop de joueurs sont connectés !"
	
	// S'il y a moins de 3 joueurs connectés
	} else {
		// Récupération de l'identifiant du joueur qui vient de se connecter
		identifiantJoueurConnecte = Number(idJoueur)
		socketJeu.emit("connectionJoueur", identifiantJoueurConnecte)
		//console.log(identifiantJoueurConnecte)

		// Sauvegarde de l'id du joueur dans le code html de la page (pas mieux atm)
		const divIdJoueur = document.querySelector('.idJoueur')
		divIdJoueur?.classList.add(`${identifiantJoueurConnecte}`)
		divIdJoueur?.classList.remove('idJoueur')

		// Si c'est le Joueur 1
		if (identifiantJoueurConnecte === 0) {
			nbJoueur = 1
			document.title = "Joueur 1 | Pourquoi Paul ?"
			// Nom du joueur
			nomJoueur = "Joueur 1"

			// Rôle du joueur
			roleJoueur = "joueur"

			// Actualisation de l'interface de connection
			const logJoueur = document.querySelector(`.lj${identifiantJoueurConnecte+1}`)
			logJoueur?.classList.remove("ncoJoueur")
			logJoueur?.classList.add("coJoueur")

			

		// Si c'est le Joueur 2
		} else if (identifiantJoueurConnecte === 1) {
			nbJoueur = 2
			document.title = "Joueur 2 | Pourquoi Paul ?"
			// Nom du joueur
			nomJoueur = "Joueur 2"

			// Rôle du joueur
			roleJoueur = "adversaire"

			// Actualisation de l'interface de connection
			const logJoueur1 = document.querySelector(`.lj${identifiantJoueurConnecte}`)
			logJoueur1?.classList.remove("ncoJoueur")
			logJoueur1?.classList.add("coJoueur")

			const logJoueur2 = document.querySelector(`.lj${identifiantJoueurConnecte+1}`)
			logJoueur2?.classList.remove("ncoJoueur")
			logJoueur2?.classList.add("coJoueur")
		
		// Si c'est le Joueur X
		} else {

			console.log(`Erreur : identifiant du joueur connecté inconnu !`);

			// On s'arrête
			return
		}
	}
})

// Lorsqu'un nouveau joueur se connecte, on met à jour son statut dans la liste des joueurs
socketJeu.on("nouveauJoueur", (idAdversaire : number) =>{
	nbJoueur++
	const logJoueur = document.querySelector(`.lj${idAdversaire}`)
	logJoueur?.classList.remove("ncoJoueur")
	logJoueur?.classList.add("coJoueur")
})

// Lorsqu'un joueur est prêt, on met à jour son statut dans la liste des joueurs
socketJeu.on("UIjoueurPret", (idJoueurPret : number) => {
	adversairePret = true
	const logJoueur = document.querySelector(`.lj${idJoueurPret}`)
	logJoueur?.classList.remove("coJoueur")
	logJoueur?.classList.add("rdyJoueur")
})

// Lorsque la partie est lancée, on met à jour le tour, on marque le début de la partie et on retire la possibilité de lancer la partie
socketJeu.on("lancementPartie", (premierTour : number) => {
	tour = premierTour
	partieLancee = true
	bateauAdversaire = 17

	// Mis à jour du joueur actuel
	const tourPartie = document.querySelector("#joueur")
	tourPartie!.innerHTML = tour === 0 ? "Joueur 1" : "Joueur 2"
	// Retire la possibilité de lancer la partie en cliquant sur le bouton
	BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)
})

// Mise à jour du tour
socketJeu.on("actualiserTour", (infoTour : string, gagner : boolean) => {

	// Changement du tour 
	tour = (tour + 1)%2

	// On récupère les éléments HTML nécessaires pour la mise à jour de la page
	const infoPartie = document.querySelector("#dernier-coup")
	const tourPartie = document.querySelector("#joueur")

	// Mise à jour de l'affichage 
	infoPartie!.innerHTML = infoTour

	// Si il y a un gagant
	if (gagner) {

		// On affiche un message de victoire
		tourPartie!.innerHTML = `VICTOIRE de ${tourPartie!.innerHTML}`

		// On désactive les cases cliquables
		const casesCliquables = document.querySelectorAll(".eau")
		casesCliquables.forEach((td) => {
			if (td.classList.contains("cliquable")) {
				td.removeEventListener('click', tirer)
			}
		})

	}
	// Si il n'y a pas de gagnant 
	else {
		// On met à jour le tour affiché 
		tourPartie!.innerHTML = tourPartie!.innerHTML === "Joueur 1" ? "Joueur 2" : "Joueur 1"
	}

})

socketJeu.on("tireAdverse", (cible : number)  => {
	const caseCiblee = document.querySelectorAll(`#joueur td.eau`)

	caseCiblee.forEach((td) => {
		if (td.id === String(cible)){
			if (td?.classList.contains('occupee')){
				td.classList.add("touche-joueur")
			} else {
				td?.classList.add("rate-joueur")
		}

		}
	})

})

// Fonction pour vérifier si il y a un gagant ou non
function verifierGagner() {
	return !bateauAdversaire
}

// Fonction appelée à chaque tir
function tirer(_case: any) {
	let etat
	// Si la partie n'est pas encore lancée, la fonction ne fait rien
	if (!partieLancee){
		return
	}

	// On récupère l'identifiant du joueur qui vient tirer
	const logJoueurId = Number(document.querySelector(".tireJoueur")?.classList[1])

	// Si un joueur a gagné, on ne fait plus rien
	if (!gagnant && logJoueurId === tour) {
		
		touche = false

		// On récupère l'identifiant de la case ciblée
		const cible = Number(_case.target.id)

		// On envoie un événement au serveur pour lui indiquer que le joueur a tiré sur la case
		socketJeu.emit('tireJoueur', tour, cible, function (data : any) {
			touche =  data

			// On désactive la case sur laquelle le joueur a cliqué
			_case.target.classList.remove("cliquable")
			_case.target.removeEventListener('click', tirer)
			
			// Si le joueur a touché un bateau
			if (touche) {
				etat = "touché"
				bateauAdversaire--

				// Mise a jour des classes de la case
				_case.target.classList.add("touche-adversaire")
				gagnant = verifierGagner()

			} 
			// Si le joueur n'a pas touché un bateau
			else {
				etat = "raté"

				// Mise a jour des classes de la case
				_case.target.classList.add("rate-adversaire")
			}

			// Mis à jour de l'affichage 
			const tourPartie = document.querySelector("#joueur")
			const correspondance = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1',
                                    'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2',
                                    'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3', 'J3',
                                    'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4',
                                    'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5',
                                    'A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6', 'J6',
                                    'A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7', 'J7',
                                    'A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8', 'J8',
                                    'A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9', 'J9',
                                    'A10', 'B10', 'C10', 'D10', 'E10', 'F10', 'G10', 'H10', 'I10', 'J10',]

			socketJeu.emit("tourSuivant", `${tourPartie?.innerHTML} a ${etat} ${correspondance[Number(_case.target.id)]}`, gagnant )

		})
	} 
	else {
		return
	}
}

// Fonction appelée au début de la partie
function commencerPartie() {
	console.log("aa")
	const infoPartie = document.querySelector("#dernier-coup")
	infoPartie!.innerHTML = ""

	// On vérifie qu'il y ait 2 joueurs et que celui qui clique à poser tous ses baetaux 
	if (nbJoueur !== 2 || SELECTEUR_BATEAUX!.children.length > 0) {
		infoPartie!.innerHTML = "Vous devez placer tous vos bateaux et attendre que votre adversaire se connecte avant de lancer la partie"
	} 
	else {

		// On récuper l'ID du joueur actuel, et on signal qu'il est prêt
		const logJoueurId = Number(document.querySelector(".tireJoueur")?.classList[1]) + 1
		socketJeu.emit("joueurPret", logJoueurId)

		// On enlève le fait de pouvoir cliquer sur le bouton
		//BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)

		// On change son état en prêt
		const logJoueur = document.querySelector(`.lj${logJoueurId}`)
		logJoueur?.classList.remove("coJoueur")
		logJoueur?.classList.add("rdyJoueur")

		// On met tous les cas en cliquable 
		const casesCliquables = document.querySelectorAll("#adversaire td")
		casesCliquables.forEach((td) => {
			if (td.classList.contains("cliquable")) {
				td.addEventListener('click', tirer)
			}
		})

		// On envoie la grille du joueur au serveur
		let grille : boolean[] = []
		const casesJoueur = document.querySelectorAll("#joueur td.eau")
		casesJoueur.forEach((td) => {
			if(td.classList.contains("bateau")) {
				grille.push(true)
			} 
			else {
				grille.push(false)
			}
		})
		socketJeu.emit("grilleJoueur", grille, logJoueurId)

		// On vérifie si l'adversaire est prêt également, on le signale au serveur
		if (adversairePret){
			const premierTour = Math.random() < 0.5 ? 0 : 1
			socketJeu.emit("joueursPrets", premierTour)	
		}
	}
}
// On lie le bouton et la fonction 
BOUTON_COMMENCER?.addEventListener('click', commencerPartie)

interface BATEAU {
	readonly Taille: number;
}

const divGrilleJeu = document.querySelector('#grille')

// Création de la grille
function creerGrille(mode: string, nom: string) {
	// Cration de l'éléement
	const grilleJeu = document.createElement('table')

	// Style de la grille
	grilleJeu.style.padding = "0"
	grilleJeu.style.borderSpacing = "5"
	grilleJeu.style.backgroundColor = "#000000"
	grilleJeu.classList.add("grille-jeu")
	grilleJeu.id = mode

	// Ajoue de l'entete et des lignes
	creerEntete(grilleJeu)
	creerLignes(grilleJeu, mode)

	// Si la grille est celle de l'adversaire on ajoute des événements  
	if (mode === "adversaire") {
		grilleJeu.querySelectorAll("td").forEach((td) => {

			if (td.classList.contains("cliquable")) {
				// Ajouter la classe "jouable" quand le curseur entre dans la case
				td.onpointerenter = () => {
					td.classList.add("jouable")
				}

				// Enlève la classe "jouable" quand le curseur quitte dans la case
				td.onpointerleave = () => {
					td.classList.remove("jouable")
				}
			}
		})
	}

	// Ajout de la grille au divGrilleJeu si il existe 
	divGrilleJeu?.append(grilleJeu)
}

// Fonction pour faire l'entete d'une grille
function creerEntete(grilleJeu: HTMLTableElement) {

	// Création d'une ligne pour l'entete
	const entete = document.createElement('tr')
	entete.style.backgroundColor = "#ffffff"

	// Création d'une case vide en haut à gauche
	const celluleVide = document.createElement('th')
	celluleVide.style.width = "25"
	celluleVide.classList.add("case-grille")
	entete.append(celluleVide)

	// Ajout des lettres A à J dans l'entete
	for (let i = 0; i < 10; i++) {
		let enteteCellule = document.createElement('th')
		enteteCellule.style.verticalAlign = "center"
		enteteCellule.style.alignContent = "center"
		enteteCellule.classList.add("case-grille")
		enteteCellule.append(`${String.fromCharCode(65 + i)}`)
		entete.append(enteteCellule)
	}

	// Ajout de l'entête à la grille de jeu
	grilleJeu.append(entete)
}

// Fonction pour faire les lignes de la grille
function creerLignes(grilleJeu: HTMLTableElement, mode: string) {

	// Pour chaque ligne de la grille
	for (let i = 0; i < 10; i++) {
		const ligne = document.createElement('tr')
		ligne.style.backgroundColor = "#ffffff"

		// Création de la première cellule qui comporte uniquement le numéro de la ligne
		const numeroCellule = document.createElement('td')
		numeroCellule.style.textAlign = "center"
		numeroCellule.style.verticalAlign = "middle"
		numeroCellule.classList.add('case-grille')
		numeroCellule.append(`${i + 1}`)
		ligne.append(numeroCellule)

		// Pour chaque cellule de la grille
		for (let j = 0; j < 10; j++) {
			// On crée une cellule qu'on rempli d'eau 
			const cellule = document.createElement('td')
			cellule.classList.add("case-grille")
			cellule.classList.add("eau")

			// On la rend cliquable si c'est l'adversaire
			if (mode === 'adversaire') {
				cellule.classList.add('cliquable')
			}

			// On donne à chaque cellule un id allant de 0 à 99
			cellule.id = `${10 * i + j}`

			// On ajoute la cellule à la ligne
			ligne.append(cellule)
		}

		// On ajoute la ligne à la grille
		grilleJeu.append(ligne)
	}
}

// On crée les grilles du joueur et de l'adevrsaire 
creerGrille("joueur", nomJoueur)
creerGrille("adversaire", "En attente...")

// Création des bateaux avec leurs tailles 
const porteAvions: BATEAU = { Taille: 5 };
const croiseur: BATEAU = { Taille: 4 };
const contreTorpilleur1: BATEAU = { Taille: 3 };
const contreTorpilleur2: BATEAU = { Taille: 3 };
const torpilleur: BATEAU = { Taille: 2 };

const BATEAUX = [porteAvions, croiseur, contreTorpilleur1, contreTorpilleur2, torpilleur]


let bateauSelectionne: any

// Fonction appelée pour poser les bateaux
function placerBateau(bateau: BATEAU, emplacement: number) {

	// On récupère les cases jouables
	const casesJouables = document.querySelectorAll('#joueur td.eau')

	// On récupére l'orientation actuelle
	const orientation = SELECTEUR_BATEAUX?.getAttribute("id")
	let emplacementValide: any

	// Si on est à l'horizontal
	if (orientation === 'horizontaux') {
		// On vérife si il y a la place pour le mettre
		if (Math.floor((Number(emplacement) + bateau.Taille - 1)/10) == Math.floor(emplacement/10)) {
			emplacementValide = emplacement
		} 
		// Si ce n'est pas le cas, on le met là où il y a de la place
		else {
			emplacementValide = Math.ceil(emplacement/10)*10-bateau.Taille
		}
	} 
	// Si on est à la verticale
	else {
		// On vérife si il y a la place pour le mettre
		if ((Number(emplacement)/10 + bateau.Taille - 1) < 10) {
			emplacementValide = emplacement
		} 
		// Si ce n'est pas le cas, on le met là où il y a de la place
		else {
			emplacementValide = Number(emplacement) - 10*(bateau.Taille - 1)
		}
	}

	let casesBateau: Element[] = []

	// On note toutes les cases occupées par le bateau
	for (let i = 0; i < bateau.Taille; i++){
		if (orientation === 'horizontaux') {
			casesBateau.push(casesJouables[Number(emplacementValide) + i ])
		} 
		else {
			casesBateau.push(casesJouables[Number(emplacementValide) + 10*i])
		}
	}
	const libre = casesBateau.every(_case => !_case.classList.contains("occupee"))

	// On met à jour la grille et on retire le bateau de la liste 
	if (libre) {
		casesBateau.forEach(_case => {
			_case.classList.add(`${emplacementValide}-${bateau.Taille}`)
			_case.classList.add("bateau")
			_case.classList.add("occupee")
			bateauSelectionne.remove()
		})
		bateauJoueur++
	}
}

// Ajoute un evenement quand on attrape un bateau pour le poser 
const placementBateaux = Array.prototype.slice.call(SELECTEUR_BATEAUX?.children)
placementBateaux.forEach(placementBateau => {
	placementBateau.addEventListener("dragstart", selectionnerBateau)
})

function selectionnerBateau(bateau: any) {
	bateauSelectionne = bateau.target
}

const casesJouables = document.querySelectorAll('#joueur td.eau')

casesJouables.forEach(casejouable => {
	casejouable.addEventListener('dragover', placement)
	casejouable.addEventListener('drop', placer)
})

function placement(bateau: any) {
	bateau.preventDefault()
}

function placer(bateau: any) {
	const emplacement = bateau.target.id
	const bateauId = BATEAUX[Number(bateauSelectionne.id)]
	placerBateau(bateauId, emplacement)
}

const boutonTourner = document.querySelector('#tourner')

// Fonction pour changer l'orientation des bateaux
function tournerBateaux() {

	// On récupère l'orirentation actuelle, et on la même à jour
	const textBoutonTourner = document.querySelector('#orientation')
	textBoutonTourner!.innerHTML = textBoutonTourner?.innerHTML === "verticaux" ? "horizontaux" : "verticaux"

	const listeBateaux = Array.prototype.slice.call(SELECTEUR_BATEAUX?.children);

	// On met à jour chaque bateau
	if (SELECTEUR_BATEAUX?.getAttribute("id") === "horizontaux") {
		listeBateaux.forEach(listeBateaux => {
			listeBateaux.style.transform = 'rotate(90deg)';
		})
		SELECTEUR_BATEAUX?.setAttribute("id", "verticaux")
	} 
	else {
		listeBateaux.forEach(listeBateaux => {
			listeBateaux.style.transform = "";
		})
		SELECTEUR_BATEAUX?.setAttribute("id", "horizontaux")
	}
}

// On lie la fonction et le bouton
boutonTourner?.addEventListener('click', tournerBateaux)



