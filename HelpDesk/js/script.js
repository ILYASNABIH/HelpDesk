// Étape 3: Données initiales
let demandes = [
    {
        id: "HD-001",
        numericId: 1,
        titre: "Connexion Wi-Fi instable",
        description: "Le réseau se déconnecte régulièrement.",
        categorie: "Réseau",
        priorite: "Haute"
    },
    {
        id: "HD-002",
        numericId: 2,
        titre: "Installation d'un logiciel",
        description: "Installer un logiciel sur le poste.",
        categorie: "Logiciel",
        priorite: "Normale"
    },
    {
        id: "HD-003",
        numericId: 3,
        titre: "Clavier défectueux",
        description: "Certaines touches ne fonctionnent plus.",
        categorie: "Matériel",
        priorite: "Basse"
    }
];

let prochainId = 4;
// Variable pour savoir si on est en train de modifier une demande (contient l'ID ou null)
let ticketEnCoursEditionId = null; 

// Sélection des éléments HTML
const cartesConteneur = document.getElementById("cartes-conteneur");
const ticketCompteur = document.getElementById("ticket-compteur");
const ticketForm = document.getElementById("ticket-form");
const formMessage = document.getElementById("form-message");
const submitBtn = ticketForm.querySelector("button[type='submit']");

// Fonction pour déterminer la classe CSS de priorité
function getPriorityClass(priorite) {
    switch (priorite.toLowerCase()) {
        case "haute": return "badge-priorite-haute";
        case "normale": return "badge-priorite-normale";
        case "basse": return "badge-priorite-basse";
        default: return "";
    }
}

// Fonction pour obtenir l'icône de la catégorie
function getCategoryIcon(categorie) {
    switch (categorie.toLowerCase()) {
        case "réseau": return "⚡";
        case "logiciel": return "🔲";
        case "matériel": return "⌨️";
        default: return "📌";
    }
}

// Étape 4: Afficher les cartes dans le conteneur avec .append()
function afficherDemandes() {
    // Vider le conteneur
    cartesConteneur.textContent = "";

    // Mettre à jour le compteur
    ticketCompteur.textContent = `${demandes.length} demande${demandes.length > 1 ? "s" : ""}`;

    // Cas où la liste est vide
    if (demandes.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-state";
        emptyDiv.textContent = "Aucune demande d'assistance pour le moment.";
        cartesConteneur.append(emptyDiv);
        return;
    }

    // Parcourir le tableau de demandes
    demandes.forEach(demande => {
        const card = document.createElement("article");
        card.className = "ticket-card";

        // Inscription du bouton "Modifier" dans le footer
        card.innerHTML = `
            <div>
                <div class="card-top">
                    <div class="card-icon">${getCategoryIcon(demande.categorie)}</div>
                    <span class="card-id">${demande.id}</span>
                </div>
                <h3 class="card-title"></h3>
                <p class="card-desc"></p>
                <div class="card-badges">
                    <span class="badge badge-cat">${demande.categorie}</span>
                    <span class="badge ${getPriorityClass(demande.priorite)}">${demande.priorite}</span>
                </div>
            </div>
            <div class="card-footer">
                <button type="button" class="btn-edit" data-id="${demande.numericId}">✏️ Modifier</button>
                <button type="button" class="btn-delete" data-id="${demande.numericId}">🗑 Supprimer</button>
            </div>
        `;

        // Sécuriser l'affichage du texte (anti-XSS)
        card.querySelector(".card-title").textContent = demande.titre;
        card.querySelector(".card-desc").textContent = demande.description;

        // Événement pour charger la demande dans le formulaire lors du clic sur Modifier
        const btnEdit = card.querySelector(".btn-edit");
        btnEdit.addEventListener("click", () => chargerDemandeDansFormulaire(demande.numericId));

        // Étape 6: Événement de suppression sur le bouton
        const btnDelete = card.querySelector(".btn-delete");
        btnDelete.addEventListener("click", () => supprimerDemande(demande.numericId));

        // Utilisation de .append() au lieu de .appendChild()
        cartesConteneur.append(card);
    });
}

// Fonction pour charger la demande sélectionnée dans le formulaire
function chargerDemandeDansFormulaire(numericId) {
    const ticket = demandes.find(d => d.numericId === numericId);
    if (!ticket) return;

    // Remplir les champs
    document.getElementById("titre").value = ticket.titre;
    document.getElementById("categorie").value = ticket.categorie;
    document.getElementById("priorite").value = ticket.priorite;
    document.getElementById("description").value = ticket.description;

    // Activer le mode édition
    ticketEnCoursEditionId = numericId;
    submitBtn.textContent = "✏️ Enregistrer les modifications";

    // Remonter doucement vers le formulaire
    ticketForm.scrollIntoView({ behavior: "smooth" });
}

// Étape 5: Ajouter ou Modifier une demande
ticketForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const titreInput = document.getElementById("titre").value.trim();
    const categorieInput = document.getElementById("categorie").value;
    const prioriteInput = document.getElementById("priorite").value;
    const descriptionInput = document.getElementById("description").value.trim();

    // Réinitialiser le message
    formMessage.className = "form-message";
    formMessage.textContent = "";

    // Validation
    if (!titreInput || !categorieInput || !prioriteInput || !descriptionInput) {
        formMessage.textContent = "Veuillez remplir tous les champs obligatoires (*).";
        formMessage.classList.add("error");
        return;
    }

    if (ticketEnCoursEditionId !== null) {
        // --- MODE MODIFICATION ---
        const index = demandes.findIndex(d => d.numericId === ticketEnCoursEditionId);
        if (index !== -1) {
            demandes[index].titre = titreInput;
            demandes[index].categorie = categorieInput;
            demandes[index].priorite = prioriteInput;
            demandes[index].description = descriptionInput;
        }

        formMessage.textContent = "La demande a été modifiée avec succès !";
        ticketEnCoursEditionId = null;
        submitBtn.textContent = "＋ Ajouter la demande";
    } else {
        // --- MODE AJOUT ---
        const nouvelleDemande = {
            id: `HD-${String(prochainId).padStart(3, "0")}`,
            numericId: prochainId,
            titre: titreInput,
            description: descriptionInput,
            categorie: categorieInput,
            priorite: prioriteInput
        };

        prochainId++;
        demandes.push(nouvelleDemande);
        formMessage.textContent = "La demande a été ajoutée avec succès !";
    }

    // Actualiser l'affichage et réinitialiser le formulaire
    afficherDemandes();
    ticketForm.reset();

    // Message de confirmation
    formMessage.classList.add("success");

    setTimeout(() => {
        formMessage.className = "form-message";
    }, 3000);
});

// Étape 6: Supprimer une demande
function supprimerDemande(numericId) {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?");
    if (!confirmation) return;

    // Si la demande en cours de suppression était affichée dans le formulaire, on réinitialise le formulaire
    if (ticketEnCoursEditionId === numericId) {
        ticketEnCoursEditionId = null;
        submitBtn.textContent = "＋ Ajouter la demande";
        ticketForm.reset();
    }

    // Filtrer le tableau
    demandes = demandes.filter(d => d.numericId !== numericId);

    // Mettre à jour l'affichage
    afficherDemandes();
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", afficherDemandes);