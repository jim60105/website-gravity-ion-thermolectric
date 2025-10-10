/**
 * Language Detection and Management System
 * Supports only two languages: zh (Traditional Chinese) and en (English)
 * @author Gravity Ion Thermoelectric Research Team
 */

class LanguageManager {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = this.loadTranslations();
    }

    /**
     * Detect current language from URL path
     * @returns {string} 'zh' or 'en'
     */
    detectLanguage() {
        const path = window.location.pathname;
        
        if (path.includes('/en/')) {
            return 'en';
        }
        // Default to zh (Chinese)
        return 'zh';
    }

    /**
     * Load translation strings for dynamic content
     * Hardcoded for zh and en only
     */
    loadTranslations() {
        return {
            zh: {
                // Navigation
                nav: {
                    technology: '技術原理',
                    research: '研究成果',
                    breakthrough: '科學突破',
                    evidence: '實驗證據',
                    academic: '學術認可',
                    applications: '應用與影響',
                    team: '研究團隊',
                    contact: '聯絡我們',
                },
                
                // Common UI elements
                common: {
                    loading: '載入中...',
                    error: '發生錯誤',
                    submit: '提交',
                    cancel: '取消',
                    close: '關閉',
                    readMore: '閱讀更多',
                    learnMore: '了解更多',
                },
                
                // Ion systems
                ionSystems: {
                    HI: {
                        name: '氫碘酸',
                        description: '最高效率系統，適用於大功率應用'
                    },
                    LiI: {
                        name: '碘化鋰',
                        description: 'Tolman 1910 實驗驗證，歷史重要性'
                    },
                    KCl: {
                        name: '氯化鉀',
                        description: '穩定性良好,適用於長期運行'
                    }
                },
                
                // Roadmap
                roadmap: {
                    phase1: {
                        description: '完成實驗室原型驗證，建立基礎生產流程'
                    },
                    phase2: {
                        description: '開發可商業化原型，進行市場測試'
                    },
                    phase3: {
                        description: '實現規模化生產，開始商業部署'
                    },
                    phase4: {
                        description: '全球範圍推廣應用，成為主流能源技術'
                    }
                },
                
                // Social sharing
                social: {
                    title: '重力離子熱電轉換技術',
                    description: '無燃料、無污染的綠色能源新紀元。探索突破性的物理發現，顛覆傳統熱力學定律。',
                    copied: '已複製!',
                    shareCount: '已分享：{count} 次'
                },
                
                // Accessibility
                accessibility: {
                    relatedImage: '{context} 相關圖片',
                    defaultImageAlt: '科學研究相關圖片',
                    inputHint: '輸入提示：{placeholder}',
                    defaultInput: '文字輸入',
                    contentArea: '內容',
                    readMoreLink: '閱讀更多：{context}',
                    defaultLink: '連結',
                    contentBlock: '內容區塊'
                },
                
                // Math equations
                math: {
                    boltzmann: {
                        description: '波茲曼分布描述離子在重力場中的濃度分布變化'
                    },
                    electricField: {
                        description: '不同質量離子產生的電場強度'
                    },
                    voltage: {
                        description: '可測量的電位差'
                    },
                    power: {
                        description: '實際可獲得的功率輸出'
                    },
                    maxSpeed: {
                        description: '材料結構的最大安全轉速'
                    }
                },
                
                // Experiment simulation
                experiment: {
                    upward: '向上',
                    downward: '向下'
                },
                
                // Notifications
                notifications: {
                    formSuccess: '訊息已成功發送！',
                    formError: '發送失敗，請稍後再試。',
                    formSending: '發送中...'
                }
            },
            
            en: {
                // Navigation
                nav: {
                    technology: 'Technology',
                    research: 'Research',
                    breakthrough: 'Breakthrough',
                    evidence: 'Evidence',
                    academic: 'Recognition',
                    applications: 'Applications',
                    team: 'Team',
                    contact: 'Contact',
                },
                
                // Common UI elements
                common: {
                    loading: 'Loading...',
                    error: 'Error occurred',
                    submit: 'Submit',
                    cancel: 'Cancel',
                    close: 'Close',
                    readMore: 'Read More',
                    learnMore: 'Learn More',
                },
                
                // Ion systems
                ionSystems: {
                    HI: {
                        name: 'Hydrogen Iodide',
                        description: 'Highest efficiency system for high-power applications'
                    },
                    LiI: {
                        name: 'Lithium Iodide',
                        description: 'Validated by Tolman 1910 experiment, historical significance'
                    },
                    KCl: {
                        name: 'Potassium Chloride',
                        description: 'Good stability for long-term operation'
                    }
                },
                
                // Roadmap
                roadmap: {
                    phase1: {
                        description: 'Complete lab prototype validation, establish basic production process'
                    },
                    phase2: {
                        description: 'Develop commercial prototype, conduct market testing'
                    },
                    phase3: {
                        description: 'Achieve mass production, begin commercial deployment'
                    },
                    phase4: {
                        description: 'Global promotion, become mainstream energy technology'
                    }
                },
                
                // Social sharing
                social: {
                    title: 'Gravity Ion Thermoelectric Conversion',
                    description: 'Fuel-free, pollution-free green energy revolution. Explore breakthrough physics discoveries that challenge traditional thermodynamics.',
                    copied: 'Copied!',
                    shareCount: 'Shared: {count} times'
                },
                
                // Accessibility
                accessibility: {
                    relatedImage: '{context} related image',
                    defaultImageAlt: 'Scientific research related image',
                    inputHint: 'Input hint: {placeholder}',
                    defaultInput: 'Text input',
                    contentArea: 'Content',
                    readMoreLink: 'Read more: {context}',
                    defaultLink: 'Link',
                    contentBlock: 'Content block'
                },
                
                // Math equations
                math: {
                    boltzmann: {
                        description: 'Boltzmann distribution describes ion concentration changes in gravitational field'
                    },
                    electricField: {
                        description: 'Electric field strength generated by ions with different masses'
                    },
                    voltage: {
                        description: 'Measurable voltage difference'
                    },
                    power: {
                        description: 'Actual achievable power output'
                    },
                    maxSpeed: {
                        description: 'Maximum safe rotation speed for material structure'
                    }
                },
                
                // Experiment simulation
                experiment: {
                    upward: 'Upward',
                    downward: 'Downward'
                },
                
                // Notifications
                notifications: {
                    formSuccess: 'Message sent successfully!',
                    formError: 'Failed to send. Please try again later.',
                    formSending: 'Sending...'
                }
            }
        };
    }

    /**
     * Get translated text
     * @param {string} key - Translation key in dot notation (e.g., 'nav.technology')
     * @param {Object} params - Parameters for string interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        // Simple string interpolation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }
        
        return value;
    }

    /**
     * Get current language code
     * @returns {string} 'zh' or 'en'
     */
    getCurrentLang() {
        return this.currentLang;
    }

    /**
     * Get alternate language URL
     * @returns {string} URL for alternate language version
     */
    getAlternateUrl() {
        const currentPath = window.location.pathname;
        if (this.currentLang === 'zh') {
            return currentPath.replace('/zh/', '/en/');
        } else {
            return currentPath.replace('/en/', '/zh/');
        }
    }

    /**
     * Get alternate language code
     * @returns {string} 'en' if current is 'zh', vice versa
     */
    getAlternateLang() {
        return this.currentLang === 'zh' ? 'en' : 'zh';
    }

    /**
     * Get language display name
     * @param {string} lang - Language code
     * @returns {string} Display name
     */
    getLangName(lang) {
        return lang === 'zh' ? '正體中文' : 'English';
    }
}

// Create global instance
window.Lang = new LanguageManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}
