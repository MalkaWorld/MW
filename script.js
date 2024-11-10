// Variables globales
let panierItems = JSON.parse(localStorage.getItem('panier')) || [];
let isPanierVisible = false;

// Gestion de l'affichage du panier
function togglePanier() {
    const modal = document.getElementById('panier-modal');
    isPanierVisible = !isPanierVisible;
    modal.style.display = isPanierVisible ? 'block' : 'none';
}

// Ajout d'un produit au panier
function ajouterAuPanier(produit) {
    if (!produit) {
        console.error('Produit invalide');
        return;
    }

    panierItems.push({
        image: produit.image,
        nom: produit.nom,
        description: produit.description,
        prix: parseInt(produit.prix)
    });

    localStorage.setItem('panier', JSON.stringify(panierItems));
    updatePanierAffichage();
    updatePanierCount();
    afficherNotification('Produit ajouté au panier');
}

// Mise à jour du compteur
function updatePanierCount() {
    const countElement = document.querySelector('.panier-count');
    if (countElement) {
        countElement.textContent = panierItems.length;
    }
}

function afficherArticlesPanier() {
    const panierArticles = document.getElementById('panier-articles');
    let montantTotal = 0;
    
    panierArticles.innerHTML = '';
    
    panier.forEach((article, index) => {
        const articleElement = document.createElement('div');
        articleElement.className = 'panier-article';
        articleElement.innerHTML = `
            <img src="${article.image}" alt="${article.nom}">
            <div class="article-details">
                <h4>${article.nom}</h4>
                <p>${article.prix} F. CFA</p>
            </div>
            <button onclick="supprimerDuPanier(${index})" class="btn-supprimer">supprimer cet article</button>
        `;
        panierArticles.appendChild(articleElement);
        montantTotal += parseInt(article.prix);
    });
    
    document.getElementById('panier-montant-total').textContent = montantTotal + ' F. CFA';
}
    
        panierContainer.appendChild(articleElement);
        total += item.prix;
    });

    totalElement.textContent = `${total} F. CFA`;
    updatePanierCount();
}

// Suppression d'un produit
function supprimerDuPanier(index) {
    panier.splice(index, 1);
    localStorage.setItem('panier', JSON.stringify(panier));
    mettreAJourCompteurPanier();
    afficherArticlesPanier(); // Rafraîchit uniquement le contenu du panier
}
}

// Initialisation de FedaPay
async function initializeFedaPay() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        FedaPay.init({
            public_key: config.publicKey,
            environment: config.environment
        });
    } catch (error) {
        console.error('Erreur d\'initialisation FedaPay:', error);
    }
}

// Initier le paiement
function initierPaiement() {
    if (panierItems.length === 0) {
        alert('Votre panier est vide!');
        return;
    }

    const total = panierItems.reduce((sum, item) => sum + item.prix, 0);
    const transactionData = {
        amount: total,
        description: 'Achat MalkaWorld',
        callback_url: 'https://votre-site.com/confirmation',
        custom_data: {
            items: panierItems.map(item => ({
                nom: item.nom,
                prix: item.prix
            }))
        }
    };

    FedaPay.createTransaction(transactionData)
        .then(response => FedaPay.startPayment({ transaction: { id: response.transaction.id } }))
        .then(result => {
            if (result.status === 'success') {
                alert('Paiement effectué avec succès!');
                panierItems = [];
                localStorage.removeItem('panier');
                updatePanierAffichage();
                togglePanier();
            } else {
                alert('Le paiement a échoué. Veuillez réessayer.');
            }
        })
        .catch(error => console.error('Erreur de paiement:', error));
}

// Notification
function afficherNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updatePanierAffichage();
    initializeFedaPay();

    // Gestion du clic en dehors du panier
    document.addEventListener('click', (event) => {
        const panierModal = document.getElementById('panier-modal');
        const panierIcon = document.querySelector('.panier-icon');

        if (panierModal && panierIcon &&
            !panierModal.contains(event.target) &&
            !panierIcon.contains(event.target)) {
            isPanierVisible = false;
            panierModal.style.display = 'none';
        }
    });
});
