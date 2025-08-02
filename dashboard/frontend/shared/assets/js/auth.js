/**
 * Module d'authentification
 * Gestion de la validation des formulaires et de la sécurité
 */

const AuthModule = {
    // Initialisation du module
    init() {
        console.log('🔐 Initialisation du module d\'authentification');
        this.initPasswordToggles();
        this.initFormValidation();
        this.initPasswordStrength();
    },
    
    // Initialiser les toggles de mot de passe
    initPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const input = toggle.closest('.input-group').querySelector('input');
                const icon = toggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('ti-eye');
                    icon.classList.add('ti-eye-off');
                } else {
                    input.type = 'password';
                    icon.classList.remove('ti-eye-off');
                    icon.classList.add('ti-eye');
                }
            });
        });
    },
    
    // Initialiser la validation des formulaires
    initFormValidation() {
        // Validation email en temps réel
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value && !this.validateEmail(input.value)) {
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
        });
        
        // Validation password confirmation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                const password = document.getElementById('password').value;
                if (confirmPasswordInput.value && confirmPasswordInput.value !== password) {
                    confirmPasswordInput.classList.add('is-invalid');
                } else {
                    confirmPasswordInput.classList.remove('is-invalid');
                }
            });
        }
    },
    
    // Initialiser l'indicateur de force du mot de passe
    initPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', () => {
                const strength = this.checkPasswordStrength(passwordInput.value);
                this.displayPasswordStrength(strength, strengthIndicator);
            });
        }
    },
    
    // Valider une adresse email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },
    
    // Valider un mot de passe
    validatePassword(password) {
        return password && password.length >= 8;
    },
    
    // Vérifier la force d'un mot de passe
    checkPasswordStrength(password) {
        let strength = 0;
        
        if (!password) return strength;
        
        // Longueur
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Complexité
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return Math.min(strength, 5);
    },
    
    // Afficher l'indicateur de force du mot de passe
    displayPasswordStrength(strength, element) {
        const levels = [
            { level: 0, text: '', class: '' },
            { level: 1, text: 'Très faible', class: 'text-danger' },
            { level: 2, text: 'Faible', class: 'text-warning' },
            { level: 3, text: 'Moyen', class: 'text-info' },
            { level: 4, text: 'Fort', class: 'text-success' },
            { level: 5, text: 'Très fort', class: 'text-success fw-bold' }
        ];
        
        const levelInfo = levels[strength];
        
        if (strength === 0) {
            element.innerHTML = '';
            return;
        }
        
        element.innerHTML = `
            <div class="progress progress-sm mb-1">
                <div class="progress-bar ${levelInfo.class.includes('danger') ? 'bg-danger' : 
                                         levelInfo.class.includes('warning') ? 'bg-warning' : 
                                         levelInfo.class.includes('info') ? 'bg-info' : 'bg-success'}" 
                     style="width: ${strength * 20}%"></div>
            </div>
            <small class="${levelInfo.class}">Mot de passe ${levelInfo.text}</small>
        `;
    },
    
    // Afficher une erreur sur un champ
    showFieldError(field, message) {
        field.classList.add('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    },
    
    // Animation pour les messages d'erreur
    animateError(element) {
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 500);
    },
    
    // Validation complète d'un formulaire
    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Ce champ est requis');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
            
            // Validation spécifique email
            if (field.type === 'email' && field.value && !this.validateEmail(field.value)) {
                this.showFieldError(field, 'Adresse email invalide');
                isValid = false;
            }
            
            // Validation spécifique mot de passe
            if (field.type === 'password' && field.name === 'password' && !this.validatePassword(field.value)) {
                this.showFieldError(field, 'Le mot de passe doit contenir au moins 8 caractères');
                isValid = false;
            }
        });
        
        // Validation des checkbox requises
        const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
        requiredCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                checkbox.classList.add('is-invalid');
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    // Réinitialiser les erreurs d'un formulaire
    clearFormErrors(form) {
        form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        form.classList.remove('was-validated');
    }
};

// Exporter pour utilisation
window.AuthModule = AuthModule;