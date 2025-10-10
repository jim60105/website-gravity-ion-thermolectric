/**
 * Accessibility Enhancement Module
 *
 * This module provides comprehensive accessibility features including:
 * - Enhanced keyboard navigation
 * - Screen reader improvements
 * - Focus management
 * - ARIA enhancements
 * - Color contrast checking
 * - Motion preference handling
 */

class AccessibilityEnhancer {
    constructor() {
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ];

        this.currentFocusIndex = -1;
        this.focusTracker = [];
        this.announcements = [];

        this.init();
    }

    /**
     * Initialize accessibility enhancements
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupAccessibilityFeatures();
            });
        } else {
            this.setupAccessibilityFeatures();
        }
    }

    /**
     * Setup all accessibility features
     */
    setupAccessibilityFeatures() {
        this.enhanceKeyboardNavigation();
        this.setupFocusManagement();
        this.enhanceScreenReaderSupport();
        this.setupMotionPreferences();
        this.enhanceARIALabels();
        this.setupSkipLinks();
        this.monitorColorContrast();
        this.setupAnnouncementSystem();
        this.enhanceFormAccessibility();

        console.info('[Accessibility] Enhancement systems initialized');
    }

    /**
     * Enhance keyboard navigation
     */
    enhanceKeyboardNavigation() {
        // Enhanced tab navigation
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Escape':
                    this.handleEscapeKey(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(e);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(e);
                    break;
                case 'Home':
                case 'End':
                    this.handleHomeEndNavigation(e);
                    break;
            }
        });

        // Add visible focus indicators
        this.enhanceFocusIndicators();
    }

    /**
     * Handle tab navigation
     */
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentElement = document.activeElement;
        const currentIndex = Array.from(focusableElements).indexOf(currentElement);

        // Track focus for better management
        this.currentFocusIndex = currentIndex;

        // Handle modal trapping
        const modal = currentElement.closest('[role="dialog"], .modal');
        if (modal) {
            this.trapFocusInModal(e, modal);
        }
    }

    /**
     * Handle escape key
     */
    handleEscapeKey(e) {
        // Close modals, dropdowns, etc.
        const modal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (modal) {
            this.closeModal(modal);
            e.preventDefault();
        }

        // Close mobile menu
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            this.closeMobileMenu();
            e.preventDefault();
        }
    }

    /**
     * Handle enter/space activation
     */
    handleActivation(e) {
        const target = e.target;

        // Enhanced button activation
        if (target.matches('[role="button"]:not(button)')) {
            e.preventDefault();
            target.click();
        }

        // Enhanced link activation
        if (target.matches('a[href^="#"]')) {
            e.preventDefault();
            this.smoothScrollToTarget(target.getAttribute('href'));
        }
    }

    /**
     * Handle arrow navigation
     */
    handleArrowNavigation(e) {
        const target = e.target;

        // Navigation menu arrow support
        if (target.closest('nav')) {
            this.handleMenuArrowNavigation(e);
        }

        // Tab panel navigation
        if (target.closest('[role="tablist"]')) {
            this.handleTabArrowNavigation(e);
        }

        // Slider/carousel navigation
        if (target.closest('[role="slider"], .carousel')) {
            this.handleSliderNavigation(e);
        }
    }

    /**
     * Handle Home/End navigation
     */
    handleHomeEndNavigation(e) {
        const container = e.target.closest('nav, [role="tablist"], [role="menu"]');
        if (!container) {return;}

        const focusableElements = container.querySelectorAll(this.focusableElements.join(', '));

        if (e.key === 'Home' && focusableElements.length > 0) {
            e.preventDefault();
            focusableElements[0].focus();
        } else if (e.key === 'End' && focusableElements.length > 0) {
            e.preventDefault();
            focusableElements[focusableElements.length - 1].focus();
        }
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            this.onFocusChange(e.target);
        });

        // Handle focus restoration
        document.addEventListener('focusout', (e) => {
            this.storePreviousFocus(e.target);
        });

        // Skip to main content functionality is already handled in setupSkipLinks
    }

    /**
     * Handle focus changes
     */
    onFocusChange(element) {
        // Announce focus changes to screen readers
        if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
            this.announceToScreenReader(`Focused on ${this.getElementDescription(element)}`);
        }

        // Update navigation state
        if (element.matches('a[href^="#"]')) {
            this.updateNavigationState(element);
        }

        // Scroll element into view if needed
        this.ensureElementVisible(element);
    }

    /**
     * Store previous focus for restoration
     */
    storePreviousFocus(element) {
        if (element && element.id) {
            sessionStorage.setItem('lastFocusedElement', element.id);
        }
    }

    /**
     * Restore previous focus
     */
    restorePreviousFocus() {
        const lastFocusedId = sessionStorage.getItem('lastFocusedElement');
        if (lastFocusedId) {
            const element = document.getElementById(lastFocusedId);
            if (element) {
                element.focus();
                sessionStorage.removeItem('lastFocusedElement');
            }
        }
    }

    /**
     * Enhance screen reader support
     */
    enhanceScreenReaderSupport() {
        // Add live regions for dynamic content
        this.setupLiveRegions();

        // Enhance image descriptions
        this.enhanceImageDescriptions();

        // Add context descriptions
        this.addContextDescriptions();

        // Enhance table accessibility
        this.enhanceTableAccessibility();
    }

    /**
     * Enhance image descriptions
     */
    enhanceImageDescriptions() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            const src = img.src || img.dataset.src;
            if (src) {
                const filename = src.split('/').pop().split('.')[0];
                img.alt = this.generateImageDescription(filename, img);
            }
        });
    }

    /**
     * Generate image description based on context
     */
    generateImageDescription(filename, img) {
        const context = img.closest('section, article, div[class*="card"]');
        const heading = context?.querySelector('h1, h2, h3, h4, h5, h6');
        const contextName = heading?.textContent || '';

        // Scientific diagrams
        if (filename.includes('energy') || filename.includes('thermodynamic')) {
            return Utils.Language.isZh() 
                ? `${contextName} 相關的科學示意圖`
                : `${contextName} scientific diagram`;
        }

        if (filename.includes('experiment') || filename.includes('test')) {
            return Utils.Language.isZh()
                ? `${contextName} 實驗設備圖片`
                : `${contextName} experimental equipment image`;
        }

        if (filename.includes('chart') || filename.includes('graph')) {
            return Utils.Language.isZh()
                ? `${contextName} 數據圖表`
                : `${contextName} data chart`;
        }

        return contextName 
            ? Utils.Language.t('accessibility.relatedImage', { context: contextName })
            : Utils.Language.t('accessibility.defaultImageAlt');
    }

    /**
     * Add context descriptions
     */
    addContextDescriptions() {
        // Add descriptions to complex interactive elements
        const interactiveElements = document.querySelectorAll('[data-interactive]');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('aria-describedby')) {
                const description = this.createContextDescription(element);
                if (description) {
                    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
                    const descElement = document.createElement('div');
                    descElement.id = descId;
                    descElement.className = 'sr-only';
                    descElement.textContent = description;
                    element.appendChild(descElement);
                    element.setAttribute('aria-describedby', descId);
                }
            }
        });
    }

    /**
     * Create context description for interactive elements
     */
    createContextDescription(element) {
        if (element.classList.contains('particle-simulator')) {
            return Utils.Language.isZh() 
                ? '這是一個互動式粒子模擬器，您可以調整重力和熱振動參數來觀察離子分離效果'
                : 'This is an interactive particle simulator where you can adjust gravity and thermal vibration parameters to observe ion separation effects';
        }

        if (element.classList.contains('chart-container')) {
            return Utils.Language.isZh()
                ? '這是一個互動式圖表，顯示實驗數據和研究結果'
                : 'This is an interactive chart displaying experimental data and research results';
        }

        if (element.classList.contains('slider')) {
            return Utils.Language.isZh()
                ? '使用左右箭頭鍵或滑鼠拖拽來調整數值'
                : 'Use left/right arrow keys or mouse drag to adjust values';
        }

        return null;
    }

    /**
     * Enhance table accessibility
     */
    enhanceTableAccessibility() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Add table caption if missing
            if (!table.querySelector('caption')) {
                const heading = table.closest('section')?.querySelector('h1, h2, h3, h4, h5, h6');
                if (heading) {
                    const caption = document.createElement('caption');
                    const captionText = Utils.Language.isZh() ? '數據表格' : 'Data Table';
                    caption.textContent = `${heading.textContent} ${captionText}`;
                    caption.className = 'sr-only';
                    table.insertBefore(caption, table.firstChild);
                }
            }

            // Enhance header associations
            const headers = table.querySelectorAll('th');
            headers.forEach((header, _index) => {
                if (!header.id) {
                    header.id = `header-${Math.random().toString(36).substr(2, 9)}`;
                }
            });
        });
    }

    /**
     * Setup live regions for announcements
     */
    setupLiveRegions() {
        // Create announcement regions
        const politeRegion = document.createElement('div');
        politeRegion.id = 'aria-live-polite';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        politeRegion.className = 'sr-only';
        document.body.appendChild(politeRegion);

        const assertiveRegion = document.createElement('div');
        assertiveRegion.id = 'aria-live-assertive';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        document.body.appendChild(assertiveRegion);
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
        const region = document.getElementById(regionId);

        if (region) {
            // Clear previous announcement
            region.textContent = '';

            // Add new announcement with slight delay
            setTimeout(() => {
                region.textContent = message;

                // Clear after announcement
                setTimeout(() => {
                    region.textContent = '';
                }, 2000);
            }, 100);
        }

        console.info(`[Accessibility] Announced: ${message}`);
    }

    /**
     * Setup motion preferences
     */
    setupMotionPreferences() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        this.updateMotionSettings(prefersReducedMotion.matches);

        // Listen for changes
        prefersReducedMotion.addEventListener('change', (e) => {
            this.updateMotionSettings(e.matches);
        });
    }

    /**
     * Update motion settings based on user preference
     */
    updateMotionSettings(reduceMotion) {
        if (reduceMotion) {
            document.documentElement.classList.add('reduce-motion');

            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            style.id = 'reduced-motion-styles';
            document.head.appendChild(style);

            console.info('[Accessibility] Reduced motion preferences applied');
        } else {
            document.documentElement.classList.remove('reduce-motion');

            // Remove reduced motion styles
            const existingStyle = document.getElementById('reduced-motion-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        }
    }

    /**
     * Enhance ARIA labels and descriptions
     */
    enhanceARIALabels() {
        // Enhance buttons without accessible names
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('svg, i, img');
                if (icon) {
                    button.setAttribute('aria-label', this.generateButtonLabel(button));
                }
            }
        });

        // Enhance links without accessible names
        const links = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
        links.forEach(link => {
            if (!link.textContent.trim() || link.textContent.trim() === '→') {
                link.setAttribute('aria-label', this.generateLinkLabel(link));
            }
        });

        // Enhance form controls
        this.enhanceFormLabels();
    }

    /**
     * Enhance form labels and accessibility
     */
    enhanceFormLabels() {
        // Find all form inputs without proper labels
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Skip if already has proper labeling
            if (input.hasAttribute('aria-label') ||
                input.hasAttribute('aria-labelledby') ||
                document.querySelector(`label[for="${input.id}"]`)) {
                return;
            }

            // Generate appropriate label based on input type and context
            const label = this.generateInputLabel(input);
            if (label) {
                input.setAttribute('aria-label', label);
            }

            // Add required field indicators
            if (input.hasAttribute('required')) {
                const currentLabel = input.getAttribute('aria-label') || '';
                const requiredText = Utils.Language.isZh() ? '(必填)' : '(required)';
                input.setAttribute('aria-label', `${currentLabel} ${requiredText}`);
                input.setAttribute('aria-required', 'true');
            }

            // Enhance placeholder text accessibility
            if (input.placeholder && !input.hasAttribute('aria-describedby')) {
                const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
                const descElement = document.createElement('div');
                descElement.id = descId;
                descElement.className = 'sr-only';
                descElement.textContent = Utils.Language.t('accessibility.inputHint', { 
                    placeholder: input.placeholder 
                });
                input.parentNode.insertBefore(descElement, input.nextSibling);
                input.setAttribute('aria-describedby', descId);
            }
        });

        console.info('[Accessibility] Form labels enhanced');
    }

    /**
     * Generate appropriate label for form inputs
     */
    generateInputLabel(input) {
        const type = input.type || input.tagName.toLowerCase();
        const name = input.name || input.id || '';
        const placeholder = input.placeholder || '';

        // Check context from surrounding elements
        const formGroup = input.closest('.form-group, .field, .input-group');
        const contextLabel = formGroup?.querySelector('label, .label');
        if (contextLabel) {
            return contextLabel.textContent.trim();
        }

        // Generate based on input type
        switch (type) {
            case 'email':
                return Utils.Language.isZh() ? '電子郵件地址' : 'Email address';
            case 'password':
                return Utils.Language.isZh() ? '密碼' : 'Password';
            case 'tel':
                return Utils.Language.isZh() ? '電話號碼' : 'Phone number';
            case 'url':
                return Utils.Language.isZh() ? '網址' : 'URL';
            case 'search':
                return Utils.Language.isZh() ? '搜尋' : 'Search';
            case 'number':
                return placeholder || (Utils.Language.isZh() ? '數值輸入' : 'Number input');
            case 'range':
                return placeholder || (Utils.Language.isZh() ? '範圍調整' : 'Range adjustment');
            case 'date':
                return Utils.Language.isZh() ? '日期' : 'Date';
            case 'time':
                return Utils.Language.isZh() ? '時間' : 'Time';
            case 'checkbox':
                return Utils.Language.isZh() ? '核取方塊' : 'Checkbox';
            case 'radio':
                return Utils.Language.isZh() ? '選項' : 'Option';
            case 'select':
                return Utils.Language.isZh() ? '選擇選項' : 'Select option';
            case 'textarea':
                return placeholder || (Utils.Language.isZh() ? '文字輸入區域' : 'Text input area');
            case 'text':
            default:
                return placeholder || name || Utils.Language.t('accessibility.defaultInput');
        }
    }

    /**
     * Generate button label based on context
     */
    generateButtonLabel(button) {
        const context = button.closest('section, article, div[class*="card"]');
        const heading = context?.querySelector('h1, h2, h3, h4, h5, h6');
        const contextName = heading?.textContent || Utils.Language.t('accessibility.contentArea');

        if (button.classList.contains('share')) {
            return Utils.Language.isZh() ? `分享 ${contextName}` : `Share ${contextName}`;
        }
        if (button.classList.contains('download')) {
            return Utils.Language.isZh() ? `下載 ${contextName}` : `Download ${contextName}`;
        }
        if (button.classList.contains('close')) {
            return Utils.Language.isZh() ? `關閉 ${contextName}` : `Close ${contextName}`;
        }
        if (button.classList.contains('menu')) {
            return Utils.Language.isZh() ? '開啟選單' : 'Open menu';
        }

        return Utils.Language.isZh() ? '按鈕' : 'Button';
    }

    /**
     * Generate link label based on context and destination
     */
    generateLinkLabel(link) {
        const href = link.getAttribute('href');
        const context = link.closest('section, article, div[class*="card"]');
        const heading = context?.querySelector('h1, h2, h3, h4, h5, h6');
        const contextName = heading?.textContent || '';

        if (href?.startsWith('#')) {
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                const targetHeading = target.querySelector('h1, h2, h3, h4, h5, h6');
                const targetText = targetHeading?.textContent || targetId;
                return Utils.Language.isZh() ? `前往 ${targetText}` : `Go to ${targetText}`;
            }
        }

        if (href?.includes('youtube.com') || href?.includes('youtu.be')) {
            return Utils.Language.isZh() 
                ? `觀看影片：${contextName}` 
                : `Watch video: ${contextName}`;
        }

        if (href?.includes('.pdf') || href?.includes('vixra.org')) {
            return Utils.Language.isZh() 
                ? `下載文件：${contextName}` 
                : `Download document: ${contextName}`;
        }

        return contextName 
            ? Utils.Language.t('accessibility.readMoreLink', { context: contextName })
            : Utils.Language.t('accessibility.defaultLink');
    }

    /**
     * Setup skip links
     */
    setupSkipLinks() {
        // Enhance existing skip link
        const skipLink = document.querySelector('a[href="#main-content"]');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('main-content') || document.querySelector('main');
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

    /**
     * Monitor color contrast
     */
    monitorColorContrast() {
        // This is a simplified contrast checker
        // In production, you might want to use a more comprehensive solution
        const checkContrast = (element) => {
            const styles = window.getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;

            // Basic contrast checking (you might want to implement a more robust solution)
            if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
                const contrast = this.calculateContrast(bgColor, textColor);
                if (contrast < 4.5) {
                    console.warn(`[Accessibility] Low contrast detected on element:`, element, `Contrast ratio: ${contrast.toFixed(2)}`);
                }
            }
        };

        // Check contrast on critical elements
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
        textElements.forEach(checkContrast);
    }

    /**
     * Calculate color contrast ratio (simplified)
     */
    calculateContrast(color1, color2) {
        // This is a very simplified version
        // For production, use a proper color contrast calculation
        const getLuminance = (_color) => {
            // Extract RGB values and calculate relative luminance
            // This is a placeholder implementation
            return 0.5; // Placeholder
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Setup announcement system
     */
    setupAnnouncementSystem() {
        // Announce page load completion
        window.addEventListener('load', () => {
            const loadMessage = Utils.Language.isZh() 
                ? '頁面載入完成。重力離子熱電技術網站已準備就緒。'
                : 'Page loaded. Gravity Ion Thermoelectric Technology website is ready.';
            this.announceToScreenReader(loadMessage);
        });

        // Announce navigation changes
        if (typeof NavigationController !== 'undefined') {
            document.addEventListener('navigationchange', (e) => {
                const sectionName = e.detail.sectionName || Utils.Language.t('accessibility.contentBlock');
                const message = Utils.Language.isZh() 
                    ? `已前往 ${sectionName}` 
                    : `Navigated to ${sectionName}`;
                this.announceToScreenReader(message);
            });
        }
    }

    /**
     * Enhance form accessibility
     */
    enhanceFormAccessibility() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Add form submission feedback
            form.addEventListener('submit', (_e) => {
                const submitMessage = Utils.Language.isZh() 
                    ? '表單已提交，正在處理中...'
                    : 'Form submitted, processing...';
                this.announceToScreenReader(submitMessage, 'assertive');
            });

            // Enhance error handling
            this.setupFormErrorHandling(form);
        });
    }

    /**
     * Setup form error handling
     */
    setupFormErrorHandling(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('invalid', (_e) => {
                const label = this.getInputLabel(input);
                const errorMessage = Utils.Language.isZh() 
                    ? `${label} 輸入有誤，請檢查`
                    : `${label} input is invalid, please check`;
                this.announceToScreenReader(errorMessage, 'assertive');
            });
        });
    }

    /**
     * Get input label text
     */
    getInputLabel(input) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {return label.textContent;}

        const ariaLabel = input.getAttribute('aria-label');
        if (ariaLabel) {return ariaLabel;}

        return input.placeholder || (Utils.Language.isZh() ? '輸入欄位' : 'Input field');
    }

    /**
     * Get all focusable elements
     */
    getFocusableElements() {
        return document.querySelectorAll(this.focusableElements.join(', '));
    }

    /**
     * Get element description for announcements
     */
    getElementDescription(element) {
        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }

        if (element.hasAttribute('aria-labelledby')) {
            const labelId = element.getAttribute('aria-labelledby');
            const label = document.getElementById(labelId);
            if (label) {return label.textContent;}
        }

        return element.textContent || element.tagName.toLowerCase();
    }

    /**
     * Ensure element is visible in viewport
     */
    ensureElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );

        if (!isVisible) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    /**
     * Enhance focus indicators
     */
    enhanceFocusIndicators() {
        // Add enhanced focus styles
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #FFD700 !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
            }
            
            .nav-link:focus {
                background: rgba(255, 215, 0, 0.1) !important;
            }
            
            button:focus, 
            [role="button"]:focus {
                box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.5) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize accessibility enhancer
if (typeof window !== 'undefined') {
    window.AccessibilityEnhancer = new AccessibilityEnhancer();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancer;
}
