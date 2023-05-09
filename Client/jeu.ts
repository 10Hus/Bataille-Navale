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

socketJeu.on("nouveauJoueur", (idAdversaire : number) =>{
	nbJoueur++
	const logJoueur = document.querySelector(`.lj${idAdversaire}`)
	logJoueur?.classList.remove("ncoJoueur")
	logJoueur?.classList.add("coJoueur")
})

socketJeu.on("UIjoueurPret", (idJoueurPret : number) => {
	adversairePret = true
	const logJoueur = document.querySelector(`.lj${idJoueurPret}`)
	logJoueur?.classList.remove("coJoueur")
	logJoueur?.classList.add("rdyJoueur")
})

socketJeu.on("lancementPartie", (premierTour : number) => {
	tour = premierTour
	partieLancee = true
	bateauAdversaire = 17

	const tourPartie = document.querySelector("#joueur")
	tourPartie!.innerHTML = tour === 0 ? "Joueur 1" : "Joueur 2"
	BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)

})

socketJeu.on("actualiserTour", (infoTour : string, gagner : boolean) => {
	tour = (tour + 1)%2
	const infoPartie = document.querySelector("#dernier-coup")
	const tourPartie = document.querySelector("#joueur")

	infoPartie!.innerHTML = infoTour

	if (gagner) {
		tourPartie!.innerHTML = `VICTOIRE de ${tourPartie!.innerHTML}`

		const casesCliquables = document.querySelectorAll(".eau")
		casesCliquables.forEach((td) => {
			if (td.classList.contains("cliquable")) {
				td.removeEventListener('click', tirer)
			}
		})

	} else {
		tourPartie!.innerHTML = tourPartie!.innerHTML === "Joueur 1" ? "Joueur 2" : "Joueur 1"
	}

})





function verifierGagner() {
	console.log(bateauAdversaire, bateauJoueur)
	return !bateauAdversaire
}

function tirer(_case: any) {
	let etat
	if (!partieLancee) return

	const logJoueurId = Number(document.querySelector(".tireJoueur")?.classList[1])
	//gagnant = verifierGagner()
	if (!gagnant && logJoueurId === tour) {
		
		touche = false
		const cible = Number(_case.target.id)

		socketJeu.emit('tireJoueur', tour, cible, function (data : any) {
			touche =  data

			_case.target.classList.remove("cliquable")
			_case.target.removeEventListener('click', tirer)
			
			if (touche) {
				etat = "touché"
				bateauAdversaire--

				// Mise a jour des classes de la case
				_case.target.classList.add("touche-adversaire")
				gagnant = verifierGagner()

			} else {
				etat = "raté"

				_case.target.classList.add("rate-adversaire")
			}

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
		
	} else {
		return
	}


}

function commencerPartie() {
	//console.log(adversairePret)
	const infoPartie = document.querySelector("#dernier-coup")
	infoPartie!.innerHTML = ""
	if (nbJoueur !== 2 || SELECTEUR_BATEAUX!.children.length > 0) {
		infoPartie!.innerHTML = "Vous devez placer tous vos bateaux et attendre que votre adversaire se connecte avant de lancer la partie"

	} else {
		const logJoueurId = Number(document.querySelector(".tireJoueur")?.classList[1]) + 1
		//console.log(logJoueurId)

		socketJeu.emit("joueurPret", logJoueurId)
		if (!adversairePret){
			BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)
			const logJoueur = document.querySelector(`.lj${logJoueurId}`)
			logJoueur?.classList.remove("coJoueur")
			logJoueur?.classList.add("rdyJoueur")
			
			const casesCliquables = document.querySelectorAll("#adversaire td")
			casesCliquables.forEach((td) => {
				if (td.classList.contains("cliquable")) {
					td.addEventListener('click', tirer)
				}
			})
			
			let grille : boolean[] = []

			const casesJoueur = document.querySelectorAll("#joueur td.eau")
			casesJoueur.forEach((td) => {
				if(td.classList.contains("bateau")) {
					grille.push(true)
				} else {
					grille.push(false)
				}
			})
			//console.log(grille)
			socketJeu.emit("grilleJoueur", grille, logJoueurId)
			
		} else {

			const logJoueurId = Number(document.querySelector(".tireJoueur")?.classList[1]) + 1
			
			const logJoueur = document.querySelector(`.lj${logJoueurId}`)
			logJoueur?.classList.remove("coJoueur")
			logJoueur?.classList.add("rdyJoueur")
			/*
			const tourPartie = document.querySelector("#joueur")
			tourPartie!.innerHTML = Math.random() < 0.5 ? "Joueur 1" : "Joueur 2"
			BOUTON_COMMENCER?.removeEventListener('click', commencerPartie)
			*/
			const premierTour = Math.random() < 0.5 ? 0 : 1


			const casesCliquables = document.querySelectorAll("#adversaire td")
			casesCliquables.forEach((td) => {td
				if (td.classList.contains("cliquable")) {
					td.addEventListener('click', tirer)
				}

			})

			let grille : boolean[] = []

			const casesJoueur = document.querySelectorAll("#joueur td.eau")
			casesJoueur.forEach((td) => {
				if(td.classList.contains("bateau")) {
					grille.push(true)
				} else {
					grille.push(false)
				}
			})

			socketJeu.emit("grilleJoueur", grille, logJoueurId)

			socketJeu.emit("joueursPrets", premierTour)	
		}
	}
}

BOUTON_COMMENCER?.addEventListener('click', commencerPartie)

interface BATEAU {
	readonly Taille: number;
}

const divGrilleJeu = document.querySelector('#grille')

function creerGrille(mode: string, nom: string) {
	const grilleJeu = document.createElement('table')
	grilleJeu.style.padding = "0"
	grilleJeu.style.borderSpacing = "5"
	grilleJeu.style.backgroundColor = "#000000"
	grilleJeu.classList.add("grille-jeu")
	grilleJeu.id = mode

	creerEntete(grilleJeu)
	creerLignes(grilleJeu, mode)

	if (mode === "adversaire") {
		grilleJeu.querySelectorAll("td").forEach((td) => {

			if (td.classList.contains("cliquable")) {
				td.onpointerenter = () => {
					td.classList.add("jouable")
				}

				td.onpointerleave = () => {
					td.classList.remove("jouable")
				}
			}
		})
	}



	divGrilleJeu?.append(grilleJeu)

}

function creerEntete(grilleJeu: HTMLTableElement) {

	const entete = document.createElement('tr')
	entete.style.backgroundColor = "#ffffff"

	const celluleVide = document.createElement('th')
	celluleVide.style.width = "25"
	celluleVide.classList.add("case-grille")

	entete.append(celluleVide)

	for (let i = 0; i < 10; i++) {
		let enteteCellule = document.createElement('th')
		enteteCellule.style.verticalAlign = "center"
		enteteCellule.style.alignContent = "center"
		enteteCellule.classList.add("case-grille")
		enteteCellule.append(`${String.fromCharCode(65 + i)}`)
		entete.append(enteteCellule)
	}

	grilleJeu.append(entete)
}

function creerLignes(grilleJeu: HTMLTableElement, mode: string) {

	for (let i = 0; i < 10; i++) {
		const ligne = document.createElement('tr')
		ligne.style.backgroundColor = "#ffffff"

		const numeroCellule = document.createElement('td')
		numeroCellule.style.textAlign = "center"
		numeroCellule.style.verticalAlign = "middle"
		numeroCellule.classList.add('case-grille')
		numeroCellule.append(`${i + 1}`)
		ligne.append(numeroCellule)

		for (let j = 0; j < 10; j++) {
			const cellule = document.createElement('td')
			cellule.classList.add("case-grille")
			cellule.classList.add("eau")
			if (mode === 'adversaire') {
				cellule.classList.add('cliquable')
			}
			cellule.id = `${10 * i + j}`

			ligne.append(cellule)
		}

		grilleJeu.append(ligne)
	}
}

creerGrille("joueur", nomJoueur)
creerGrille("adversaire", "En attente...")


const porteAvions: BATEAU = { Taille: 5 };
const croiseur: BATEAU = { Taille: 4 };
const contreTorpilleur1: BATEAU = { Taille: 3 };
const contreTorpilleur2: BATEAU = { Taille: 3 };
const torpilleur: BATEAU = { Taille: 2 };

const BATEAUX = [porteAvions, croiseur, contreTorpilleur1, contreTorpilleur2, torpilleur]


let bateauSelectionne: any

function placerBateau(bateau: BATEAU, emplacement: number) {
	const casesJouables = document.querySelectorAll('#joueur td.eau')
	const orientation = SELECTEUR_BATEAUX?.getAttribute("id")
	//console.log(emplacement)
	let emplacementValide: any
	//let limite = Math.ceil(emplacement / 10) * 10
	//console.log(limite)

	if (orientation === 'horizontaux') {
		if (Math.floor((Number(emplacement) + bateau.Taille - 1)/10) == Math.floor(emplacement/10)) {
			emplacementValide = emplacement
		} else {
			emplacementValide = Math.ceil(emplacement/10)*10-bateau.Taille
		}
	} else {
		if ((Number(emplacement)/10 + bateau.Taille - 1) < 10) {
			emplacementValide = emplacement
		} else {
			emplacementValide = Number(emplacement) - 10*(bateau.Taille - 1)
		}
	}


	//console.log(emplacementValide)

	let casesBateau: Element[] = []

	for (let i = 0; i < bateau.Taille; i++)
		if (orientation === 'horizontaux') {
			casesBateau.push(casesJouables[Number(emplacementValide) + i ])
		} else {
			casesBateau.push(casesJouables[Number(emplacementValide) + 10*i])
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
	const libre = casesBateau.every(_case => !_case.classList.contains("occupee"))

	//console.log(libre)

	if (libre) {
		casesBateau.forEach(_case => {
			_case.classList.add(`${emplacementValide}-${bateau.Taille}`)
			_case.classList.add("bateau")
			_case.classList.add("occupee")
			//_case.classList.remove("eau")
			bateauSelectionne.remove()
		})
		bateauJoueur++
	}
}


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

function tournerBateaux() {

	const textBoutonTourner = document.querySelector('#orientation')
	textBoutonTourner!.innerHTML = textBoutonTourner?.innerHTML === "verticaux" ? "horizontaux" : "verticaux"

	const listeBateaux = Array.prototype.slice.call(SELECTEUR_BATEAUX?.children);
	//console.log()


	if (SELECTEUR_BATEAUX?.getAttribute("id") === "horizontaux") {
		listeBateaux.forEach(listeBateaux => {
			listeBateaux.style.transform = 'rotate(90deg)';
		})
		SELECTEUR_BATEAUX?.setAttribute("id", "verticaux")
	} else {
		listeBateaux.forEach(listeBateaux => {
			listeBateaux.style.transform = "";
		})
		SELECTEUR_BATEAUX?.setAttribute("id", "horizontaux")
	}


}

boutonTourner?.addEventListener('click', tournerBateaux)



