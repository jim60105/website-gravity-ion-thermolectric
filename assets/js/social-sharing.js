/**
 * Social Sharing - Handle social media sharing functionality
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

class SocialSharing {
    constructor() {
        this.shareData = {
            get title() {
                return Utils.Language.t('social.title');
            },
            get description() {
                return Utils.Language.t('social.description');
            },
            url: window.location.href,
            hashtags: ['重力離子', '熱電技術', '綠色能源', '物理突破', 'GravityIon', 'Thermoelectric'],
            image: window.location.origin + '/assets/images/001-energy-flows-from-hot-to-cold-region.webp'
        };
        this.shareCount = this.getStoredShareCount();
        this.init();
    }

    /**
     * Initialize social sharing
     */
    init() {
        this.setupSocialButtons();
        this.setupCopyLinkButton();
        this.updateShareCounter();
        this.addShareAnalytics();

        console.info('Social sharing initialized');
    }

    /**
     * Setup social media buttons
     */
    setupSocialButtons() {
        const socialButtons = document.querySelectorAll('.social-btn');

        socialButtons.forEach(button => {
            const platform = this.getPlatformFromButton(button);
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSocialShare(platform, button);
            });
        });
    }

    /**
     * Get platform name from button classes
     */
    getPlatformFromButton(button) {
        if (button.classList.contains('facebook')) {return 'facebook';}
        if (button.classList.contains('twitter')) {return 'twitter';}
        if (button.classList.contains('linkedin')) {return 'linkedin';}
        if (button.classList.contains('wechat')) {return 'wechat';}
        return 'unknown';
    }

    /**
     * Handle social media sharing
     */
    handleSocialShare(platform, button) {
        // Add click animation
        this.addClickAnimation(button);

        // Get sharing URL
        const shareUrl = this.getShareUrl(platform);

        if (platform === 'wechat') {
            this.handleWeChatShare(button);
        } else {
            this.openShareWindow(shareUrl, platform);
        }

        // Update share count and track
        this.incrementShareCount();
        this.trackShare(platform);

        console.info(`Shared to ${platform}`, { url: shareUrl });
    }

    /**
     * Get share URL for platform
     */
    getShareUrl(platform) {
        const encodedUrl = encodeURIComponent(this.shareData.url);
        const encodedTitle = encodeURIComponent(this.shareData.title);
        const encodedDescription = encodeURIComponent(this.shareData.description);
        const hashtags = this.shareData.hashtags.join(',');

        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
        };

        return urls[platform] || '';
    }

    /**
     * Open share window
     */
    openShareWindow(url, platform) {
        if (!url) {return;}

        const windowFeatures = {
            width: 600,
            height: 500,
            scrollbars: 'yes',
            resizable: 'yes',
            toolbar: 'no',
            menubar: 'no',
            status: 'no',
            directories: 'no',
            location: 'no'
        };

        const featuresString = Object.entries(windowFeatures)
            .map(([key, value]) => `${key}=${value}`)
            .join(',');

        const shareWindow = window.open(url, `share_${platform}`, featuresString);

        if (shareWindow) {
            shareWindow.focus();

            // Check if window was closed to track completion
            const checkClosed = setInterval(() => {
                if (shareWindow.closed) {
                    clearInterval(checkClosed);
                    this.handleShareComplete(platform);
                }
            }, 1000);
        }
    }

    /**
     * Handle WeChat sharing (show QR code)
     */
    handleWeChatShare(_button) {
        this.showWeChatModal();
    }

    /**
     * Show WeChat QR code modal
     */
    showWeChatModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">微信分享</h3>
                    <p class="text-gray-600 text-sm">掃描 QR Code 在微信中分享</p>
                </div>
                
                <div class="mb-6">
                    <div id="wechat-qr" class="inline-block p-4 bg-gray-100 rounded-lg"></div>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm text-gray-600 mb-2">或複製連結手動分享：</p>
                    <div class="flex">
                        <input type="text" value="${this.shareData.url}" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm" 
                               readonly>
                        <button onclick="this.previousElementSibling.select(); document.execCommand('copy'); this.textContent='已複製!'" 
                                class="px-4 py-2 bg-green-500 text-white rounded-r-md text-sm hover:bg-green-600">
                            複製
                        </button>
                    </div>
                </div>
                
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-colors">
                    關閉
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Generate QR code
        this.generateQRCode(this.shareData.url, 'wechat-qr');
    }

    /**
     * Generate QR code for URL
     */
    generateQRCode(url, containerId) {
        // Simple QR code generation using API
        const qrContainer = document.getElementById(containerId);
        if (qrContainer) {
            const qrImg = document.createElement('img');
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
            qrImg.alt = 'QR Code for sharing';
            qrImg.className = 'max-w-full h-auto';
            qrContainer.appendChild(qrImg);
        }
    }

    /**
     * Setup copy link button
     */
    setupCopyLinkButton() {
        const copyButton = document.querySelector('.copy-link-btn');

        if (copyButton) {
            copyButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCopyLink(copyButton);
            });
        }
    }

    /**
     * Handle copy link functionality
     */
    async handleCopyLink(button) {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(this.shareData.url);
            } else {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(this.shareData.url);
            }

            this.showCopySuccess(button);
            this.trackShare('copy_link');

        } catch (error) {
            console.error('Failed to copy link:', error);
            this.showCopyError(button);
        }
    }

    /**
     * Fallback copy to clipboard method
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * Show copy success feedback
     */
    showCopySuccess(button) {
        const originalContent = button.innerHTML;
        const copiedText = Utils.Language.t('social.copied');
        button.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${copiedText}</span>
        `;
        button.classList.add('bg-green-500', 'hover:bg-green-600');

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('bg-green-500', 'hover:bg-green-600');
        }, 2000);
    }

    /**
     * Show copy error feedback
     */
    showCopyError(button) {
        const originalContent = button.innerHTML;
        button.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>複製失敗</span>
        `;
        button.classList.add('bg-red-500', 'hover:bg-red-600');

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('bg-red-500', 'hover:bg-red-600');
        }, 2000);
    }

    /**
     * Add click animation
     */
    addClickAnimation(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    /**
     * Handle share completion
     */
    handleShareComplete(platform) {
        console.info(`Share completed for ${platform}`);

        // Show thank you message
        this.showThankYouMessage(platform);
    }

    /**
     * Show thank you message
     */
    showThankYouMessage(_platform) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 feedback-success';
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>感謝您分享重力離子技術！</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    /**
     * Increment share count
     */
    incrementShareCount() {
        this.shareCount++;
        this.updateShareCounter();
        this.storeShareCount();
    }

    /**
     * Update share counter display
     */
    updateShareCounter() {
        const shareCountElements = document.querySelectorAll('#share-count, #share-counter');
        shareCountElements.forEach(element => {
            if (element.id === 'share-count') {
                element.textContent = Utils.Language.t('social.shareCount', { 
                    count: this.shareCount 
                });
            } else {
                element.textContent = this.shareCount.toString();
            }
        });
    }

    /**
     * Get stored share count
     */
    getStoredShareCount() {
        const stored = localStorage.getItem('social_share_count');
        return stored ? parseInt(stored, 10) : 128; // Start with 128 as shown in HTML
    }

    /**
     * Store share count
     */
    storeShareCount() {
        localStorage.setItem('social_share_count', this.shareCount.toString());
    }

    /**
     * Track share event
     */
    trackShare(platform) {
        if (window.ctaInteractions) {
            window.ctaInteractions.trackInteraction('social_share', {
                platform: platform,
                url: this.shareData.url,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Add share analytics
     */
    addShareAnalytics() {
        // Track share button views
        const shareSection = document.querySelector('.sharing-cta');
        if (shareSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.trackShare('share_section_view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(shareSection);
        }
    }

    /**
     * Get sharing statistics
     */
    getShareStats() {
        return {
            totalShares: this.shareCount,
            platforms: this.getStoredPlatformStats(),
            url: this.shareData.url,
            title: this.shareData.title
        };
    }

    /**
     * Get stored platform statistics
     */
    getStoredPlatformStats() {
        const stored = localStorage.getItem('platform_share_stats');
        return stored ? JSON.parse(stored) : {
            facebook: 0,
            twitter: 0,
            linkedin: 0,
            wechat: 0,
            copy_link: 0
        };
    }

    /**
     * Update platform statistics
     */
    updatePlatformStats(platform) {
        const stats = this.getStoredPlatformStats();
        stats[platform] = (stats[platform] || 0) + 1;
        localStorage.setItem('platform_share_stats', JSON.stringify(stats));
    }

    /**
     * Check if Web Share API is supported
     */
    isWebShareSupported() {
        return 'share' in navigator;
    }

    /**
     * Use native Web Share API if available
     */
    async useNativeShare() {
        if (!this.isWebShareSupported()) {
            return false;
        }

        try {
            await navigator.share({
                title: this.shareData.title,
                text: this.shareData.description,
                url: this.shareData.url
            });

            this.incrementShareCount();
            this.trackShare('native_share');
            return true;
        } catch (error) {
            console.info('Native share cancelled or failed:', error);
            return false;
        }
    }
}

// Initialize Social Sharing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.socialSharing = new SocialSharing();
    });
} else {
    window.socialSharing = new SocialSharing();
}