const produits = document.querySelectorAll('.produit-card');

// Fonction pour filtrer les produits
function filtrerProduits(categorie, valeur) {
    produits.forEach(produit => {
        const produitCategorie = produit.getAttribute(`data-${categorie}`);
        produit.style.display = (produitCategorie === valeur) ? 'block' : 'none';
    });
}

function resetFiltres() {
    produits.forEach(produit => produit.style.display = 'block');
}

// Initialisation du tableau du panier
let panierItems = JSON.parse(localStorage.getItem('panier')) || [];
let isPanierVisible = false;

function togglePanier() {
    const modal = document.getElementById('panier-modal');
    isPanierVisible = !isPanierVisible;
    modal.style.display = isPanierVisible ? 'block' : 'none';
}

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

function updatePanierCount() {
    const countElement = document.querySelector('.panier-count');
    if (countElement) {
        countElement.textContent = panierItems.length;
    }
}

function updatePanierAffichage() {
    const panierContainer = document.getElementById('panier-articles');
    const totalElement = document.getElementById('panier-montant-total');

    if (!panierContainer || !totalElement) {
        console.error('Éléments du panier non trouvés');
        return;
    }

    panierContainer.innerHTML = '';
    let total = 0;

    panierItems.forEach((item, index) => {
        const articleElement = document.createElement('div');
        articleElement.className = 'panier-item';
        articleElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <img src="${item.image}" alt="${item.nom}" style="width: 50px; height: 50px; object-fit: cover;">
                <div style="margin-left: 10px; flex-grow: 1;">
                    <h4 style="margin: 0;">${item.nom}</h4>
                    <p style="margin: 5px 0;">${item.description}</p>
                    <p style="margin: 0; font-weight: bold;">${item.prix} F. CFA</p>
                </div>
                <button onclick="supprimerDuPanier(${index})" style="background-color: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    Supprimer
                </button>
            </div>
        `;
        panierContainer.appendChild(articleElement);
        total += item.prix;
    });

    totalElement.textContent = `${total} F. CFA`;
    updatePanierCount();
}

function supprimerDuPanier(index) {
    if (index >= 0 && index < panierItems.length) {
        panierItems.splice(index, 1);
        localStorage.setItem('panier', JSON.stringify(panierItems));
        updatePanierAffichage();
        updatePanierCount();
    }
}

function passerCommande() {
    if (panierItems.length === 0) {
        alert('Votre panier est vide!');
        return;
    }

    const total = panierItems.reduce((sum, item) => sum + item.prix, 0);
    alert(`Commande confirmée! Total: ${total} F. CFA`);
    panierItems = [];
    localStorage.removeItem('panier');
    updatePanierAffichage();
    togglePanier();
}

function afficherNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 2000);
}

// Initialisation FedaPay
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

// Événements DOM
document.addEventListener('DOMContentLoaded', () => {
    updatePanierAffichage();
    initializeFedaPay();

    document.addEventListener('click', (event) => {
        const panierDropdown = document.getElementById('panier-dropdown');
        const panierIcon = document.querySelector('.panier-icon');

        if (panierDropdown && panierIcon &&
            !panierDropdown.contains(event.target) &&
            !panierIcon.contains(event.target)) {
            panierDropdown.style.display = 'none';
        }
    });
});
