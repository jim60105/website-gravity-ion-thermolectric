/**
 * Main JavaScript file for Gravity Ion Thermoelectric Website
 * Coordinates all application logic and user interactions
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

/**
 * Application Configuration
 */
const AppConfig = {
    name: 'Gravity Ion Thermoelectric Website',
    version: '1.0.0',
    debug: false,
    features: {
        particles: true,
        animations: true,
        analytics: false,
        serviceWorker: false
    },
    responsive: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    }
};

/**
 * Main Application Class
 */
class GravityIonApp {
    constructor() {
        this.isInitialized = false;
        this.components = new Map();
        this.eventListeners = new Map();

        // Bind methods
        this.handleResize = Utils.Performance.debounce(this.handleResize.bind(this), 250);
        this.handleScroll = Utils.Performance.throttle(this.handleScroll.bind(this), 16);
        this.handleKeydown = this.handleKeydown.bind(this);

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.info(`Initializing ${AppConfig.name} v${AppConfig.version}`);

            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core components
            this.setupErrorHandling();
            this.setupEventListeners();
            this.setupHeaderHeight(); // Add header height calculation
            this.initializeComponents();
            this.setupAccessibility();
            this.setupPerformanceOptimizations();

            // Mark as initialized
            this.isInitialized = true;

            console.info('Application initialized successfully');

            // Dispatch custom event
            window.dispatchEvent(
                new CustomEvent('app:initialized', {
                    detail: { app: this }
                })
            );
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleError(error);
        }
    }

    /**
     * Setup header height calculation and CSS variable
     */
    setupHeaderHeight() {
        const updateHeaderHeight = () => {
            const header = Utils.DOM.select('header');
            if (header) {
                const headerHeight = header.offsetHeight;
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            }
        };

        // Set initial header height
        updateHeaderHeight();

        // Update on resize
        const debouncedUpdate = Utils.Performance.debounce(updateHeaderHeight, 250);
        window.addEventListener('resize', debouncedUpdate);

        this.components.set('headerHeight', { update: updateHeaderHeight });
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', event => {
            this.handleError(event.error, 'Global Error');
        });

        window.addEventListener('unhandledrejection', event => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });
    }

    /**
     * Handle application errors
     * @param {Error} error - Error object
     * @param {string} context - Error context
     */
    handleError(error, context = 'Application Error') {
        const errorInfo = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        if (AppConfig.debug) {
            console.error(`${context}:`, errorInfo);
        }

        // In production, you might want to send this to an error tracking service
        // ErrorTracker.report(errorInfo);
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('keydown', this.handleKeydown);

        // Page visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // Store event listeners for cleanup
        this.eventListeners.set('resize', this.handleResize);
        this.eventListeners.set('scroll', this.handleScroll);
        this.eventListeners.set('keydown', this.handleKeydown);
    }

    /**
     * Initialize application components
     */
    initializeComponents() {
        // Initialize animation system
        if (AppConfig.features.animations) {
            Animations.AnimationManager.init();
            this.components.set('animations', Animations.AnimationManager);
        }

        // Initialize navigation
        this.initNavigation();

        // Initialize mobile menu
        this.initMobileMenu();

        // Initialize hero section interactions
        this.initHeroSection();

        // Initialize contact forms (if any)
        this.initContactForms();
    }

    /**
     * Initialize navigation functionality
     */
    initNavigation() {
        const nav = Utils.DOM.select('nav');
        if (!nav) {
            return;
        }

        // Highlight active section in navigation
        const updateActiveNavItem = Utils.Performance.throttle(() => {
            const sections = Utils.DOM.selectAll('section[id]');
            const navLinks = Utils.DOM.selectAll('nav a[href^="#"]');

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top <= 100 && rect.bottom >= 100;

                if (isVisible) {
                    // Remove active class from all nav items
                    navLinks.forEach(link => {
                        Utils.DOM.removeClass(link, 'active');
                    });

                    // Add active class to current section's nav item
                    const activeLink = Utils.DOM.select(`nav a[href="#${section.id}"]`);
                    if (activeLink) {
                        Utils.DOM.addClass(activeLink, 'active');
                    }
                }
            });
        }, 100);

        window.addEventListener('scroll', updateActiveNavItem);
        this.components.set('navigation', { updateActiveNavItem });
    }

    /**
     * Initialize hero section interactions
     */
    initHeroSection() {
        // Explore button functionality
        const exploreBtn = Utils.DOM.select('#hero-explore-btn');
        if (exploreBtn) {
            Utils.DOM.on(exploreBtn, 'click', (e) => {
                e.preventDefault();
                const target = exploreBtn.dataset.scrollTarget;
                const targetElement = Utils.DOM.select(target);
                if (targetElement) {
                    Utils.Scroll.to(targetElement, {
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }

        // Video button functionality
        const videoBtn = Utils.DOM.select('#hero-video-btn');
        if (videoBtn) {
            Utils.DOM.on(videoBtn, 'click', (e) => {
                e.preventDefault();
                const videoUrl = videoBtn.dataset.videoUrl;

                if (videoUrl) {
                    window.open(videoUrl, '_blank', 'noopener,noreferrer');
                } else {
                    // Fallback URL if data-video-url is not set
                    window.open('https://youtube.com/watch?v=JgQdZ7Nlv3I', '_blank', 'noopener,noreferrer');
                }
            });
        }

        // Scroll indicator functionality
        const scrollIndicator = Utils.DOM.select('#scroll-indicator');
        if (scrollIndicator) {
            Utils.DOM.on(scrollIndicator, 'click', (e) => {
                e.preventDefault();
                const target = scrollIndicator.dataset.scrollTarget;
                const targetElement = Utils.DOM.select(target);
                if (targetElement) {
                    Utils.Scroll.to(targetElement, {
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }

        this.components.set('heroSection', {
            exploreBtn,
            videoBtn,
            scrollIndicator
        });
    }
    initMobileMenu() {
        const menuButton = Utils.DOM.select('#mobile-menu-button');
        const mobileMenu = Utils.DOM.select('#mobile-menu');

        if (!menuButton || !mobileMenu) {
            return;
        }

        let isMenuOpen = false;

        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;

            if (isMenuOpen) {
                Utils.DOM.removeClass(mobileMenu, 'hidden');
                menuButton.setAttribute('aria-expanded', 'true');

                // Change icon to X
                menuButton.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            } else {
                Utils.DOM.addClass(mobileMenu, 'hidden');
                menuButton.setAttribute('aria-expanded', 'false');

                // Change icon back to hamburger
                menuButton.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                `;
            }
        };

        Utils.DOM.on(menuButton, 'click', toggleMenu);

        // Close menu when clicking on nav links
        const mobileNavLinks = Utils.DOM.selectAll('#mobile-menu a');
        mobileNavLinks.forEach(link => {
            Utils.DOM.on(link, 'click', () => {
                if (isMenuOpen) {
                    toggleMenu();
                }
            });
        });

        // Close menu when clicking outside
        Utils.DOM.on(document, 'click', e => {
            if (isMenuOpen && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                toggleMenu();
            }
        });

        this.components.set('mobileMenu', { toggleMenu });
    }

    /**
     * Initialize contact forms
     */
    initContactForms() {
        const forms = Utils.DOM.selectAll('form');

        forms.forEach(form => {
            Utils.DOM.on(form, 'submit', async e => {
                e.preventDefault();
                await this.handleFormSubmission(form);
            });
        });
    }

    /**
     * Handle form submission
     * @param {HTMLFormElement} form - Form element
     */
    async handleFormSubmission(form) {
        const loadingAnimations = this.components.get('animations')?.loadingAnimations;

        try {
            // Show loading state
            if (loadingAnimations) {
                loadingAnimations.show(form, { message: '發送中...' });
            }

            // Simulate form submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success message
            this.showNotification('訊息已成功發送！', 'success');
            form.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('發送失敗，請稍後再試。', 'error');
        } finally {
            // Hide loading state
            if (loadingAnimations) {
                loadingAnimations.hide(form);
            }
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Skip link functionality
        const skipLink = Utils.DOM.select('a[href="#main-content"]');
        if (skipLink) {
            Utils.DOM.on(skipLink, 'click', e => {
                e.preventDefault();
                const mainContent = Utils.DOM.select('#main-content');
                if (mainContent) {
                    mainContent.focus();
                    Utils.Scroll.to(mainContent);
                }
            });
        }

        // Keyboard navigation for custom elements
        this.setupKeyboardNavigation();

        // ARIA live regions for dynamic content
        this.setupLiveRegions();
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Tab through custom interactive elements
        const interactiveElements = Utils.DOM.selectAll('[role="button"], .interactive');

        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }

            Utils.DOM.on(element, 'keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    }

    /**
     * Setup ARIA live regions
     */
    setupLiveRegions() {
        // Create live region for notifications
        const liveRegion = Utils.DOM.createElement('div', {
            id: 'live-region',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            className: 'sr-only'
        });

        document.body.appendChild(liveRegion);
        this.components.set('liveRegion', liveRegion);
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Monitor performance in debug mode
        if (AppConfig.debug) {
            this.monitorPerformance();
        }
    }

    /**
     * Monitor performance metrics
     */
    monitorPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domContentLoaded:
                            perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        firstPaint: performance
                            .getEntriesByType('paint')
                            .find(entry => entry.name === 'first-paint')?.startTime,
                        firstContentfulPaint: performance
                            .getEntriesByType('paint')
                            .find(entry => entry.name === 'first-contentful-paint')?.startTime
                    };

                    console.info('Performance Metrics:', metrics);
                }, 1000);
            });
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const viewport = Utils.Device.getViewport();

        // Update responsive behavior based on viewport
        if (viewport.width <= AppConfig.responsive.mobile) {
            document.body.setAttribute('data-device', 'mobile');
        } else if (viewport.width <= AppConfig.responsive.tablet) {
            document.body.setAttribute('data-device', 'tablet');
        } else {
            document.body.setAttribute('data-device', 'desktop');
        }

        // Update header height
        const headerHeightComponent = this.components.get('headerHeight');
        if (headerHeightComponent) {
            headerHeightComponent.update();
        }

        // Notify components of resize
        this.components.forEach((component, _name) => {
            if (component.handleResize && typeof component.handleResize === 'function') {
                component.handleResize(viewport);
            }
        });
    }

    /**
     * Handle window scroll
     */
    handleScroll() {
        const scrollPos = Utils.Scroll.getPosition();

        // Update scroll-dependent components
        this.components.forEach((component, _name) => {
            if (component.handleScroll && typeof component.handleScroll === 'function') {
                component.handleScroll(scrollPos);
            }
        });
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeydown(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    // Focus search (if implemented)
                    break;
                case '/':
                    e.preventDefault();
                    // Open help (if implemented)
                    break;
            }
        }

        // Escape key functionality
        if (e.key === 'Escape') {
            // Close mobile menu if open
            const mobileMenu = this.components.get('mobileMenu');
            if (mobileMenu && !Utils.DOM.hasClass('#mobile-menu', 'hidden')) {
                mobileMenu.toggleMenu();
            }
        }
    }

    /**
     * Handle page becoming hidden
     */
    onPageHidden() {
        // Pause animations and timers when page is hidden
        const animationManager = this.components.get('animations');
        if (animationManager && animationManager.canvasParticleSystem) {
            animationManager.canvasParticleSystem.stop();
        }
    }

    /**
     * Handle page becoming visible
     */
    onPageVisible() {
        // Resume animations and timers when page becomes visible
        const animationManager = this.components.get('animations');
        if (animationManager && animationManager.canvasParticleSystem) {
            animationManager.canvasParticleSystem.start();
        }
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = Utils.DOM.createElement('div', {
            className: `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
                type === 'success'
                    ? 'bg-green-500'
                    : type === 'error'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
            } text-white max-w-sm`,
            innerHTML: `
                <div class="flex items-center justify-between">
                    <span>${message}</span>
                    <button class="ml-4 text-white hover:text-gray-200" aria-label="關閉通知">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            `
        });

        document.body.appendChild(notification);

        // Auto-dismiss after 5 seconds
        const dismissTimeout = setTimeout(() => {
            this.dismissNotification(notification);
        }, 5000);

        // Manual dismiss
        const closeButton = notification.querySelector('button');
        Utils.DOM.on(closeButton, 'click', () => {
            clearTimeout(dismissTimeout);
            this.dismissNotification(notification);
        });

        // Update live region for screen readers
        const liveRegion = this.components.get('liveRegion');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    /**
     * Dismiss notification
     * @param {Element} notification - Notification element
     */
    dismissNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Destroy the application
     */
    destroy() {
        // Remove event listeners
        this.eventListeners.forEach((handler, event) => {
            window.removeEventListener(event, handler);
        });

        // Destroy components
        this.components.forEach((component, _name) => {
            if (component.destroy && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Clear maps
        this.components.clear();
        this.eventListeners.clear();

        this.isInitialized = false;
        console.info('Application destroyed');
    }
}

// Initialize application when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new GravityIonApp();
    });
} else {
    app = new GravityIonApp();
}

// Export for module usage and debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GravityIonApp, AppConfig };
}

// Make available globally for debugging
window.App = { GravityIonApp, AppConfig, instance: app };
