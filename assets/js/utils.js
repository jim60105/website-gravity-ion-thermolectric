/**
 * Utility functions for DOM manipulation, event handling, and common operations
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

/**
 * DOM Utility Functions
 */
const DOM = {
    /**
     * Efficiently select a single element
     * @param {string} selector - CSS selector
     * @param {Element} context - Optional context element
     * @returns {Element|null}
     */
    select(selector, context = document) {
        return context.querySelector(selector);
    },

    /**
     * Efficiently select multiple elements
     * @param {string} selector - CSS selector
     * @param {Element} context - Optional context element
     * @returns {NodeList}
     */
    selectAll(selector, context = document) {
        return context.querySelectorAll(selector);
    },

    /**
     * Create element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Element} content - Element content
     * @returns {Element}
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        }

        return element;
    },

    /**
     * Add event listener with optional delegation
     * @param {Element|string} target - Element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    on(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? this.select(target) : target;
        if (element) {
            element.addEventListener(event, handler, options);
        }
    },

    /**
     * Remove event listener
     * @param {Element|string} target - Element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    off(target, event, handler) {
        const element = typeof target === 'string' ? this.select(target) : target;
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    /**
     * Add CSS class with animation support
     * @param {Element|string} target - Element or selector
     * @param {string} className - Class name to add
     */
    addClass(target, className) {
        const element = typeof target === 'string' ? this.select(target) : target;
        if (element) {
            element.classList.add(className);
        }
    },

    /**
     * Remove CSS class
     * @param {Element|string} target - Element or selector
     * @param {string} className - Class name to remove
     */
    removeClass(target, className) {
        const element = typeof target === 'string' ? this.select(target) : target;
        if (element) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle CSS class
     * @param {Element|string} target - Element or selector
     * @param {string} className - Class name to toggle
     * @returns {boolean}
     */
    toggleClass(target, className) {
        const element = typeof target === 'string' ? this.select(target) : target;
        return element ? element.classList.toggle(className) : false;
    },

    /**
     * Check if element has class
     * @param {Element|string} target - Element or selector
     * @param {string} className - Class name to check
     * @returns {boolean}
     */
    hasClass(target, className) {
        const element = typeof target === 'string' ? this.select(target) : target;
        return element ? element.classList.contains(className) : false;
    }
};

/**
 * Scroll Utilities
 */
const Scroll = {
    /**
     * Get current scroll position
     * @returns {Object} {x, y}
     */
    getPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    },

    /**
     * Smooth scroll to element or position
     * @param {Element|string|number} target - Element, selector, or Y position
     * @param {Object} options - Scroll options
     */
    to(target, options = {}) {
        const defaults = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        if (typeof target === 'number') {
            window.scrollTo({
                top: target,
                ...defaults,
                ...options
            });
        } else {
            const element = typeof target === 'string' ? DOM.select(target) : target;
            if (element) {
                element.scrollIntoView({
                    ...defaults,
                    ...options
                });
            }
        }
    },

    /**
     * Get element's position relative to viewport
     * @param {Element|string} target - Element or selector
     * @returns {DOMRect}
     */
    getElementPosition(target) {
        const element = typeof target === 'string' ? DOM.select(target) : target;
        return element ? element.getBoundingClientRect() : null;
    },

    /**
     * Check if element is in viewport
     * @param {Element|string} target - Element or selector
     * @param {number} threshold - Visibility threshold (0-1)
     * @returns {boolean}
     */
    isInViewport(target, threshold = 0) {
        const rect = this.getElementPosition(target);
        if (!rect) {
            return false;
        }

        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        const verticalVisible =
            rect.top >= -rect.height * threshold &&
            rect.bottom <= windowHeight + rect.height * threshold;
        const horizontalVisible =
            rect.left >= -rect.width * threshold &&
            rect.right <= windowWidth + rect.width * threshold;

        return verticalVisible && horizontalVisible;
    }
};

/**
 * Device and Browser Detection
 */
const Device = {
    /**
     * Check if device is mobile
     * @returns {boolean}
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    },

    /**
     * Check if device is tablet
     * @returns {boolean}
     */
    isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    },

    /**
     * Check if device is desktop
     * @returns {boolean}
     */
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    },

    /**
     * Get viewport dimensions
     * @returns {Object} {width, height}
     */
    getViewport() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    },

    /**
     * Check if user prefers reduced motion
     * @returns {boolean}
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Check if user prefers dark mode
     * @returns {boolean}
     */
    prefersDarkMode() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
};

/**
 * Performance Utilities
 */
const Performance = {
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately
     * @returns {Function}
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) {
                    func.apply(this, args);
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(this, args);
            }
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Request animation frame with fallback
     * @param {Function} callback - Animation callback
     * @returns {number} Animation frame ID
     */
    requestAnimFrame(_callback) {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        );
    },

    /**
     * Cancel animation frame
     * @param {number} id - Animation frame ID
     */
    cancelAnimFrame(id) {
        const cancel =
            window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            clearTimeout;
        cancel(id);
    }
};

/**
 * Math Utilities
 */
const MathUtils = {
    /**
     * Generate random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number}
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Generate random integer between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number}
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} factor - Interpolation factor (0-1)
     * @returns {number}
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    /**
     * Map value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input minimum
     * @param {number} inMax - Input maximum
     * @param {number} outMin - Output minimum
     * @param {number} outMax - Output maximum
     * @returns {number}
     */
    mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
};

/**
 * Storage Utilities
 */
const Storage = {
    /**
     * Set item in localStorage with JSON support
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
    },

    /**
     * Get item from localStorage with JSON support
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any}
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
    },

    /**
     * Clear all localStorage items
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
    }
};

/**
 * URL Utilities
 */
const URL = {
    /**
     * Get URL parameter value
     * @param {string} name - Parameter name
     * @returns {string|null}
     */
    getParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * Set URL parameter
     * @param {string} name - Parameter name
     * @param {string} value - Parameter value
     * @param {boolean} replace - Replace current history entry
     */
    setParam(name, value, replace = false) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);

        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    },

    /**
     * Remove URL parameter
     * @param {string} name - Parameter name
     * @param {boolean} replace - Replace current history entry
     */
    removeParam(name, replace = false) {
        const url = new URL(window.location);
        url.searchParams.delete(name);

        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }
};

/**
 * Language Utilities
 */
const Language = {
    /**
     * Get current language from global Lang instance
     * @returns {string} 'zh' or 'en'
     */
    getCurrent() {
        return window.Lang ? window.Lang.getCurrentLang() : 'zh';
    },

    /**
     * Translate key using global Lang instance
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        return window.Lang ? window.Lang.t(key, params) : key;
    },

    /**
     * Check if current language is Chinese
     * @returns {boolean}
     */
    isZh() {
        return this.getCurrent() === 'zh';
    },

    /**
     * Check if current language is English
     * @returns {boolean}
     */
    isEn() {
        return this.getCurrent() === 'en';
    }
};

// Export utilities for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOM,
        Scroll,
        Device,
        Performance,
        MathUtils,
        Storage,
        URL,
        Language
    };
}

// Make utilities available globally
window.Utils = {
    DOM,
    Scroll,
    Device,
    Performance,
    MathUtils,
    Storage,
    URL,
    Language
};
