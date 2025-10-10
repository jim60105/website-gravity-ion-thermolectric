/**
 * Navigation System for Gravity Ion Thermoelectric Website
 * Handles navigation menu interactions, scroll spy, and smooth scrolling
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

/**
 * Navigation Controller Class
 */
class NavigationController {
    constructor() {
        this.header = document.querySelector('header');
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.sections = [];
        this.currentSection = '';
        this.scrollThreshold = 100;
        this.isScrolling = false;

        this.init();
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        this.setupSections();
        this.setupEventListeners();
        this.setupScrollSpy();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.updateActiveSection();

        console.info('Navigation system initialized');
    }

    /**
     * Setup section elements for scroll spy
     */
    setupSections() {
        this.sections = Array.from(this.navLinks)
            .map(link => {
                const href = link.getAttribute('href');
                const section = document.querySelector(href);
                return section ? {
                    id: href.substring(1),
                    element: section,
                    link: link,
                    offset: section.offsetTop
                } : null;
            })
            .filter(Boolean);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Throttled scroll handler for performance
        window.addEventListener('scroll',
            Utils.Performance.throttle(this.handleScroll.bind(this), 16)
        );

        // Resize handler to recalculate section positions
        window.addEventListener('resize',
            Utils.Performance.debounce(this.handleResize.bind(this), 250)
        );

        // Navigation link click handlers
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Mobile menu button
        if (this.mobileMenuButton) {
            this.mobileMenuButton.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Close mobile menu when clicking on links
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMobileMenu();
                }
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenu &&
                !this.mobileMenu.contains(e.target) &&
                !this.mobileMenuButton.contains(e.target) &&
                !this.mobileMenu.classList.contains('hidden')) {
                this.closeMobileMenu();
            }
        });

        // Handle escape key for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.mobileMenu.classList.contains('hidden')) {
                this.closeMobileMenu();
            }
        });

        // Back to Top Button functionality
        this.setupBackToTopButton();
    }

    /**
     * Setup Back to Top button functionality
     */
    setupBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) {return;}

        // Handle button click
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Track back to top interaction
            if (typeof Utils !== 'undefined' && Utils.Analytics) {
                Utils.Analytics.trackInteraction('back_to_top_click', {
                    fromPosition: window.pageYOffset,
                    fromSection: this.currentSection
                });
            }
        });

        // Initialize button state
        backToTopButton.style.opacity = '0';
        backToTopButton.style.transform = 'scale(0.8)';
        backToTopButton.style.transition = 'all 0.3s ease';
        backToTopButton.style.display = 'none';

        // Ensure the button maintains its fixed position
        backToTopButton.style.position = 'fixed';
    }

    /**
     * Handle scroll events for scroll spy and header effects
     */
    handleScroll() {
        // Always update back to top button regardless of scrolling state
        this.updateBackToTopButton();

        if (this.isScrolling) {return;}

        this.updateActiveSection();
        this.updateHeaderAppearance();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.setupSections();
        this.updateActiveSection();
    }

    /**
     * Handle navigation link clicks for smooth scrolling
     */
    handleNavClick(e) {
        e.preventDefault();

        const href = e.target.getAttribute('href');
        const targetSection = document.querySelector(href);

        if (targetSection) {
            this.smoothScrollToSection(targetSection);

            // Track navigation interaction
            if (typeof Utils !== 'undefined' && Utils.Analytics) {
                Utils.Analytics.trackInteraction('navigation_click', {
                    section: href.substring(1),
                    fromSection: this.currentSection
                });
            }
        }
    }

    /**
     * Smooth scroll to a specific section
     */
    smoothScrollToSection(targetSection) {
        this.isScrolling = true;

        const headerHeight = this.header ? this.header.offsetHeight : 0;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;

        // Use modern smooth scrolling if available
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Reset scrolling flag after animation
            setTimeout(() => {
                this.isScrolling = false;
            }, 1000);
        } else {
            // Fallback for older browsers
            this.animateScrollTo(targetPosition);
        }
    }

    /**
     * Fallback smooth scrolling animation
     */
    animateScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) {startTime = currentTime;}
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);

            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                this.isScrolling = false;
            }
        };

        requestAnimationFrame(animation);
    }

    /**
     * Easing function for smooth scroll animation
     */
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {return c / 2 * t * t + b;}
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    /**
     * Setup scroll spy functionality
     */
    setupScrollSpy() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.setupScrollSpyFallback();
        }
    }

    /**
     * Modern scroll spy using Intersection Observer
     */
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        // Observe all sections
        this.sections.forEach(section => {
            this.observer.observe(section.element);
        });
    }

    /**
     * Fallback scroll spy for older browsers
     */
    setupScrollSpyFallback() {
        // This will be handled in the scroll handler
    }

    /**
     * Update active section based on scroll position
     */
    updateActiveSection() {
        if (this.observer) {return;} // Using intersection observer

        const scrollPosition = window.pageYOffset + window.innerHeight / 3;

        let activeSection = '';

        // Find the section that's currently in view
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            if (scrollPosition >= section.element.offsetTop) {
                activeSection = section.id;
                break;
            }
        }

        if (activeSection !== this.currentSection) {
            this.setActiveSection(activeSection);
        }
    }

    /**
     * Set the active section and update navigation
     */
    setActiveSection(sectionId) {
        if (sectionId === this.currentSection) {return;}

        this.currentSection = sectionId;

        // Update navigation link states
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${sectionId}`;

            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Update document title if needed
        const activeSection = this.sections.find(s => s.id === sectionId);
        if (activeSection) {
            const sectionTitle = activeSection.element.querySelector('h1, h2, h3')?.textContent;
            if (sectionTitle) {
                const siteTitle = Utils.Language.isZh() 
                    ? '重力離子熱電技術' 
                    : 'Gravity Ion Thermoelectric Technology';
                document.title = `${sectionTitle} | ${siteTitle}`;
            }
        }
    }

    /**
     * Update header appearance based on scroll position
     */
    updateHeaderAppearance() {
        if (!this.header) {return;}

        const scrolled = window.pageYOffset > this.scrollThreshold;
        this.header.classList.toggle('scrolled', scrolled);

        // Add backdrop blur effect when scrolled
        if (scrolled) {
            this.header.style.backdropFilter = 'blur(10px)';
            this.header.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        } else {
            this.header.style.backdropFilter = '';
            this.header.style.backgroundColor = '';
        }
    }

    /**
     * Update back to top button visibility based on scroll position
     */
    updateBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) {return;}

        backToTopButton.style.position = 'fixed';

        const shouldShow = window.pageYOffset > 300;

        if (shouldShow) {
            // Show button
            if (backToTopButton.style.display === 'none') {
                backToTopButton.style.display = 'block';
                // Force reflow before starting animation
                backToTopButton.offsetHeight;
            }
            backToTopButton.style.opacity = '1';
            backToTopButton.style.transform = 'scale(1)';
        } else {
            // Hide button
            backToTopButton.style.opacity = '0';
            backToTopButton.style.transform = 'scale(0.8)';
            // Set display to none after transition completes
            setTimeout(() => {
                if (window.pageYOffset <= 300) {
                    backToTopButton.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Setup smooth scrolling behavior
     */
    setupSmoothScrolling() {
        // Enable CSS smooth scrolling if supported
        if ('scrollBehavior' in document.documentElement.style) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        if (!this.mobileMenuButton || !this.mobileMenu) {return;}

        // Ensure proper ARIA attributes
        this.mobileMenuButton.setAttribute('aria-expanded', 'false');
        this.mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const isHidden = this.mobileMenu.classList.contains('hidden');

        if (isHidden) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.mobileMenu.classList.remove('hidden');
        this.mobileMenuButton.setAttribute('aria-expanded', 'true');
        this.mobileMenu.setAttribute('aria-hidden', 'false');

        // Focus first menu item for accessibility
        const firstMenuItem = this.mobileMenu.querySelector('a');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 100);
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.mobileMenu.classList.add('hidden');
        this.mobileMenuButton.setAttribute('aria-expanded', 'false');
        this.mobileMenu.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to menu button
        this.mobileMenuButton.focus();
    }

    /**
     * Get current active section
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Navigate to specific section programmatically
     */
    navigateToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            this.smoothScrollToSection(targetSection);
        }
    }

    /**
     * Cleanup - remove event listeners and observers
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // Remove event listeners
        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });

        if (this.mobileMenuButton) {
            this.mobileMenuButton.removeEventListener('click', this.toggleMobileMenu);
        }
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigationController = new NavigationController();
    });
} else {
    window.navigationController = new NavigationController();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
}
