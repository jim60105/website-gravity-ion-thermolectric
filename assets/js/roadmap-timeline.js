/**
 * Development Roadmap Timeline Static Component
 * Displays the static timeline for technology development milestones
 * @author Gravity Ion Thermoelectric Research Team
 */

class RoadmapTimeline {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.milestones = [
            {
                year: '20??',
                get title() {
                    return Utils.Language.isZh() ? '小規模驗證' : 'Small-Scale Validation';
                },
                get description() {
                    return Utils.Language.t('roadmap.phase1.description');
                },
                get achievements() {
                    return Utils.Language.isZh() 
                        ? ['實驗室原型完成', '效率參數確認', '專利申請完成']
                        : ['Lab prototype completed', 'Efficiency parameters confirmed', 'Patent application filed'];
                },
                progress: 75,
                color: '#059669'
            },
            {
                year: '20??',
                get title() {
                    return Utils.Language.isZh() ? '商業化原型' : 'Commercial Prototype';
                },
                get description() {
                    return Utils.Language.t('roadmap.phase2.description');
                },
                get achievements() {
                    return Utils.Language.isZh() 
                        ? ['原型機量產', '市場驗證完成', '合作伙伴建立']
                        : ['Prototype mass production', 'Market validation complete', 'Partners established'];
                },
                progress: 45,
                color: '#0EA5E9'
            },
            {
                year: '20??',
                get title() {
                    return Utils.Language.isZh() ? '大規模部署' : 'Large-Scale Deployment';
                },
                get description() {
                    return Utils.Language.t('roadmap.phase3.description');
                },
                get achievements() {
                    return Utils.Language.isZh() 
                        ? ['工廠建設完成', '產品標準化', '市場占有率5%']
                        : ['Factory construction complete', 'Product standardization', '5% market share'];
                },
                progress: 20,
                color: '#8B5CF6'
            },
            {
                year: '20??',
                get title() {
                    return Utils.Language.isZh() ? '全球推廣' : 'Global Expansion';
                },
                get description() {
                    return Utils.Language.t('roadmap.phase4.description');
                },
                get achievements() {
                    return Utils.Language.isZh() 
                        ? ['全球市場進入', '技術標準確立', '市場占有率25%']
                        : ['Global market entry', 'Technical standards established', '25% market share'];
                },
                progress: 5,
                color: '#F59E0B'
            }
        ];

        this.init();
    }

    init() {
        if (!this.container) {return;}

        this.renderTimeline();
    }

    renderTimeline() {
        const timelineHTML = `
            <div class="roadmap-timeline-container relative">
                <!-- Timeline Line -->
                <div class="timeline-line absolute left-8 top-16 bottom-0 w-1 bg-gradient-to-b from-green-500 via-blue-500 via-purple-500 to-yellow-500 opacity-30"></div>
                
                <!-- Milestones -->
                <div class="milestones-container space-y-12">
                    ${this.milestones.map((milestone, index) => this.renderMilestone(milestone, index)).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = timelineHTML;
    }

    renderMilestone(milestone, index) {
        return `
            <div class="milestone-item relative flex items-start space-x-6" data-milestone="${index}">
                <!-- Milestone Marker -->
                <div class="milestone-marker relative z-10 w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-gray-100 font-bold text-lg"
                     style="background: linear-gradient(135deg, ${milestone.color}, ${this.adjustBrightness(milestone.color, -20)})">
                    ${milestone.year.slice(-2)}
                </div>
                
                <!-- Milestone Content -->
                <div class="milestone-content flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <!-- Header -->
                    <div class="milestone-header mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-2xl font-bold text-gray-800">${milestone.year} - ${milestone.title}</h3>
                            <div class="progress-indicator text-sm text-gray-600">
                                Progress: ${milestone.progress}%
                            </div>
                        </div>
                        <p class="text-gray-800 text-lg">${milestone.description}</p>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="progress-bar-container mb-4">
                        <div class="progress-bar bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div class="progress-fill h-full rounded-full transition-all duration-1000 ease-out"
                                 style="width: ${milestone.progress}%; background: linear-gradient(90deg, ${milestone.color}, ${this.adjustBrightness(milestone.color, 20)})">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Achievements -->
                    <div class="achievements">
                        <h4 class="text-lg font-semibold text-gray-800 mb-3">Key Achievements</h4>
                        <ul class="space-y-2">
                            ${milestone.achievements.map(achievement => `
                                <li class="flex items-center space-x-3 text-gray-800">
                                    <div class="achievement-icon w-2 h-2 rounded-full" style="background-color: ${milestone.color}"></div>
                                    <span>${achievement}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    adjustBrightness(color, percent) {
        // Simple color brightness adjustment
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Public method to add new milestone
    addMilestone(milestone) {
        this.milestones.push(milestone);
        this.renderTimeline();
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('development-roadmap');
    if (timelineContainer) {
        window.roadmapTimeline = new RoadmapTimeline('development-roadmap');
    }
});
