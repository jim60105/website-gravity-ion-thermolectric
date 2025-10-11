/**
 * Mathematical Formula Renderer for Scientific Equations
 * Handles MathJax integration and equation visualization
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

/**
 * Math Renderer Class
 * Manages mathematical equation rendering and interactions
 */
class MathRenderer {
    constructor() {
        this.mathJaxReady = false;
        this.equations = new Map();
        this.renderQueue = [];
        this.init();
    }

    /**
     * Initialize MathJax and setup equations
     */
    async init() {
        await this.waitForMathJax();
        this.setupEquations();
        this.processRenderQueue();
        console.info('Math renderer initialized');
    }

    /**
     * Wait for MathJax to be fully loaded
     */
    async waitForMathJax() {
        return new Promise((resolve) => {
            const checkMathJax = () => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    this.mathJaxReady = true;
                    resolve();
                } else {
                    setTimeout(checkMathJax, 50);
                }
            };
            checkMathJax();
        });
    }

    /**
     * Setup scientific equations for the breakthrough section
     */
    setupEquations() {
        // Define Boltzmann equation with gravity and electric field
        this.defineEquation('boltzmann', {
            latex: `n(z) = n_0 \\exp\\left(\\frac{-(m G - q E) z}{k_B T}\\right)`,
            description: 'Modified Boltzmann distribution under gravity and electric field',
            variables: {
                'n(z)': 'Ion concentration at height z',
                'n_0': 'Reference concentration',
                'm': 'Ion mass difference',
                'q': 'Ion charge',
                'E': 'Electric field strength',
                'G': 'Gravitational constant',
                'z': 'Height',
                'k_B': 'Boltzmann constant',
                'T': 'Temperature'
            }
        });

        // Electric field strength equation
        this.defineEquation('electric-field', {
            latex: `E = \\frac{(m_+ - m_-) g}{2q}`,
            description: 'Self-generated electric field strength',
            variables: {
                'E': 'Electric field strength',
                'm_+': 'Heavy ion mass',
                'm_-': 'Light ion mass',
                'g': 'Gravitational acceleration',
                'q': 'Ion charge'
            }
        });

        // Current density equation
        this.defineEquation('current-density', {
            latex: `J = \\sigma E = n q \\mu E`,
            description: 'Current density in ion plasma',
            variables: {
                'J': 'Current density',
                '\\sigma': 'Conductivity',
                'E': 'Electric field',
                'n': 'Ion concentration',
                'q': 'Ion charge',
                '\\mu': 'Ion mobility'
            }
        });

        // Thermal energy equation
        this.defineEquation('thermal-energy', {
            latex: `E_{thermal} = \\frac{3}{2} k_B T`,
            description: 'Average thermal energy per particle',
            variables: {
                'E_{thermal}': 'Thermal energy',
                'k_B': 'Boltzmann constant',
                'T': 'Temperature'
            }
        });

        // ========== Calculator Section Equations ==========

        // Boltzmann distribution for calculator
        this.defineEquation('boltzmann-calculator', {
            latex: `\\frac{C(h+\\Delta h)}{C(h)} = \\exp\\left(\\frac{-mG\\Delta h}{k_B T}\\right)`,
            description: 'Boltzmann distribution ratio in gravitational field',
            variables: {
                'C(h+\\Delta h)': Utils.Language.isZh() ? '高度 h+Δh 處的離子濃度' : 'Ion concentration at height h+Δh',
                'C(h)': Utils.Language.isZh() ? '高度 h 處的離子濃度' : 'Ion concentration at height h',
                'm': Utils.Language.isZh() ? '離子質量差異' : 'Ion mass difference',
                'G': Utils.Language.isZh() ? '重力加速度' : 'Gravitational acceleration',
                '\\Delta h': Utils.Language.isZh() ? '高度差' : 'Height difference',
                'k_B': Utils.Language.isZh() ? '波茲曼常數 (1.38×10⁻²³ J/K)' : 'Boltzmann constant (1.38×10⁻²³ J/K)',
                'T': Utils.Language.isZh() ? '絕對溫度 (K)' : 'Absolute temperature (K)'
            }
        });

        // Electric field strength for calculator
        this.defineEquation('electric-field-calculator', {
            latex: `E = \\frac{(m_1 - m_2)G}{2q}`,
            description: 'Self-generated electric field in ion system',
            variables: {
                'E': Utils.Language.isZh() ? '電場強度 (V/m)' : 'Electric field strength (V/m)',
                'm_1': Utils.Language.isZh() ? '重離子質量 (kg)' : 'Heavy ion mass (kg)',
                'm_2': Utils.Language.isZh() ? '輕離子質量 (kg)' : 'Light ion mass (kg)',
                'G': Utils.Language.isZh() ? '重力加速度 (m/s²)' : 'Gravitational acceleration (m/s²)',
                'q': Utils.Language.isZh() ? '基本電荷 (1.6×10⁻¹⁹ C)' : 'Elementary charge (1.6×10⁻¹⁹ C)'
            }
        });

        // Voltage difference for calculator
        this.defineEquation('voltage-difference-calculator', {
            latex: `\\Delta V = \\frac{(m_1 - m_2)GH}{2q}`,
            description: 'Voltage difference across ion system height',
            variables: {
                '\\Delta V': Utils.Language.isZh() ? '電壓差 (V)' : 'Voltage difference (V)',
                'm_1': Utils.Language.isZh() ? '重離子質量 (kg)' : 'Heavy ion mass (kg)',
                'm_2': Utils.Language.isZh() ? '輕離子質量 (kg)' : 'Light ion mass (kg)',
                'G': Utils.Language.isZh() ? '重力加速度 (m/s²)' : 'Gravitational acceleration (m/s²)',
                'H': Utils.Language.isZh() ? '系統高度 (m)' : 'System height (m)',
                'q': Utils.Language.isZh() ? '基本電荷 (1.6×10⁻¹⁹ C)' : 'Elementary charge (1.6×10⁻¹⁹ C)'
            }
        });

        // Centrifugal acceleration
        this.defineEquation('centrifugal-acceleration', {
            latex: `a = \\omega^2 r`,
            description: 'Centrifugal acceleration in rotating system',
            variables: {
                'a': Utils.Language.isZh() ? '離心加速度 (m/s²)' : 'Centrifugal acceleration (m/s²)',
                '\\omega': Utils.Language.isZh() ? '角速度 (rad/s)' : 'Angular velocity (rad/s)',
                'r': Utils.Language.isZh() ? '旋轉半徑 (m)' : 'Rotation radius (m)'
            }
        });

        // Power density
        this.defineEquation('power-density', {
            latex: `P = \\frac{(\\Delta V/2)^2}{R}`,
            description: 'Power density calculation',
            variables: {
                'P': Utils.Language.isZh() ? '功率密度 (W/m³)' : 'Power density (W/m³)',
                '\\Delta V': Utils.Language.isZh() ? '電壓差 (V)' : 'Voltage difference (V)',
                'R': Utils.Language.isZh() ? '電阻 (Ω)' : 'Resistance (Ω)'
            }
        });

        // Maximum rotational speed
        this.defineEquation('max-rotational-speed', {
            latex: `\\omega_{\\text{max}} = \\sqrt{\\frac{\\sigma_{\\text{allow}}}{\\rho \\times r^2}}`,
            description: 'Maximum safe rotational speed',
            variables: {
                '\\omega_{\\text{max}}': Utils.Language.isZh() ? '最大角速度 (rad/s)' : 'Maximum angular velocity (rad/s)',
                '\\sigma_{\\text{allow}}': Utils.Language.isZh() ? '許用應力 (Pa)' : 'Allowable stress (Pa)',
                '\\rho': Utils.Language.isZh() ? '材料密度 (kg/m³)' : 'Material density (kg/m³)',
                'r': Utils.Language.isZh() ? '旋轉半徑 (m)' : 'Rotation radius (m)'
            }
        });

        // Safety factor
        this.defineEquation('safety-factor', {
            latex: `SF = \\frac{\\sigma_{\\text{allow}}}{\\sigma_{\\text{actual}}}`,
            description: 'Safety factor calculation',
            variables: {
                'SF': Utils.Language.isZh() ? '安全係數 (無因次)' : 'Safety factor (dimensionless)',
                '\\sigma_{\\text{allow}}': Utils.Language.isZh() ? '許用應力 (Pa)' : 'Allowable stress (Pa)',
                '\\sigma_{\\text{actual}}': Utils.Language.isZh() ? '實際應力 (Pa)' : 'Actual stress (Pa)'
            }
        });

        // ========== Educational Content Equations ==========

        // Basic physics - Boltzmann distribution (educational)
        this.defineEquation('educational-boltzmann', {
            latex: `\\frac{C(h+\\Delta h)}{C(h)} = \\exp\\left(\\frac{-mg\\Delta h}{kT}\\right)`,
            description: Utils.Language.isZh() ? '波茲曼分布描述離子在重力場中的濃度分布變化' : 'Boltzmann distribution describes ion concentration distribution changes in a gravitational field',
            variables: {
                'C(h+\\Delta h)': Utils.Language.isZh() ? '高度 h+Δh 處的離子濃度' : 'Ion concentration at height h+Δh',
                'C(h)': Utils.Language.isZh() ? '高度 h 處的離子濃度' : 'Ion concentration at height h',
                'm': Utils.Language.isZh() ? '離子質量差異 (kg)' : 'Ion mass difference (kg)',
                'g': Utils.Language.isZh() ? '重力加速度 (9.81 m/s²)' : 'Gravitational acceleration (9.81 m/s²)',
                '\\Delta h': Utils.Language.isZh() ? '高度差 (m)' : 'Height difference (m)',
                'k': Utils.Language.isZh() ? '波茲曼常數 (1.38×10⁻²³ J/K)' : 'Boltzmann constant (1.38×10⁻²³ J/K)',
                'T': Utils.Language.isZh() ? '絕對溫度 (K)' : 'Absolute temperature (K)'
            }
        });

        // Basic physics - Electric field strength (educational)
        this.defineEquation('educational-electric-field', {
            latex: `E = \\frac{(m_1 - m_2)g}{2q}`,
            description: Utils.Language.isZh() ? '不同質量離子產生的電場強度' : 'Electric field strength generated by ions of different masses',
            variables: {
                'E': Utils.Language.isZh() ? '電場強度 (V/m)' : 'Electric field strength (V/m)',
                'm_1': Utils.Language.isZh() ? '重離子質量 (kg)' : 'Heavy ion mass (kg)',
                'm_2': Utils.Language.isZh() ? '輕離子質量 (kg)' : 'Light ion mass (kg)',
                'g': Utils.Language.isZh() ? '重力加速度 (9.81 m/s²)' : 'Gravitational acceleration (9.81 m/s²)',
                'q': Utils.Language.isZh() ? '離子電荷 (C)' : 'Ion charge (C)'
            }
        });

        // Basic physics - Voltage difference (educational)
        this.defineEquation('educational-voltage-difference', {
            latex: `\\Delta V = \\frac{(m_1 - m_2)GH}{2q}`,
            description: Utils.Language.isZh() ? '可測量的電位差' : 'Measurable potential difference',
            variables: {
                '\\Delta V': Utils.Language.isZh() ? '電壓差 (V)' : 'Voltage difference (V)',
                'm_1': Utils.Language.isZh() ? '重離子質量 (kg)' : 'Heavy ion mass (kg)',
                'm_2': Utils.Language.isZh() ? '輕離子質量 (kg)' : 'Light ion mass (kg)',
                'G': Utils.Language.isZh() ? '重力加速度或離心加速度 (m/s²)' : 'Gravitational or centrifugal acceleration (m/s²)',
                'H': Utils.Language.isZh() ? '有效高度 (m)' : 'Effective height (m)',
                'q': Utils.Language.isZh() ? '離子電荷 (C)' : 'Ion charge (C)'
            }
        });

        // Advanced - Power density (educational)
        this.defineEquation('educational-power-density', {
            latex: `P = \\frac{(\\Delta V/2)^2}{R}`,
            description: Utils.Language.isZh() ? '實際可獲得的功率輸出' : 'Actual achievable power output',
            variables: {
                'P': Utils.Language.isZh() ? '功率密度 (W/m³)' : 'Power density (W/m³)',
                '\\Delta V': Utils.Language.isZh() ? '電壓差 (V)' : 'Voltage difference (V)',
                'R': Utils.Language.isZh() ? '內阻 (Ω)' : 'Internal resistance (Ω)'
            }
        });

        // Advanced - Maximum rotational speed (educational)
        this.defineEquation('educational-max-speed', {
            latex: `\\omega_{\\text{max}} = \\sqrt{\\frac{\\sigma_{\\text{allow}}}{\\rho \\times r^2}}`,
            description: Utils.Language.isZh() ? '材料結構的最大安全轉速' : 'Maximum safe rotational speed of material structure',
            variables: {
                '\\omega_{\\text{max}}': Utils.Language.isZh() ? '最大角速度 (rad/s)' : 'Maximum angular velocity (rad/s)',
                '\\sigma_{\\text{allow}}': Utils.Language.isZh() ? '許用應力 (670 MPa for 7075-T6)' : 'Allowable stress (670 MPa for 7075-T6)',
                '\\rho': Utils.Language.isZh() ? '材料密度 (2810 kg/m³ for 7075-T6)' : 'Material density (2810 kg/m³ for 7075-T6)',
                'r': Utils.Language.isZh() ? '旋轉半徑 (m)' : 'Rotation radius (m)'
            }
        });
    }

    /**
     * Define a mathematical equation
     */
    defineEquation(id, equationData) {
        this.equations.set(id, {
            ...equationData,
            rendered: false,
            element: null
        });
    }

    /**
     * Render equation in specified container
     */
    async renderEquation(equationId, containerId) {
        const equation = this.equations.get(equationId);
        let container;

        // Handle both string selectors and DOM elements
        if (typeof containerId === 'string') {
            container = Utils.DOM.select(containerId);
        } else {
            container = containerId; // It's already a DOM element
        }

        if (!equation || !container) {
            console.warn(`Cannot render equation: ${equationId} in ${containerId}`);
            return;
        }

        if (this.mathJaxReady) {
            await this.performRender(equation, container);
        } else {
            this.renderQueue.push({ equation, container });
        }
    }

    /**
     * Perform the actual rendering
     */
    async performRender(equation, container) {
        // Set LaTeX content
        container.innerHTML = `$$${equation.latex}$$`;

        try {
            // Render with MathJax
            await window.MathJax.typesetPromise([container]);

            equation.rendered = true;
            equation.element = container;

            // Add interactive features
            this.addEquationInteractivity(equation, container);

            console.info(`Rendered equation: ${equation.description}`);
        } catch (error) {
            console.error('MathJax rendering error:', error);
        }
    }

    /**
     * Process queued render requests
     */
    async processRenderQueue() {
        while (this.renderQueue.length > 0) {
            const { equation, container } = this.renderQueue.shift();
            await this.performRender(equation, container);
        }
    }

    /**
     * Add interactivity to rendered equations
     */
    addEquationInteractivity(equation, container) {
        // Add hover effects
        Utils.DOM.on(container, 'mouseenter', () => {
            this.highlightEquation(container);
        });

        Utils.DOM.on(container, 'mouseleave', () => {
            this.unhighlightEquation(container);
        });

        // Add click handler for detailed view
        Utils.DOM.on(container, 'click', () => {
            this.showEquationDetails(equation);
        });

        // Make container focusable for accessibility
        container.setAttribute('tabindex', '0');
        container.setAttribute('role', 'button');
        container.setAttribute('aria-label', `Mathematical equation: ${equation.description}`);

        // Keyboard support
        Utils.DOM.on(container, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showEquationDetails(equation);
            }
        });
    }

    /**
     * Highlight equation on hover
     */
    highlightEquation(container) {
        container.style.transform = 'scale(1.05)';
        container.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        container.style.transition = 'all 0.3s ease';
        container.style.cursor = 'pointer';
    }

    /**
     * Remove equation highlighting
     */
    unhighlightEquation(container) {
        container.style.transform = 'scale(1)';
        container.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
    }

    /**
     * Show detailed equation explanation
     */
    showEquationDetails(equation) {
        const modal = this.createEquationModal(equation);
        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.equation-modal-content').style.transform = 'scale(1)';
        }, 10);
    }

    /**
     * Create detailed equation modal
     */
    createEquationModal(equation) {
        const modal = Utils.DOM.createElement('div', {
            className: 'equation-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4',
            style: 'opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(5px);'
        });

        const content = Utils.DOM.createElement('div', {
            className: 'equation-modal-content bg-gray-900 text-white p-8 rounded-xl max-w-2xl w-full border border-white/20',
            style: 'transform: scale(0.9); transition: transform 0.3s ease;'
        });

        // Modal header
        const header = Utils.DOM.createElement('div', {
            className: 'modal-header text-center mb-6'
        });

        const modalTitle = Utils.Language.isZh() ? '科學方程式詳解' : 'Scientific Equation Details';
        header.innerHTML = `
            <h3 class="text-2xl font-bold text-energy-gold mb-2">${modalTitle}</h3>
            <p class="text-gray-300">${equation.description}</p>
        `;

        // Equation display
        const equationDisplay = Utils.DOM.createElement('div', {
            className: 'equation-display text-center mb-8 p-6 bg-black/30 rounded-lg'
        });

        equationDisplay.innerHTML = `$$${equation.latex}$$`;

        // Variable explanations
        const variablesSection = Utils.DOM.createElement('div', {
            className: 'variables-section mb-6'
        });

        const variablesHTML = Object.entries(equation.variables)
            .map(([symbol, description]) => `
                <div class="variable-row flex items-start space-x-4 mb-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div class="variable-symbol font-mono text-energy-gold font-bold min-w-0 flex-shrink-0">
                        $${symbol}$
                    </div>
                    <div class="variable-description text-gray-300 flex-1">
                        ${description}
                    </div>
                </div>
            `).join('');

        const variablesTitle = Utils.Language.isZh() ? '變數說明' : 'Variable Descriptions';
        variablesSection.innerHTML = `
            <h4 class="text-lg font-semibold text-electric-blue mb-4">${variablesTitle}</h4>
            <div class="variables-list">${variablesHTML}</div>
        `;

        // Physical significance
        const significanceSection = Utils.DOM.createElement('div', {
            className: 'significance-section mb-6'
        });

        const significanceTitle = Utils.Language.isZh() ? '物理意義' : 'Physical Significance';
        significanceSection.innerHTML = `
            <h4 class="text-lg font-semibold text-plasma-purple mb-4">${significanceTitle}</h4>
            <div class="significance-content text-gray-300 leading-relaxed">
                ${this.getPhysicalSignificance(equation)}
            </div>
        `;

        // Close button
        const closeButtonText = Utils.Language.isZh() ? '關閉' : 'Close';
        const closeButton = Utils.DOM.createElement('button', {
            className: 'close-button w-full bg-electric-blue hover:bg-electric-blue/80 text-white py-3 px-6 rounded-lg transition-colors duration-300 font-semibold'
        }, closeButtonText);

        // Assemble modal
        content.appendChild(header);
        content.appendChild(equationDisplay);
        content.appendChild(variablesSection);
        content.appendChild(significanceSection);
        content.appendChild(closeButton);
        modal.appendChild(content);

        // Setup close functionality
        const closeModal = () => {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        Utils.DOM.on(closeButton, 'click', closeModal);
        Utils.DOM.on(modal, 'click', (e) => {
            if (e.target === modal) {closeModal();}
        });

        // Keyboard support
        Utils.DOM.on(document, 'keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escapeHandler);
                closeModal();
            }
        });

        // Render MathJax in modal
        if (this.mathJaxReady) {
            window.MathJax.typesetPromise([modal]);
        }

        return modal;
    }

    /**
     * Get physical significance explanation for equation
     */
    getPhysicalSignificance(equation) {
        const isZh = Utils.Language.isZh();
        const explanations = {
            'Modified Boltzmann distribution under gravity and electric field': isZh ? `
                這個修正的波茲曼分布方程式描述了在重力場和電場共同作用下，離子在不同高度的濃度分布。
                關鍵在於 (m - qE/g) 項，當電場強度 E 達到特定值時，可以部分或完全抵消重力對離子的影響，
                實現前所未有的離子分布控制。
            ` : `
                This modified Boltzmann distribution equation describes ion concentration distribution at different heights under the combined effects of gravitational and electric fields.
                The key lies in the (m - qE/g) term, where the electric field strength E can partially or completely counteract the effect of gravity on ions when reaching specific values,
                achieving unprecedented control of ion distribution.
            `,
            'Self-generated electric field strength': isZh ? `
                這個方程式揭示了自發電場的產生機制。當不同質量的離子在重力場中分離時，會自動產生一個電場，
                其強度正比於離子質量差和重力加速度。這是我們技術的核心物理基礎。
            ` : `
                This equation reveals the mechanism of self-generated electric field. When ions of different masses separate in a gravitational field, an electric field is automatically generated,
                with its strength proportional to the ion mass difference and gravitational acceleration. This is the core physical foundation of our technology.
            `,
            'Current density in ion plasma': isZh ? `
                電流密度方程式說明了在我們的系統中如何產生持續的電流。離子濃度梯度和自發電場共同作用，
                驅動載流子運動，實現熱能到電能的直接轉換。
            ` : `
                The current density equation explains how continuous current is generated in our system. The ion concentration gradient and self-generated electric field work together,
                driving charge carrier movement and achieving direct conversion from thermal to electrical energy.
            `,
            'Average thermal energy per particle': isZh ? `
                熱能方程式描述了粒子的平均熱運動能量。在我們的系統中，這個熱能提供了電子逆電場運動的驅動力，
                實現了在等溫條件下的持續能量輸出。
            ` : `
                The thermal energy equation describes the average thermal kinetic energy of particles. In our system, this thermal energy provides the driving force for electrons to move against the electric field,
                achieving continuous energy output under isothermal conditions.
            `,
            // Calculator equations explanations
            'Boltzmann distribution ratio in gravitational field': isZh ? `
                這是波茲曼分布在重力場中的經典表達式。它描述了離子濃度隨高度的指數變化。
                當離子質量差異 m 越大，或重力場 G 越強時，離子分離效果越明顯，
                這是重力離子熱電技術的物理基礎。在實際應用中，我們使用離心力來增強這個效應。
            ` : `
                This is the classic expression of Boltzmann distribution in a gravitational field. It describes the exponential change of ion concentration with height.
                The larger the ion mass difference m, or the stronger the gravitational field G, the more pronounced the ion separation effect,
                which is the physical foundation of gravity ion thermoelectric technology. In practical applications, we use centrifugal force to enhance this effect.
            `,
            'Self-generated electric field in ion system': isZh ? `
                當不同質量的離子在重力場中達到平衡時，會自發產生一個電場。
                這個電場的強度取決於離子質量差異和重力加速度。
                HI 系統具有最大的質量差異（I⁻ 比 H⁺ 重約 18 倍），因此產生最強的電場。
            ` : `
                When ions of different masses reach equilibrium in a gravitational field, an electric field is spontaneously generated.
                The strength of this electric field depends on the ion mass difference and gravitational acceleration.
                The HI system has the largest mass difference (I⁻ is about 18 times heavier than H⁺), thus generating the strongest electric field.
            `,
            'Voltage difference across ion system height': isZh ? `
                電壓差是電場強度在系統高度上的積分。這個電壓差驅動電流的產生，
                是我們系統的電能輸出源。在離心系統中，有效高度 H 由旋轉半徑決定，
                因此可以通過增加旋轉半徑來提高電壓輸出。
            ` : `
                The voltage difference is the integral of electric field strength over the system height. This voltage difference drives current generation,
                and is the electrical energy output source of our system. In centrifugal systems, the effective height H is determined by the rotation radius,
                so voltage output can be increased by increasing the rotation radius.
            `,
            'Centrifugal acceleration in rotating system': isZh ? `
                離心加速度是我們技術中的關鍵參數。通過旋轉運動，我們可以產生比地球重力強數百萬倍的加速度，
                大幅增強離子分離效應。角速度 ω 和半徑 r 的平方關係意味著即使小幅增加轉速也能顯著提升效能。
            ` : `
                Centrifugal acceleration is a key parameter in our technology. Through rotational motion, we can generate acceleration millions of times stronger than Earth's gravity,
                significantly enhancing the ion separation effect. The quadratic relationship between angular velocity ω and radius r means that even small increases in rotation speed can significantly improve performance.
            `,
            'Power density calculation': isZh ? `
                功率密度公式展現了電壓差如何轉換為實際的電能輸出。
                除以 2 是因為電場的有效值計算，電阻 R 由離子電導率和幾何結構決定。
                這個公式直接關聯到我們系統的經濟效益和實用性。
            ` : `
                The power density formula demonstrates how voltage difference converts to actual electrical energy output.
                Division by 2 is due to effective value calculation of the electric field, and resistance R is determined by ion conductivity and geometric structure.
                This formula directly relates to the economic benefits and practicality of our system.
            `,
            'Maximum safe rotational speed': isZh ? `
                最大轉速受到材料強度限制。這個公式基於離心應力不能超過材料許用應力的原理。
                我們使用鋁合金 7075-T6 作為結構材料，其高強度重量比使我們能達到極高的轉速，
                從而實現強大的離心加速度效應。
            ` : `
                Maximum rotational speed is limited by material strength. This formula is based on the principle that centrifugal stress cannot exceed the material's allowable stress.
                We use aluminum alloy 7075-T6 as structural material, whose high strength-to-weight ratio enables us to achieve extremely high rotational speeds,
                thereby realizing powerful centrifugal acceleration effects.
            `,
            'Safety factor calculation': isZh ? `
                安全係數是工程設計的關鍵參數，確保系統在各種操作條件下都能安全運行。
                我們的設計採用適當的安全係數，平衡性能與可靠性，
                確保長期穩定運行而不會發生結構失效。
            ` : `
                The safety factor is a key parameter in engineering design, ensuring the system operates safely under various operating conditions.
                Our design adopts an appropriate safety factor, balancing performance and reliability,
                ensuring long-term stable operation without structural failure.
            `
        };

        const defaultMessage = isZh 
            ? '這個方程式在重力離子熱電轉換中起關鍵作用。'
            : 'This equation plays a crucial role in gravity ion thermoelectric conversion.';
        return explanations[equation.description] || defaultMessage;
    }

    /**
     * Render all equations marked for automatic rendering
     */
    renderAllEquations() {
        // Render main Boltzmann equation
        this.renderEquation('boltzmann', '#boltzmann-equation');

        // Look for other equation containers
        const equationContainers = Utils.DOM.selectAll('[data-equation]');
        equationContainers.forEach(container => {
            const equationId = container.dataset.equation;
            if (this.equations.has(equationId)) {
                if (container.id) {
                    this.renderEquation(equationId, `#${container.id}`);
                } else {
                    // If no ID, use the container directly
                    this.renderEquation(equationId, container);
                }
            }
        });
    }

    /**
     * Update equation parameters dynamically
     */
    updateEquationParameter(equationId, parameter, value) {
        const equation = this.equations.get(equationId);
        if (!equation || !equation.element) {return;}

        // This would require more advanced LaTeX parsing and replacement
        // For now, we trigger a re-render with updated values
        console.info(`Updated ${parameter} = ${value} in equation ${equationId}`);
    }

    /**
     * Get equation as image (for export functionality)
     */
    async getEquationImage(equationId) {
        const equation = this.equations.get(equationId);
        if (!equation || !equation.element) {return null;}

        // This would convert the rendered MathJax to an image
        // Implementation would depend on specific requirements
        console.info(`Exporting equation ${equationId} as image`);
        return null;
    }

    /**
     * Destroy math renderer
     */
    destroy() {
        this.equations.clear();
        this.renderQueue = [];
        console.info('Math renderer destroyed');
    }
}

// Initialize math renderer when DOM is ready
let mathRenderer;

const initMathRenderer = () => {
    mathRenderer = new MathRenderer();

    // Update global reference after initialization
    window.mathRenderer = { instance: mathRenderer };

    // Auto-render equations after a delay to ensure MathJax is ready
    setTimeout(() => {
        if (mathRenderer.mathJaxReady) {
            mathRenderer.renderAllEquations();
        }
    }, 1000);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMathRenderer);
} else {
    initMathRenderer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MathRenderer };
}

// Make available globally (initial setup)
window.mathRenderer = { instance: null };
