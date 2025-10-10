/**
 * 技術詳解手風琴組件
 * 處理持續電流產生區塊的展開/收合功能和 YouTube 影片嵌入
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

class TechDetailsAccordion {
    constructor() {
        this.triggerButton = null;
        this.contentContainer = null;
        this.isExpanded = false;
        this.videosLoaded = false;

        this.init();
    }

    /**
     * 初始化組件
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        this.setupAccessibility();
    }

    /**
     * 找到 DOM 元素
     */
    findElements() {
        this.triggerButton = document.getElementById('tech-details-toggle');
        this.contentContainer = document.getElementById('tech-details-content');

        if (!this.triggerButton || !this.contentContainer) {
            console.error('TechDetailsAccordion: Required elements not found');
            return false;
        }

        return true;
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        if (!this.triggerButton) {
            return;
        }

        // 點擊切換
        this.triggerButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // 鍵盤支援
        this.triggerButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // 視窗大小變化時重新計算高度
        window.addEventListener('resize', Utils.Performance.debounce(() => {
            if (this.isExpanded) {
                this.updateContentHeight();
            }
        }, 250));
    }

    /**
     * 設置無障礙功能
     */
    setupAccessibility() {
        if (!this.triggerButton || !this.contentContainer) {
            return;
        }

        // 設置 ARIA 屬性
        this.triggerButton.setAttribute('role', 'button');
        this.triggerButton.setAttribute('aria-expanded', 'false');
        this.triggerButton.setAttribute('aria-controls', 'tech-details-content');

        this.contentContainer.setAttribute('role', 'region');
        this.contentContainer.setAttribute('aria-labelledby', 'tech-details-toggle');
        this.contentContainer.setAttribute('aria-hidden', 'true');
    }

    /**
     * 切換展開/收合狀態
     */
    toggle() {
        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    /**
     * 展開內容
     */
    expand() {
        if (!this.contentContainer || this.isExpanded) {
            return;
        }

        console.info('Expanding tech details accordion');

        // 更新狀態
        this.isExpanded = true;

        // 更新 ARIA 屬性
        this.triggerButton.setAttribute('aria-expanded', 'true');
        this.contentContainer.setAttribute('aria-hidden', 'false');

        // 添加展開樣式
        this.contentContainer.classList.remove('collapsed');
        this.contentContainer.classList.add('expanded');

        // 計算並設置內容高度
        this.updateContentHeight();

        // 初始化影片載入狀態
        if (!this.videosLoaded) {
            setTimeout(() => {
                this.initializeVideos();
            }, 300);
        }

        // 滾動到展開的內容（如果需要的話）
        setTimeout(() => {
            this.scrollToContentIfNeeded();
        }, 500);

        // 觸發自定義事件
        this.dispatchEvent('expanded');
    }

    /**
     * 收合內容
     */
    collapse() {
        if (!this.contentContainer || !this.isExpanded) {
            return;
        }

        console.info('Collapsing tech details accordion');

        // 更新狀態
        this.isExpanded = false;

        // 更新 ARIA 屬性
        this.triggerButton.setAttribute('aria-expanded', 'false');
        this.contentContainer.setAttribute('aria-hidden', 'true');

        // 添加收合樣式
        this.contentContainer.classList.remove('expanded');
        this.contentContainer.classList.add('collapsed');

        // 觸發自定義事件
        this.dispatchEvent('collapsed');
    }

    /**
     * 更新內容高度
     */
    updateContentHeight() {
        if (!this.contentContainer || !this.isExpanded) {
            return;
        }

        const innerContent = this.contentContainer.querySelector('.accordion-inner-content');
        if (innerContent) {
            const height = innerContent.scrollHeight;
            this.contentContainer.style.maxHeight = `${height + 40}px`; // 額外空間
        }
    }

    /**
     * 初始化影片 - 簡化版本，移除載入動畫
     */
    initializeVideos() {
        if (this.videosLoaded) {
            return;
        }

        console.info('Initializing YouTube videos');

        const videoContainers = this.contentContainer.querySelectorAll('.video-container');

        videoContainers.forEach((container, index) => {
            const iframe = container.querySelector('iframe');
            if (iframe) {
                // 設置錯誤處理
                iframe.addEventListener('error', () => {
                    this.handleVideoError(container, index + 1);
                });
            }
        });

        this.videosLoaded = true;
    }

    /**
     * 處理影片載入錯誤
     */
    handleVideoError(container, videoNumber) {
        console.error(`Video ${videoNumber} failed to load`);

        const errorMessage = document.createElement('div');
        errorMessage.className = 'video-error flex items-center justify-center h-full text-gray-400 text-sm';
        const loadFailedText = Utils.Language.isZh() ? '影片載入失敗' : 'Video failed to load';
        const watchOriginalText = Utils.Language.isZh() ? '點此觀看原始影片' : 'Click to watch original video';
        errorMessage.innerHTML = `
            <div class="text-center">
                <div class="mb-2">⚠️</div>
                <div>${loadFailedText}</div>
                <a href="https://youtu.be/NA_FsBknLV0" target="_blank" class="text-energy-gold hover:underline text-xs mt-1 block">
                    ${watchOriginalText}
                </a>
            </div>
        `;

        const iframe = container.querySelector('iframe');
        if (iframe) {
            iframe.style.display = 'none';
            container.appendChild(errorMessage);
        }
    }

    /**
     * 滾動到內容（如果需要的話）
     */
    scrollToContentIfNeeded() {
        if (!this.contentContainer) {
            return;
        }

        const rect = this.contentContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 如果內容底部超出視窗，平滑滾動到合適位置
        if (rect.bottom > viewportHeight) {
            const targetY = window.pageYOffset + rect.top - 100; // 100px 的上邊距

            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    }

    /**
     * 觸發自定義事件
     */
    dispatchEvent(eventType) {
        const event = new CustomEvent(`techDetailsAccordion:${eventType}`, {
            detail: {
                accordion: this,
                isExpanded: this.isExpanded
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * 取得當前狀態
     */
    getState() {
        return {
            isExpanded: this.isExpanded,
            videosLoaded: this.videosLoaded
        };
    }

    /**
     * 銷毀組件
     */
    destroy() {
        if (this.triggerButton) {
            this.triggerButton.removeEventListener('click', this.toggle);
            this.triggerButton.removeEventListener('keydown', this.toggle);
        }

        this.videosLoaded = false;

        console.info('TechDetailsAccordion destroyed');
    }
}

// 自動初始化
document.addEventListener('DOMContentLoaded', () => {
    const techAccordion = new TechDetailsAccordion();

    // 將實例掛載到全局以便調試
    if (typeof window !== 'undefined') {
        window.techDetailsAccordion = techAccordion;
    }
});

// 匯出供模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechDetailsAccordion;
}
