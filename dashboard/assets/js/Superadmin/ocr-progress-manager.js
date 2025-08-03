/**
 * OCR Progress Manager
 * Interface de progression non-bloquante avec animations fluides
 * Feedback visuel professionnel pour l'utilisateur
 */

class OCRProgressManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }
        
        this.options = {
            enableAnimations: options.enableAnimations !== false,
            enableSound: options.enableSound || false,
            enableCancel: options.enableCancel !== false,
            smoothProgress: options.smoothProgress !== false,
            ...options
        };
        
        this.steps = [
            { id: 'upload', label: 'Téléchargement du document', icon: 'cloud-upload', duration: 800 },
            { id: 'prepare', label: 'Préparation du document', icon: 'file-settings', duration: 1000 },
            { id: 'extract', label: 'Extraction du texte (OCR)', icon: 'scan', duration: 3000 },
            { id: 'analyze', label: 'Analyse IA en cours', icon: 'brain', duration: 2000 },
            { id: 'structure', label: 'Structuration des données', icon: 'database', duration: 1500 },
            { id: 'validate', label: 'Validation finale', icon: 'shield-check', duration: 500 }
        ];
        
        this.currentStep = -1;
        this.startTime = null;
        this.progressInterval = null;
        this.isActive = false;
        this.isCancelled = false;
        this.onCancelCallback = null;
        
        this.init();
    }
    
    init() {
        // Créer le template HTML
        this.render();
        
        // Initialiser les sons si activés
        if (this.options.enableSound) {
            this.initSounds();
        }
    }
    
    render() {
        const html = `
            <div class="ocr-progress-wrapper" style="display: none;">
                <div class="ocr-progress-header">
                    <h4 class="mb-3">
                        <i class="ti ti-brain me-2"></i>
                        Traitement OCR en cours
                    </h4>
                    <div class="progress-time">
                        <span id="ocr-elapsed-time">00:00</span> écoulé
                        <span class="text-muted mx-2">•</span>
                        <span id="ocr-estimated-time">Calcul...</span> restant
                    </div>
                </div>
                
                <div class="ocr-progress-steps mt-4">
                    ${this.steps.map((step, index) => `
                        <div class="progress-step" data-step="${step.id}">
                            <div class="step-icon">
                                <i class="ti ti-${step.icon}"></i>
                            </div>
                            <div class="step-content">
                                <div class="step-label">${step.label}</div>
                                <div class="step-status"></div>
                            </div>
                            ${index < this.steps.length - 1 ? '<div class="step-connector"></div>' : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="ocr-progress-bar-wrapper mt-4">
                    <div class="progress progress-sm">
                        <div id="ocr-progress-bar" class="progress-bar progress-bar-animated progress-bar-striped" 
                             role="progressbar" style="width: 0%">
                        </div>
                    </div>
                    <div class="progress-percentage text-center mt-2">
                        <span id="ocr-progress-percent">0</span>%
                    </div>
                </div>
                
                <div class="ocr-progress-details mt-3">
                    <div id="ocr-progress-message" class="text-muted text-center">
                        Initialisation...
                    </div>
                </div>
                
                ${this.options.enableCancel ? `
                    <div class="ocr-progress-actions mt-4 text-center">
                        <button class="btn btn-ghost-danger btn-sm" id="ocr-cancel-btn">
                            <i class="ti ti-x me-1"></i>
                            Annuler
                        </button>
                    </div>
                ` : ''}
                
                <style>
                    .ocr-progress-wrapper {
                        background: #fff;
                        border-radius: 8px;
                        padding: 2rem;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    
                    .progress-time {
                        font-size: 0.875rem;
                        color: #666;
                    }
                    
                    .ocr-progress-steps {
                        display: flex;
                        justify-content: space-between;
                        position: relative;
                    }
                    
                    .progress-step {
                        flex: 1;
                        text-align: center;
                        position: relative;
                    }
                    
                    .step-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: #f4f4f4;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 0.5rem;
                        transition: all 0.3s ease;
                        position: relative;
                        z-index: 2;
                    }
                    
                    .step-icon i {
                        font-size: 1.25rem;
                        color: #999;
                        transition: all 0.3s ease;
                    }
                    
                    .progress-step.active .step-icon {
                        background: #206bc4;
                        animation: pulse 1.5s infinite;
                    }
                    
                    .progress-step.active .step-icon i {
                        color: white;
                    }
                    
                    .progress-step.completed .step-icon {
                        background: #2fb344;
                    }
                    
                    .progress-step.completed .step-icon i {
                        color: white;
                    }
                    
                    .progress-step.error .step-icon {
                        background: #d63939;
                    }
                    
                    .progress-step.error .step-icon i {
                        color: white;
                    }
                    
                    .step-label {
                        font-size: 0.8125rem;
                        color: #666;
                        margin-bottom: 0.25rem;
                    }
                    
                    .step-status {
                        font-size: 0.75rem;
                        color: #999;
                        height: 1rem;
                    }
                    
                    .step-connector {
                        position: absolute;
                        top: 24px;
                        left: 50%;
                        right: -50%;
                        height: 2px;
                        background: #e9ecef;
                        z-index: 1;
                    }
                    
                    .progress-step.completed .step-connector {
                        background: #2fb344;
                    }
                    
                    @keyframes pulse {
                        0% {
                            box-shadow: 0 0 0 0 rgba(32, 107, 196, 0.4);
                        }
                        70% {
                            box-shadow: 0 0 0 10px rgba(32, 107, 196, 0);
                        }
                        100% {
                            box-shadow: 0 0 0 0 rgba(32, 107, 196, 0);
                        }
                    }
                    
                    .ocr-progress-bar-wrapper {
                        margin: 0 auto;
                        max-width: 400px;
                    }
                </style>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.wrapper = this.container.querySelector('.ocr-progress-wrapper');
        
        // Attacher les événements
        if (this.options.enableCancel) {
            const cancelBtn = document.getElementById('ocr-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.cancel());
            }
        }
    }
    
    show(onCancel = null) {
        if (this.isActive) return;
        
        this.isActive = true;
        this.isCancelled = false;
        this.currentStep = -1;
        this.startTime = Date.now();
        this.onCancelCallback = onCancel;
        
        // Afficher avec animation
        this.wrapper.style.display = 'block';
        if (this.options.enableAnimations) {
            this.wrapper.style.opacity = '0';
            this.wrapper.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                this.wrapper.style.transition = 'all 0.3s ease';
                this.wrapper.style.opacity = '1';
                this.wrapper.style.transform = 'translateY(0)';
            });
        }
        
        // Démarrer le timer
        this.startTimer();
        
        // Démarrer la première étape
        setTimeout(() => this.nextStep(), 300);
        
        if (this.options.enableSound) {
            this.playSound('start');
        }
    }
    
    hide() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.stopTimer();
        
        // Masquer avec animation
        if (this.options.enableAnimations) {
            this.wrapper.style.transition = 'all 0.3s ease';
            this.wrapper.style.opacity = '0';
            this.wrapper.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.wrapper.style.display = 'none';
            }, 300);
        } else {
            this.wrapper.style.display = 'none';
        }
    }
    
    nextStep() {
        if (!this.isActive || this.isCancelled) return;
        
        // Marquer l'étape actuelle comme terminée
        if (this.currentStep >= 0) {
            this.setStepStatus(this.currentStep, 'completed');
        }
        
        // Passer à l'étape suivante
        this.currentStep++;
        
        if (this.currentStep < this.steps.length) {
            const step = this.steps[this.currentStep];
            this.setStepStatus(this.currentStep, 'active');
            this.updateMessage(step.label);
            this.updateProgress();
            
            if (this.options.enableSound) {
                this.playSound('step');
            }
            
            // Auto-progression (simulée, sera remplacée par des callbacks réels)
            if (this.currentStep < this.steps.length - 1) {
                setTimeout(() => this.nextStep(), step.duration);
            }
        } else {
            // Terminé
            this.complete();
        }
    }
    
    setStepStatus(index, status) {
        const steps = this.wrapper.querySelectorAll('.progress-step');
        if (steps[index]) {
            steps[index].classList.remove('active', 'completed', 'error');
            steps[index].classList.add(status);
            
            const statusEl = steps[index].querySelector('.step-status');
            if (statusEl) {
                switch (status) {
                    case 'active':
                        statusEl.textContent = 'En cours...';
                        break;
                    case 'completed':
                        statusEl.textContent = '✓ Terminé';
                        break;
                    case 'error':
                        statusEl.textContent = '✗ Erreur';
                        break;
                    default:
                        statusEl.textContent = '';
                }
            }
        }
    }
    
    updateProgress() {
        const percent = Math.round(((this.currentStep + 1) / this.steps.length) * 100);
        const progressBar = document.getElementById('ocr-progress-bar');
        const progressPercent = document.getElementById('ocr-progress-percent');
        
        if (progressBar && progressPercent) {
            if (this.options.smoothProgress) {
                // Animation fluide
                const currentWidth = parseInt(progressBar.style.width) || 0;
                const steps = percent - currentWidth;
                let current = currentWidth;
                
                const interval = setInterval(() => {
                    current += Math.sign(steps);
                    progressBar.style.width = current + '%';
                    progressPercent.textContent = current;
                    
                    if (current === percent) {
                        clearInterval(interval);
                    }
                }, 20);
            } else {
                progressBar.style.width = percent + '%';
                progressPercent.textContent = percent;
            }
        }
    }
    
    updateMessage(message) {
        const messageEl = document.getElementById('ocr-progress-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
    
    startTimer() {
        this.progressInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const elapsedStr = this.formatTime(elapsed);
            
            const elapsedEl = document.getElementById('ocr-elapsed-time');
            if (elapsedEl) {
                elapsedEl.textContent = elapsedStr;
            }
            
            // Estimation du temps restant
            if (this.currentStep >= 0) {
                const totalDuration = this.steps.reduce((sum, step) => sum + step.duration, 0);
                const completedDuration = this.steps.slice(0, this.currentStep + 1)
                    .reduce((sum, step) => sum + step.duration, 0);
                const remainingDuration = totalDuration - completedDuration;
                
                const estimatedEl = document.getElementById('ocr-estimated-time');
                if (estimatedEl) {
                    if (remainingDuration > 0) {
                        estimatedEl.textContent = '~' + this.formatTime(remainingDuration);
                    } else {
                        estimatedEl.textContent = 'Finalisation...';
                    }
                }
            }
        }, 100);
    }
    
    stopTimer() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    complete() {
        this.setStepStatus(this.currentStep, 'completed');
        this.updateProgress();
        this.updateMessage('Traitement terminé avec succès !');
        
        if (this.options.enableSound) {
            this.playSound('complete');
        }
        
        setTimeout(() => {
            this.hide();
        }, 1500);
    }
    
    error(message = 'Une erreur est survenue') {
        if (!this.isActive) return;
        
        this.setStepStatus(this.currentStep, 'error');
        this.updateMessage(message);
        
        const progressBar = document.getElementById('ocr-progress-bar');
        if (progressBar) {
            progressBar.classList.remove('progress-bar-animated', 'progress-bar-striped');
            progressBar.classList.add('bg-danger');
        }
        
        if (this.options.enableSound) {
            this.playSound('error');
        }
        
        setTimeout(() => {
            this.hide();
        }, 3000);
    }
    
    cancel() {
        if (!this.isActive || this.isCancelled) return;
        
        this.isCancelled = true;
        this.updateMessage('Annulation en cours...');
        
        const progressBar = document.getElementById('ocr-progress-bar');
        if (progressBar) {
            progressBar.classList.remove('progress-bar-animated');
            progressBar.classList.add('bg-warning');
        }
        
        if (this.onCancelCallback) {
            this.onCancelCallback();
        }
        
        setTimeout(() => {
            this.hide();
        }, 500);
    }
    
    // Méthodes pour contrôle externe
    setStep(stepId) {
        const index = this.steps.findIndex(s => s.id === stepId);
        if (index >= 0) {
            // Marquer tous les précédents comme terminés
            for (let i = 0; i < index; i++) {
                this.setStepStatus(i, 'completed');
            }
            this.currentStep = index - 1;
            this.nextStep();
        }
    }
    
    updateStep(stepId, message) {
        const index = this.steps.findIndex(s => s.id === stepId);
        if (index >= 0 && index === this.currentStep) {
            this.updateMessage(message);
        }
    }
    
    // Sons optionnels
    initSounds() {
        this.sounds = {
            start: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE'),
            step: new Audio('data:audio/wav;base64,UklGRkQEAABXQVZFZm10IBAAAAABAAEAiBUAAIgVAAABAAgAZGF0YSAEAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvM'),
            complete: new Audio('data:audio/wav;base64,UklGRl4GAABXQVZFZm10IBAAAAABAAEAiBUAAIgVAAABAAgAZGF0YToGAACBg4aEeXN1fY+RjIF2e3p1amluc3h9h4+Xm5eUko+KhH93cm1ucXh/iY6Sm5mVkoiGgX14d3Z3eo+UmZeSkYuHhYOCgYGDhYeIio6RlJeanJqVkYyGgX51bm'),
            error: new Audio('data:audio/wav;base64,UklGRiQDAABXQVZFZm10IBAAAAABAAEAiBUAAIgVAAABAAgAZGF0YQADAACBP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/gT+BP4E/')
        };
        
        // Précharger les sons
        Object.values(this.sounds).forEach(audio => {
            audio.volume = 0.3;
            audio.load();
        });
    }
    
    playSound(type) {
        if (this.sounds && this.sounds[type]) {
            this.sounds[type].play().catch(() => {});
        }
    }
}

// Export pour utilisation
window.OCRProgressManager = OCRProgressManager;