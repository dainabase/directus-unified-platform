/**
 * Timeline Component
 * Implémente le composant Timeline de Tabler
 */

const TimelineComponent = {
    /**
     * Initialiser le composant Timeline
     */
    init() {
        console.log('📅 Initialisation du composant Timeline');
        
        this.createTimelineStyles();
        this.initializeExistingTimelines();
        this.setupTimelineAPI();
    },

    /**
     * Créer les styles pour le timeline
     */
    createTimelineStyles() {
        const styles = `
        <style>
        /* Timeline Styles */
        .timeline {
            position: relative;
            padding: 1rem 0;
        }

        .timeline-item {
            position: relative;
            padding-left: 2.5rem;
            padding-bottom: 1.5rem;
        }

        .timeline-item:last-child {
            padding-bottom: 0;
        }

        .timeline-item:not(:last-child)::before {
            content: '';
            position: absolute;
            left: 0.75rem;
            top: 2rem;
            bottom: 0;
            width: 2px;
            background-color: var(--tblr-border-color);
        }

        .timeline-item-point {
            position: absolute;
            left: 0;
            top: 0.25rem;
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            background-color: var(--tblr-bg-surface);
            border: 2px solid var(--tblr-border-color);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .timeline-item-point.bg-primary,
        .timeline-item-point.bg-success,
        .timeline-item-point.bg-warning,
        .timeline-item-point.bg-danger,
        .timeline-item-point.bg-info {
            border-color: currentColor;
        }

        .timeline-item-point .icon {
            width: 0.75rem;
            height: 0.75rem;
        }

        .timeline-item-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .timeline-item-time {
            font-size: 0.875rem;
            color: var(--tblr-muted);
            margin-bottom: 0.5rem;
        }

        .timeline-item-description {
            color: var(--tblr-body-color);
        }

        /* Timeline Simple (sans description) */
        .timeline-simple .timeline-item {
            padding-bottom: 0.75rem;
        }

        .timeline-simple .timeline-item-point {
            width: 0.75rem;
            height: 0.75rem;
            top: 0.5rem;
        }

        .timeline-simple .timeline-item:not(:last-child)::before {
            left: 0.375rem;
            top: 1.25rem;
        }

        /* Timeline Horizontal */
        .timeline-horizontal {
            display: flex;
            overflow-x: auto;
            padding: 1rem 0 2rem;
        }

        .timeline-horizontal .timeline-item {
            flex: 0 0 auto;
            padding-left: 0;
            padding-bottom: 0;
            padding-right: 3rem;
            text-align: center;
            min-width: 150px;
        }

        .timeline-horizontal .timeline-item:not(:last-child)::before {
            content: '';
            position: absolute;
            left: 50%;
            right: -50%;
            top: 2.75rem;
            bottom: auto;
            width: auto;
            height: 2px;
            background-color: var(--tblr-border-color);
        }

        .timeline-horizontal .timeline-item-point {
            position: relative;
            left: auto;
            top: auto;
            margin: 0 auto 1rem;
        }

        /* États actifs */
        .timeline-item.active .timeline-item-point {
            background-color: var(--tblr-primary);
            border-color: var(--tblr-primary);
            color: white;
        }

        .timeline-item.completed .timeline-item-point {
            background-color: var(--tblr-success);
            border-color: var(--tblr-success);
            color: white;
        }

        /* Animation */
        .timeline-item.animate {
            opacity: 0;
            transform: translateX(-20px);
            animation: timelineFadeIn 0.5s forwards;
        }

        @keyframes timelineFadeIn {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        /* Mode sombre */
        .theme-dark .timeline-item:not(:last-child)::before {
            background-color: var(--tblr-border-color-dark);
        }

        .theme-dark .timeline-item-point {
            background-color: var(--tblr-bg-surface-dark);
            border-color: var(--tblr-border-color-dark);
        }
        </style>
        `;

        if (!document.querySelector('#timeline-component-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'timeline-component-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }
    },

    /**
     * Initialiser les timelines existantes
     */
    initializeExistingTimelines() {
        const timelines = document.querySelectorAll('[data-timeline]');
        
        timelines.forEach(timeline => {
            this.enhanceTimeline(timeline);
        });
    },

    /**
     * Améliorer une timeline
     */
    enhanceTimeline(element) {
        const config = {
            type: element.dataset.timelineType || 'vertical',
            animate: element.dataset.timelineAnimate === 'true',
            ...element.dataset
        };

        // Ajouter les classes de base
        element.classList.add('timeline');
        if (config.type === 'horizontal') {
            element.classList.add('timeline-horizontal');
        }
        if (element.dataset.timelineSimple === 'true') {
            element.classList.add('timeline-simple');
        }

        // Améliorer les items
        const items = element.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            if (config.animate) {
                item.classList.add('animate');
                item.style.animationDelay = `${index * 0.1}s`;
            }

            // S'assurer que le point existe
            if (!item.querySelector('.timeline-item-point')) {
                this.createTimelinePoint(item);
            }
        });
    },

    /**
     * Créer le point de timeline
     */
    createTimelinePoint(item) {
        const point = document.createElement('div');
        point.className = 'timeline-item-point';
        
        // Détecter le type d'icône ou de statut
        const icon = item.dataset.icon;
        const status = item.dataset.status;
        const color = item.dataset.color;

        if (icon) {
            point.innerHTML = `<i class="icon ti ti-${icon}"></i>`;
        }

        if (status) {
            switch (status) {
                case 'completed':
                    point.classList.add('bg-success');
                    point.innerHTML = '<i class="icon ti ti-check"></i>';
                    break;
                case 'active':
                    point.classList.add('bg-primary');
                    break;
                case 'error':
                    point.classList.add('bg-danger');
                    point.innerHTML = '<i class="icon ti ti-x"></i>';
                    break;
            }
        }

        if (color) {
            point.classList.add(`bg-${color}`);
        }

        item.insertBefore(point, item.firstChild);
    },

    /**
     * API pour créer des timelines dynamiquement
     */
    setupTimelineAPI() {
        window.Timeline = {
            /**
             * Créer une nouvelle timeline
             */
            create: (container, options = {}) => {
                const defaults = {
                    type: 'vertical',
                    items: [],
                    animate: true,
                    simple: false
                };

                const config = { ...defaults, ...options };
                
                // Créer l'élément timeline
                const timeline = document.createElement('div');
                timeline.className = 'timeline';
                timeline.dataset.timeline = 'true';
                
                if (config.type === 'horizontal') {
                    timeline.classList.add('timeline-horizontal');
                }
                if (config.simple) {
                    timeline.classList.add('timeline-simple');
                }

                // Ajouter les items
                config.items.forEach((itemData, index) => {
                    const item = this.createTimelineItem(itemData);
                    if (config.animate) {
                        item.classList.add('animate');
                        item.style.animationDelay = `${index * 0.1}s`;
                    }
                    timeline.appendChild(item);
                });

                // Ajouter au container
                const containerElement = typeof container === 'string' ? 
                    document.querySelector(container) : container;
                
                if (containerElement) {
                    containerElement.appendChild(timeline);
                }

                return timeline;
            },

            /**
             * Ajouter un item à une timeline existante
             */
            addItem: (timeline, itemData) => {
                const item = this.createTimelineItem(itemData);
                
                // Animer si la timeline est animée
                if (timeline.querySelector('.timeline-item.animate')) {
                    item.classList.add('animate');
                    const itemCount = timeline.querySelectorAll('.timeline-item').length;
                    item.style.animationDelay = `${itemCount * 0.1}s`;
                }

                timeline.appendChild(item);
                return item;
            },

            /**
             * Mettre à jour le statut d'un item
             */
            updateStatus: (item, status) => {
                const point = item.querySelector('.timeline-item-point');
                if (!point) return;

                // Retirer les anciens statuts
                point.classList.remove('bg-primary', 'bg-success', 'bg-danger');
                item.classList.remove('active', 'completed');

                // Appliquer le nouveau statut
                switch (status) {
                    case 'active':
                        item.classList.add('active');
                        point.classList.add('bg-primary');
                        break;
                    case 'completed':
                        item.classList.add('completed');
                        point.classList.add('bg-success');
                        point.innerHTML = '<i class="icon ti ti-check"></i>';
                        break;
                    case 'error':
                        point.classList.add('bg-danger');
                        point.innerHTML = '<i class="icon ti ti-x"></i>';
                        break;
                }
            }
        };
    },

    /**
     * Créer un item de timeline
     */
    createTimelineItem(data) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        // Créer le point
        const point = document.createElement('div');
        point.className = 'timeline-item-point';
        
        if (data.icon) {
            point.innerHTML = `<i class="icon ti ti-${data.icon}"></i>`;
        }
        
        if (data.color) {
            point.classList.add(`bg-${data.color}`);
        }
        
        if (data.status) {
            item.dataset.status = data.status;
            if (data.status === 'active') {
                item.classList.add('active');
            } else if (data.status === 'completed') {
                item.classList.add('completed');
            }
        }
        
        item.appendChild(point);
        
        // Ajouter le contenu
        if (data.title) {
            const title = document.createElement('div');
            title.className = 'timeline-item-title';
            title.textContent = data.title;
            item.appendChild(title);
        }
        
        if (data.time) {
            const time = document.createElement('div');
            time.className = 'timeline-item-time';
            time.textContent = data.time;
            item.appendChild(time);
        }
        
        if (data.description) {
            const description = document.createElement('div');
            description.className = 'timeline-item-description';
            description.innerHTML = data.description;
            item.appendChild(description);
        }
        
        if (data.content) {
            const content = document.createElement('div');
            content.className = 'timeline-item-content';
            content.innerHTML = data.content;
            item.appendChild(content);
        }
        
        return item;
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    TimelineComponent.init();
});

// Exporter pour utilisation
window.TimelineComponent = TimelineComponent;