/**
 * Steps Component
 * Implémente le composant Steps de Tabler
 */

const StepsComponent = {
    /**
     * Initialiser le composant Steps
     */
    init() {
        console.log('👣 Initialisation du composant Steps');
        
        this.createStepsStyles();
        this.initializeExistingSteps();
        this.setupStepsAPI();
    },

    /**
     * Créer les styles pour les steps
     */
    createStepsStyles() {
        const styles = `
        <style>
        /* Steps Styles */
        .steps {
            display: flex;
            list-style: none;
            padding: 0;
            margin: 0 0 2rem;
            counter-reset: step;
        }

        .steps-vertical {
            flex-direction: column;
        }

        .step-item {
            position: relative;
            flex: 1;
            text-align: center;
            counter-increment: step;
        }

        .steps-vertical .step-item {
            text-align: left;
            padding-left: 3rem;
            padding-bottom: 2rem;
        }

        /* Connecteur entre les étapes */
        .step-item:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 1rem;
            left: 50%;
            right: -50%;
            height: 2px;
            background-color: var(--tblr-border-color);
            z-index: 0;
        }

        .steps-vertical .step-item:not(:last-child)::after {
            top: 2rem;
            left: 1.5rem;
            right: auto;
            width: 2px;
            height: calc(100% - 2rem);
        }

        /* Numéro de l'étape */
        .step-item::before {
            content: counter(step);
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background-color: var(--tblr-bg-surface);
            border: 2px solid var(--tblr-border-color);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .steps-vertical .step-item::before {
            position: absolute;
            left: 0;
            top: 0;
        }

        /* États */
        .step-item.active::before {
            background-color: var(--tblr-primary);
            border-color: var(--tblr-primary);
            color: white;
        }

        .step-item.active ~ .step-item::after {
            background-color: var(--tblr-border-color);
        }

        .step-item.done::before {
            content: '✓';
            background-color: var(--tblr-success);
            border-color: var(--tblr-success);
            color: white;
        }

        .step-item.done::after {
            background-color: var(--tblr-success);
        }

        .step-item.error::before {
            content: '✕';
            background-color: var(--tblr-danger);
            border-color: var(--tblr-danger);
            color: white;
        }

        /* Contenu */
        .step-item-content {
            position: relative;
            z-index: 1;
        }

        .step-item-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .step-item-desc {
            font-size: 0.875rem;
            color: var(--tblr-muted);
        }

        /* Steps avec icônes */
        .steps-icons .step-item::before {
            content: '';
            width: 3rem;
            height: 3rem;
            font-size: 1.25rem;
        }

        .steps-icons .step-item-icon {
            position: absolute;
            top: 0.5rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
        }

        .steps-vertical.steps-icons .step-item-icon {
            left: 1.5rem;
            transform: translateX(-50%);
        }

        /* Steps couleur */
        .steps-color .step-item.active::before {
            background-color: var(--tblr-primary);
            border-color: var(--tblr-primary);
        }

        .steps-color .step-item.done::after {
            background-color: var(--tblr-primary);
        }

        /* Steps Counter (style alternatif) */
        .steps-counter .step-item {
            counter-increment: step;
        }

        .steps-counter .step-item::before {
            content: "Étape " counter(step);
            width: auto;
            padding: 0 1rem;
            border-radius: 1rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .steps:not(.steps-vertical) {
                flex-direction: column;
            }

            .steps:not(.steps-vertical) .step-item {
                text-align: left;
                padding-left: 3rem;
                padding-bottom: 1.5rem;
            }

            .steps:not(.steps-vertical) .step-item::before {
                position: absolute;
                left: 0;
            }

            .steps:not(.steps-vertical) .step-item:not(:last-child)::after {
                top: 2rem;
                left: 1rem;
                right: auto;
                width: 2px;
                height: calc(100% - 2rem);
            }
        }

        /* Animation */
        .steps-animated .step-item {
            opacity: 0.5;
            transition: opacity 0.3s;
        }

        .steps-animated .step-item.active,
        .steps-animated .step-item.done {
            opacity: 1;
        }

        /* Progress bar style */
        .steps-progress {
            position: relative;
            margin-bottom: 3rem;
        }

        .steps-progress::before {
            content: '';
            position: absolute;
            top: 1rem;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--tblr-border-color);
        }

        .steps-progress-bar {
            position: absolute;
            top: 1rem;
            left: 0;
            height: 2px;
            background-color: var(--tblr-primary);
            transition: width 0.3s ease;
        }
        </style>
        `;

        if (!document.querySelector('#steps-component-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'steps-component-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Initialiser les steps existants
     */
    initializeExistingSteps() {
        const stepsElements = document.querySelectorAll('[data-steps]');
        
        stepsElements.forEach(element => {
            this.enhanceSteps(element);
        });
    },

    /**
     * Améliorer un élément steps
     */
    enhanceSteps(element) {
        const config = {
            current: parseInt(element.dataset.stepsCurrent) || 1,
            vertical: element.dataset.stepsVertical === 'true',
            icons: element.dataset.stepsIcons === 'true',
            animated: element.dataset.stepsAnimated === 'true',
            clickable: element.dataset.stepsClickable === 'true',
            ...element.dataset
        };

        // Ajouter les classes de base
        element.classList.add('steps');
        if (config.vertical) {
            element.classList.add('steps-vertical');
        }
        if (config.icons) {
            element.classList.add('steps-icons');
        }
        if (config.animated) {
            element.classList.add('steps-animated');
        }

        // Traiter les items
        const items = element.querySelectorAll('.step-item');
        items.forEach((item, index) => {
            const stepNumber = index + 1;
            
            // Définir l'état
            if (stepNumber < config.current) {
                item.classList.add('done');
            } else if (stepNumber === config.current) {
                item.classList.add('active');
            }

            // Rendre cliquable si configuré
            if (config.clickable) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    this.goToStep(element, stepNumber);
                });
            }

            // Ajouter l'icône si nécessaire
            if (config.icons && item.dataset.icon) {
                const icon = document.createElement('i');
                icon.className = `step-item-icon ti ti-${item.dataset.icon}`;
                item.appendChild(icon);
            }
        });

        // Ajouter la barre de progression si demandé
        if (element.dataset.stepsProgress === 'true') {
            this.addProgressBar(element, config.current, items.length);
        }
    },

    /**
     * Ajouter une barre de progression
     */
    addProgressBar(element, current, total) {
        element.classList.add('steps-progress');
        
        const progressBar = document.createElement('div');
        progressBar.className = 'steps-progress-bar';
        progressBar.style.width = `${((current - 1) / (total - 1)) * 100}%`;
        
        element.appendChild(progressBar);
    },

    /**
     * Aller à une étape spécifique
     */
    goToStep(stepsElement, stepNumber) {
        const items = stepsElement.querySelectorAll('.step-item');
        const total = items.length;
        
        if (stepNumber < 1 || stepNumber > total) return;

        items.forEach((item, index) => {
            const itemNumber = index + 1;
            
            // Retirer toutes les classes d'état
            item.classList.remove('active', 'done', 'error');
            
            // Appliquer le nouvel état
            if (itemNumber < stepNumber) {
                item.classList.add('done');
            } else if (itemNumber === stepNumber) {
                item.classList.add('active');
            }
        });

        // Mettre à jour la barre de progression
        const progressBar = stepsElement.querySelector('.steps-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${((stepNumber - 1) / (total - 1)) * 100}%`;
        }

        // Déclencher un événement
        stepsElement.dispatchEvent(new CustomEvent('step-change', {
            detail: { step: stepNumber, total: total }
        }));
    },

    /**
     * API pour créer des steps dynamiquement
     */
    setupStepsAPI() {
        window.Steps = {
            /**
             * Créer de nouveaux steps
             */
            create: (container, options = {}) => {
                const defaults = {
                    steps: [],
                    current: 1,
                    vertical: false,
                    icons: false,
                    animated: true,
                    clickable: true,
                    progress: false
                };

                const config = { ...defaults, ...options };
                
                // Créer l'élément steps
                const steps = document.createElement('div');
                steps.className = 'steps';
                steps.dataset.steps = 'true';
                
                if (config.vertical) {
                    steps.classList.add('steps-vertical');
                }
                if (config.icons) {
                    steps.classList.add('steps-icons');
                }
                if (config.animated) {
                    steps.classList.add('steps-animated');
                }

                // Ajouter les étapes
                config.steps.forEach((stepData, index) => {
                    const step = this.createStepItem(stepData, index + 1, config.current);
                    
                    if (config.clickable) {
                        step.style.cursor = 'pointer';
                        step.addEventListener('click', () => {
                            this.goToStep(steps, index + 1);
                        });
                    }
                    
                    steps.appendChild(step);
                });

                // Ajouter la barre de progression
                if (config.progress) {
                    this.addProgressBar(steps, config.current, config.steps.length);
                }

                // Ajouter au container
                const containerElement = typeof container === 'string' ? 
                    document.querySelector(container) : container;
                
                if (containerElement) {
                    containerElement.appendChild(steps);
                }

                return steps;
            },

            /**
             * Aller à l'étape suivante
             */
            next: (stepsElement) => {
                const current = stepsElement.querySelector('.step-item.active');
                const items = stepsElement.querySelectorAll('.step-item');
                const currentIndex = Array.from(items).indexOf(current);
                
                if (currentIndex < items.length - 1) {
                    this.goToStep(stepsElement, currentIndex + 2);
                }
            },

            /**
             * Aller à l'étape précédente
             */
            prev: (stepsElement) => {
                const current = stepsElement.querySelector('.step-item.active');
                const items = stepsElement.querySelectorAll('.step-item');
                const currentIndex = Array.from(items).indexOf(current);
                
                if (currentIndex > 0) {
                    this.goToStep(stepsElement, currentIndex);
                }
            },

            /**
             * Aller à une étape spécifique
             */
            goTo: (stepsElement, stepNumber) => {
                this.goToStep(stepsElement, stepNumber);
            },

            /**
             * Marquer une étape comme erreur
             */
            setError: (stepsElement, stepNumber) => {
                const items = stepsElement.querySelectorAll('.step-item');
                if (items[stepNumber - 1]) {
                    items[stepNumber - 1].classList.add('error');
                }
            },

            /**
             * Obtenir l'étape courante
             */
            getCurrent: (stepsElement) => {
                const items = stepsElement.querySelectorAll('.step-item');
                const current = stepsElement.querySelector('.step-item.active');
                return Array.from(items).indexOf(current) + 1;
            }
        };
    },

    /**
     * Créer un item d'étape
     */
    createStepItem(data, number, current) {
        const item = document.createElement('div');
        item.className = 'step-item';
        
        // Définir l'état
        if (number < current) {
            item.classList.add('done');
        } else if (number === current) {
            item.classList.add('active');
        }
        
        // Ajouter l'icône si fournie
        if (data.icon) {
            const icon = document.createElement('i');
            icon.className = `step-item-icon ti ti-${data.icon}`;
            item.appendChild(icon);
        }
        
        // Ajouter le contenu
        const content = document.createElement('div');
        content.className = 'step-item-content';
        
        if (data.title) {
            const title = document.createElement('div');
            title.className = 'step-item-title';
            title.textContent = data.title;
            content.appendChild(title);
        }
        
        if (data.description) {
            const desc = document.createElement('div');
            desc.className = 'step-item-desc';
            desc.textContent = data.description;
            content.appendChild(desc);
        }
        
        item.appendChild(content);
        
        return item;
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    StepsComponent.init();
});

// Exporter pour utilisation
window.StepsComponent = StepsComponent;