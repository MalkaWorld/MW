let panier = [];

function togglePanier() {
    const modal = document.getElementById('panier-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function ajouterAuPanier(produit) {
    panier.push(produit);
    mettreAJourPanier();
    mettreAJourCompteur();
}

function mettreAJourCompteur() {
    const compteur = document.querySelector('.panier-count');
    compteur.textContent = panier.length;
}

function mettreAJourPanier() {
    const panierArticles = document.getElementById('panier-articles');
    const panierTotal = document.getElementById('panier-montant-total');
    let total = 0;

    panierArticles.innerHTML = '';
    
    panier.forEach((article, index) => {
        total += article.prix;
        
        const articleElement = document.createElement('div');
        articleElement.className = 'panier-article';
        articleElement.innerHTML = `
            <img src="${article.image}" alt="${article.nom}">
            <div class="panier-article-info">
                <h4>${article.nom}</h4>
                <p>${article.description}</p>
                <p>${article.prix} F. CFA</p>
            </div>
            <button onclick="supprimerDuPanier(${index})">×</button>
        `;
        
        panierArticles.appendChild(articleElement);
    });
    
    panierTotal.textContent = `${total} F. CFA`;
}

function supprimerDuPanier(index) {
    panier.splice(index, 1);
    mettreAJourPanier();
    mettreAJourCompteur();
}

function initierPaiement() {
    // Implémentez ici votre logique de paiement
    alert('Redirection vers la page de paiement...');
}

// Fermer le panier si on clique en dehors
document.addEventListener('click', (e) => {
    const panierModal = document.getElementById('panier-modal');
    const panierIcon = document.querySelector('.panier-icon');
    
    if (!panierModal.contains(e.target) && !panierIcon.contains(e.target)) {
        panierModal.style.display = 'none';
    }
});
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
