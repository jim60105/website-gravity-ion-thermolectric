/**
 * CTA Interactions - Handle Call to Action button interactions and tracking
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

class CTAInteractions {
    constructor() {
        this.trackingEnabled = true;
        this.interactions = new Map();
        this.init();
    }

    /**
     * Initialize CTA interactions
     */
    init() {
        this.setupVideoButtons();
        this.setupPaperDownload();
        this.setupAnalytics();

        console.info('CTA Interactions initialized');
    }

    /**
     * Setup video button interactions
     */
    setupVideoButtons() {
        const videoButtons = document.querySelectorAll('.video-btn');

        videoButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                this.handleVideoClick(e, index);
            });

            // Add hover effects
            button.addEventListener('mouseenter', () => {
                this.addHoverEffect(button);
            });

            button.addEventListener('mouseleave', () => {
                this.removeHoverEffect(button);
            });
        });
    }

    /**
     * Handle video button clicks
     */
    handleVideoClick(event, index) {
        const button = event.currentTarget;
        const videoUrl = button.href;
        const videoType = this.getVideoType(index);

        // Add click animation
        this.addClickAnimation(button);

        // Track interaction
        this.trackInteraction('video_click', {
            type: videoType,
            url: videoUrl,
            timestamp: Date.now()
        });

        // Show loading state briefly
        this.showLoadingState(button, 500);

        console.info(`Video clicked: ${videoType}`, { url: videoUrl });
    }

    /**
     * Get video type based on index
     */
    getVideoType(index) {
        const types = ['chinese_explanation', 'english_explanation', 'detailed_mechanism'];
        return types[index] || 'unknown';
    }

    /**
     * Setup paper download interactions
     */
    setupPaperDownload() {
        const paperButton = document.querySelector('.paper-btn');

        if (paperButton) {
            paperButton.addEventListener('click', (e) => {
                this.handlePaperDownload(e);
            });
        }
    }

    /**
     * Handle paper download clicks
     */
    handlePaperDownload(event) {
        const button = event.currentTarget;
        const paperUrl = button.href;

        // Add click animation
        this.addClickAnimation(button);

        // Update download counter
        this.updateDownloadCounter();

        // Track interaction
        this.trackInteraction('paper_download', {
            url: paperUrl,
            timestamp: Date.now()
        });

        // Show success message
        const downloadMessage = Utils.Language.isZh() ? '論文下載已開始' : 'Paper download started';
        this.showSuccessMessage(button, downloadMessage);

        console.info('Paper download initiated', { url: paperUrl });
    }

    /**
     * Update download counter
     */
    updateDownloadCounter() {
        const downloadCounter = document.getElementById('download-counter');
        if (downloadCounter) {
            const currentCount = parseInt(downloadCounter.textContent.replace(/,/g, '')) || 0;
            const newCount = currentCount + 1;
            downloadCounter.textContent = newCount.toLocaleString();

            // Animate counter update
            downloadCounter.style.animation = 'none';
            downloadCounter.offsetHeight; // Trigger reflow
            downloadCounter.style.animation = 'counterUp 0.5s ease-out';
        }
    }

    /**
     * Add click animation to button
     */
    addClickAnimation(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    /**
     * Add hover effect
     */
    addHoverEffect(button) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    }

    /**
     * Remove hover effect
     */
    removeHoverEffect(button) {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '';
    }

    /**
     * Show loading state
     */
    showLoadingState(button, duration = 1000) {
        button.classList.add('loading');
        button.style.pointerEvents = 'none';

        setTimeout(() => {
            button.classList.remove('loading');
            button.style.pointerEvents = 'auto';
        }, duration);
    }

    /**
     * Show success message
     */
    showSuccessMessage(button, message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'absolute top-full left-0 right-0 bg-green-500 text-white text-sm py-2 px-4 rounded-b-lg feedback-success';
        messageEl.textContent = message;

        button.parentElement.style.position = 'relative';
        button.parentElement.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    /**
     * Show global success message
     */
    showGlobalSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 feedback-success';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    /**
     * Setup analytics
     */
    setupAnalytics() {
        // Track page view
        this.trackInteraction('cta_section_view', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    }

    /**
     * Track user interactions
     */
    trackInteraction(eventType, data) {
        if (!this.trackingEnabled) {return;}

        const interaction = {
            type: eventType,
            data: data,
            sessionId: this.getSessionId(),
            timestamp: Date.now()
        };

        this.interactions.set(`${eventType}_${Date.now()}`, interaction);

        // Store in localStorage for persistent tracking
        this.storeInteraction(interaction);

        console.info('Interaction tracked:', interaction);
    }

    /**
     * Get or create session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('cta_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('cta_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Store interaction in localStorage
     */
    storeInteraction(interaction) {
        try {
            const stored = JSON.parse(localStorage.getItem('cta_interactions') || '[]');
            stored.push(interaction);

            // Keep only last 100 interactions
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }

            localStorage.setItem('cta_interactions', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store interaction:', error);
        }
    }

    /**
     * Get interaction statistics
     */
    getInteractionStats() {
        const stats = {
            totalInteractions: this.interactions.size,
            videoClicks: 0,
            paperDownloads: 0,
            socialShares: 0
        };

        this.interactions.forEach(interaction => {
            switch (interaction.type) {
                case 'video_click':
                    stats.videoClicks++;
                    break;
                case 'paper_download':
                    stats.paperDownloads++;
                    break;
                case 'social_share':
                    stats.socialShares++;
                    break;
            }
        });

        return stats;
    }
}

// Initialize CTA Interactions when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ctaInteractions = new CTAInteractions();
    });
} else {
    window.ctaInteractions = new CTAInteractions();
}
