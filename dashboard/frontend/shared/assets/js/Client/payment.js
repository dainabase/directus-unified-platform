/**
 * Payment Processing
 * Gestion des paiements et validation des formulaires
 */

// Variables globales
let selectedPaymentMethod = 'card';
let processingPayment = false;

// Initialiser les méthodes de paiement
function initPaymentMethods() {
    // Gérer le changement de méthode
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            selectedPaymentMethod = this.value;
            showPaymentForm(this.value);
        });
    });
    
    // Initialiser les masques de saisie
    initCardInputs();
    
    // Générer les QR codes
    generateQRCodes();
    
    // Initialiser les tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Afficher le formulaire de paiement correspondant
function showPaymentForm(method) {
    // Masquer tous les formulaires
    document.querySelectorAll('.payment-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Afficher le formulaire sélectionné
    const selectedForm = document.getElementById(`payment-${method}`);
    if (selectedForm) {
        selectedForm.style.display = 'block';
    }
    
    // Mettre à jour le bouton de paiement
    updatePayButton(method);
}

// Mettre à jour le bouton de paiement
function updatePayButton(method) {
    const payButton = document.getElementById('pay-button');
    
    switch(method) {
        case 'card':
            payButton.innerHTML = '<i class="ti ti-lock icon"></i> Payer CHF 8\'500.00';
            payButton.onclick = processPayment;
            break;
        case 'transfer':
            payButton.innerHTML = '<i class="ti ti-check icon"></i> J\'ai effectué le virement';
            payButton.onclick = confirmTransfer;
            break;
        case 'twint':
            payButton.innerHTML = '<i class="ti ti-qrcode icon"></i> Payer avec TWINT';
            payButton.onclick = processTwintPayment;
            break;
    }
}

// Initialiser les champs de carte
function initCardInputs() {
    // Masque numéro de carte
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
            
            // Détecter le type de carte
            detectCardType(value);
        });
    }
    
    // Masque date expiration
    const cardExpiry = document.getElementById('card-expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV uniquement numérique
    const cardCVV = document.getElementById('card-cvv');
    if (cardCVV) {
        cardCVV.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/gi, '');
        });
    }
    
    // Nom en majuscules
    const cardName = document.getElementById('card-name');
    if (cardName) {
        cardName.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    }
}

// Détecter le type de carte
function detectCardType(number) {
    const cardTypes = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/
    };
    
    for (let [type, pattern] of Object.entries(cardTypes)) {
        if (pattern.test(number)) {
            highlightCardType(type);
            return;
        }
    }
}

// Mettre en évidence le type de carte
function highlightCardType(type) {
    // Reset all card images
    document.querySelectorAll('.card-type').forEach(img => {
        img.style.opacity = '0.3';
    });
    
    // Highlight detected card
    const cardImg = document.querySelector(`.card-type-${type}`);
    if (cardImg) {
        cardImg.style.opacity = '1';
    }
}

// Validation du formulaire de carte
function validateCardForm() {
    const form = document.getElementById('card-payment-form');
    if (!form) return false;
    
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCVV = document.getElementById('card-cvv').value;
    const cardName = document.getElementById('card-name').value;
    
    // Validation basique
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        showError('Numéro de carte invalide');
        return false;
    }
    
    // Validation date expiration
    const [month, year] = cardExpiry.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    
    if (expiry < today) {
        showError('Carte expirée');
        return false;
    }
    
    if (cardCVV.length < 3 || cardCVV.length > 4) {
        showError('Code CVV invalide');
        return false;
    }
    
    if (cardName.length < 3) {
        showError('Nom du titulaire requis');
        return false;
    }
    
    return true;
}

// Traiter le paiement
function processPayment() {
    if (processingPayment) return;
    
    if (selectedPaymentMethod === 'card' && !validateCardForm()) {
        return;
    }
    
    processingPayment = true;
    const payButton = document.getElementById('pay-button');
    const originalContent = payButton.innerHTML;
    
    // Animation de traitement
    payButton.disabled = true;
    payButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Traitement en cours...';
    
    // Simulation du traitement
    setTimeout(() => {
        // Masquer le numéro de carte pour la sécurité
        if (selectedPaymentMethod === 'card') {
            const cardNumber = document.getElementById('card-number').value;
            const maskedNumber = '**** **** **** ' + cardNumber.slice(-4);
            console.log('Paiement par carte:', maskedNumber);
        }
        
        // Succès
        payButton.innerHTML = '<i class="ti ti-check icon"></i> Paiement réussi!';
        payButton.classList.remove('btn-success');
        payButton.classList.add('btn-outline-success');
        
        // Afficher le modal de succès
        setTimeout(() => {
            const successModal = new bootstrap.Modal(document.getElementById('modal-success'));
            successModal.show();
            
            // Sauvegarder la carte si demandé
            if (document.getElementById('save-card')?.checked) {
                saveCardForFuture();
            }
        }, 1000);
        
        processingPayment = false;
    }, 3000);
}

// Confirmer le virement
function confirmTransfer() {
    if (confirm('Avez-vous effectué le virement bancaire avec la référence indiquée ?')) {
        PortalApp.showToast('Virement en cours de vérification. Vous recevrez une confirmation par email.', 'info');
        
        setTimeout(() => {
            window.location.href = 'finances.html';
        }, 2000);
    }
}

// Traiter le paiement TWINT
function processTwintPayment() {
    PortalApp.showToast('En attente de confirmation TWINT...', 'info');
    
    // Simulation de l'attente TWINT
    const payButton = document.getElementById('pay-button');
    payButton.disabled = true;
    payButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>En attente TWINT...';
    
    // Simuler la confirmation après 5 secondes
    setTimeout(() => {
        payButton.innerHTML = '<i class="ti ti-check icon"></i> Paiement TWINT confirmé!';
        
        const successModal = new bootstrap.Modal(document.getElementById('modal-success'));
        successModal.show();
    }, 5000);
}

// Générer les QR codes
function generateQRCodes() {
    // QR code pour virement
    const qrTransfer = document.getElementById('qr-transfer');
    if (qrTransfer) {
        // En production, utiliser une vraie bibliothèque QR
        drawPlaceholderQR(qrTransfer);
    }
    
    // QR code pour TWINT
    const qrTwint = document.getElementById('qr-twint');
    if (qrTwint) {
        drawPlaceholderQR(qrTwint);
    }
}

// Dessiner un QR code placeholder
function drawPlaceholderQR(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);
    
    // Pattern QR simulé
    ctx.fillStyle = 'black';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) {
                ctx.fillRect(i * 10, j * 10, 10, 10);
            }
        }
    }
    
    // Coins de positionnement
    drawPositionPattern(ctx, 0, 0);
    drawPositionPattern(ctx, 140, 0);
    drawPositionPattern(ctx, 0, 140);
}

// Dessiner les coins de positionnement QR
function drawPositionPattern(ctx, x, y) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, 60, 60);
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 10, y + 10, 40, 40);
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 20, y + 20, 20, 20);
}

// Copier l'IBAN
function copyIBAN() {
    const iban = 'CH93 0076 2011 6238 5295 7';
    navigator.clipboard.writeText(iban).then(() => {
        PortalApp.showToast('IBAN copié dans le presse-papier', 'success');
    });
}

// Sauvegarder la carte pour le futur
function saveCardForFuture() {
    const cardNumber = document.getElementById('card-number').value;
    const maskedNumber = '**** **** **** ' + cardNumber.slice(-4);
    
    console.log('Carte sauvegardée:', maskedNumber);
    PortalApp.showToast('Carte sauvegardée pour vos futurs paiements', 'success');
}

// Télécharger le reçu
function downloadReceipt() {
    PortalApp.showToast('Téléchargement du reçu en cours...', 'info');
    
    setTimeout(() => {
        PortalApp.showToast('Reçu téléchargé', 'success');
    }, 1000);
}

// Afficher une erreur
function showError(message) {
    PortalApp.showToast(message, 'danger');
    
    // Secouer le formulaire
    const form = document.querySelector('.payment-form:not([style*="none"])');
    if (form) {
        form.classList.add('shake-animation');
        setTimeout(() => {
            form.classList.remove('shake-animation');
        }, 500);
    }
}

// Animation de succès
function showSuccessAnimation() {
    // Créer une animation de confettis ou checkmark
    const container = document.querySelector('.page-body');
    const successIcon = document.createElement('div');
    successIcon.className = 'payment-success-animation';
    successIcon.innerHTML = '<i class="ti ti-circle-check"></i>';
    container.appendChild(successIcon);
    
    setTimeout(() => {
        successIcon.remove();
    }, 3000);
}

// Validation en temps réel
document.addEventListener('DOMContentLoaded', function() {
    // Validation du numéro de carte
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('blur', function() {
            const value = this.value.replace(/\s/g, '');
            if (value.length > 0 && (value.length < 13 || value.length > 19)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // Validation CVV
    const cardCVV = document.getElementById('card-cvv');
    if (cardCVV) {
        cardCVV.addEventListener('blur', function() {
            if (this.value.length > 0 && (this.value.length < 3 || this.value.length > 4)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }
});