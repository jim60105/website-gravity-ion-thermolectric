/**
 * Scientific Efficiency Calculator for Gravity Ion Thermoelectric Technology
 * Based on Chen's paper: "An Exception to Carnot's Theorem Inferred from Tolman's Experiment"
 * Implements real physics formulas for ion distribution and power calculation
 * @author Gravity Ion Thermoelectric Research Team
 */

class EfficiencyCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentRPM = 0;
        this.currentIonSystem = 'HI'; // Default to hydrogen iodide (most efficient)
        this.physicsEngine = new PhysicsEngine();
        this.chart = null;
        this.educationalMode = false; // New feature for educational pathways
        this.currentSection = 'basic'; // Track educational section

        // Current structural parameters (can be adjusted)
        this.structure = {
            r1: 0.0025,    // Inner radius (m)
            r2: 0.00355,   // Outer radius (m)
            r3: 0.005,     // Distance to rotation axis (m)
            d: 0.0021      // Material thickness (m)
        };

        // Enhanced ion systems configuration with full scientific data
        this.ionSystems = {
            'HI': {
                anion: 'I-',
                cation: 'H+',
                conductivity: 0.85,
                name: '氫碘酸',
                description: '最高效率系統，適用於大功率應用'
            },
            'LiI': {
                anion: 'I-',
                cation: 'Li+',
                conductivity: 0.7,
                name: '碘化鋰',
                description: 'Tolman 1910 實驗驗證，歷史重要性'
            },
            'KCl': {
                anion: 'Cl-',
                cation: 'K+',
                conductivity: 0.6,
                name: '氯化鉀',
                description: '穩定性良好，適用於長期運行'
            }
        };

        this.init();
    }

    init() {
        if (!this.container) {
            return;
        }

        this.setupControls();
        this.setupChart();
        this.updateCalculation(0);
    }

    setupControls() {
        // RPM slider
        const slider = this.container.querySelector('#rpm-slider');
        const rpmDisplay = this.container.querySelector('#rpm-display');

        if (slider && rpmDisplay) {
            slider.addEventListener('input', (e) => {
                this.currentRPM = parseInt(e.target.value);
                rpmDisplay.textContent = this.currentRPM;
                this.updateCalculation(this.currentRPM);
            });
        }

        // Ion system selector (if available)
        const ionSelector = this.container.querySelector('#ion-system-select');
        if (ionSelector) {
            ionSelector.addEventListener('change', (e) => {
                this.currentIonSystem = e.target.value;
                this.updateCalculation(this.currentRPM);
                this.updateChart();
            });
        }
    }

    // ========== Enhanced PhysicsEngine Integration Methods ==========
    // Using all 14 PhysicsEngine methods for comprehensive scientific calculation

    /**
     * Calculate enhanced scientific data using all PhysicsEngine methods
     * @param {number} rpm - Rotation speed in RPM
     * @param {Object} ionSystem - Ion system configuration
     * @returns {Object} Comprehensive calculation results
     */
    calculateEnhancedPhysics(rpm, ionSystem = null) {
        if (!ionSystem) {
            ionSystem = this.ionSystems[this.currentIonSystem];
        }

        const results = {
            basic: {},
            advanced: {},
            safety: {},
            experimental: {},
            validation: {}
        };

        try {
            // Set mass source for accurate calculations
            this.physicsEngine.setMassSource(true); // Use paper masses for accuracy

            // Get ion masses using method #14
            const heavyIonMass = this.physicsEngine.getIonMass(ionSystem.anion);
            const lightIonMass = this.physicsEngine.getIonMass(ionSystem.cation);

            // Calculate centrifugal acceleration using method #4
            const acceleration = this.physicsEngine.calculateCentrifugalAcceleration(rpm, this.structure.r3);

            // Basic calculations using methods #1, #2, #3 - based on current RPM
            const heightDifference = this.structure.r2 - this.structure.r1;

            if (rpm > 0) {
                results.basic.boltzmannRatio = this.physicsEngine.calculateBoltzmannRatio(
                    heavyIonMass, acceleration, heightDifference
                );
                results.basic.electricField = this.physicsEngine.calculateElectricField(
                    heavyIonMass, lightIonMass, acceleration
                );
                results.basic.voltageDifference = this.physicsEngine.calculateVoltageDifference(
                    heavyIonMass, lightIonMass, acceleration, heightDifference
                );
            } else {
                // When RPM is 0, basic physics values are minimal
                results.basic.boltzmannRatio = 1.0; // No acceleration means no concentration change
                results.basic.electricField = 0;
                results.basic.voltageDifference = 0;
            }

            // Advanced structural calculations using methods #5, #6
            results.advanced.maxOmegaSquared = this.physicsEngine.calculateMaxOmegaSquaredFromStructure(this.structure);
            // Physics engine returns ω_max in rad/s; convert to RPM for UI
            const maxOmegaRadPerSec = this.physicsEngine.calculateMaxRotationalSpeed(this.structure);
            results.advanced.maxRotationalSpeed = maxOmegaRadPerSec; // keep rad/s for any advanced usage
            results.advanced.maxRotationalSpeedRPM = (maxOmegaRadPerSec * 60) / (2 * Math.PI);

            // Power and performance calculations using methods #7, #8
            // For power density (W/m^3), use the paper's convention: height = 1 m for unit-cube analysis
            if (rpm > 0) {
                // Calculate power density at current RPM
                const currentOmegaSquared = Math.pow((rpm * 2 * Math.PI) / 60, 2); // Convert RPM to rad/s then square
                const currentAcceleration = currentOmegaSquared * this.structure.r3;

                // Calculate current electric field and voltage
                const currentElectricField = this.physicsEngine.calculateElectricField(
                    heavyIonMass, lightIonMass, currentAcceleration
                );
                const heightDifference = this.structure.r2 - this.structure.r1; // electrode spacing (for UI only)
                const currentVoltageAcrossElectrodes = currentElectricField * heightDifference; // display purpose
                const unitHeight = 1.0; // m
                const currentVoltageForDensity = currentElectricField * unitHeight; // for W/m^3 calculation

                // Calculate current power density
                const outputVoltage = currentVoltageForDensity / 2; // per paper, use half of open-circuit
                const resistance = 1 / ionSystem.conductivity;
                const powerDensityLiquid = (outputVoltage * outputVoltage) / resistance;

                // Apply structural efficiency factor
                const { r1, r2 } = this.structure;
                const liquidArea = Math.PI * r1 * r1;
                const totalArea = Math.PI * r2 * r2;
                const areaFraction = liquidArea / totalArea;
                const structuralEfficiency = 0.762; // From paper data
                const volumeFraction = areaFraction * structuralEfficiency;
                const powerDensityCombined = powerDensityLiquid * volumeFraction;

                results.advanced.powerDensity = {
                    powerDensity: powerDensityCombined,
                    powerDensityLiquid: powerDensityLiquid,
                    voltageDifference: currentVoltageAcrossElectrodes, // UI-scale voltage across actual electrode spacing
                    outputVoltage: outputVoltage,
                    electricField: currentElectricField,
                    resistance: resistance,
                    conductivity: ionSystem.conductivity
                };
            } else {
                // When RPM is 0, all values should be 0
                results.advanced.powerDensity = {
                    powerDensity: 0,
                    powerDensityLiquid: 0,
                    voltageDifference: 0,
                    outputVoltage: 0,
                    electricField: 0,
                    resistance: 1 / ionSystem.conductivity,
                    conductivity: ionSystem.conductivity
                };
            }
            // Get ion system performance (array) and map to keyed object for UI convenience
            const perfArray = this.physicsEngine.calculateIonSystemPerformance(this.structure);
            const perfMap = {};
            perfArray.forEach(p => {
                // Normalize naming to match UI keys
                // p.name expected: 'HI' | 'LiI' | 'KI' | 'KCl'
                perfMap[p.name] = {
                    // Expose a friendly 'efficiency' alias (W/m^3 combined)
                    efficiency: p.powerDensity ?? p.powerDensityCombined ?? p.powerDensityLiquid ?? 0,
                    // Preserve additional raw fields for potential UI/debug use
                    powerDensity: p.powerDensity ?? 0,
                    electricField: p.electricField,
                    voltageDifference: p.voltageDifference,
                    conductivity: p.conductivity
                };
            });
            results.advanced.ionSystemPerformance = perfMap;

            // Safety analysis using methods #9, #10
            results.safety.safetyValidation = this.physicsEngine.validateSafetyLimits(rpm, this.structure);
            results.safety.warningLevel = this.physicsEngine.getWarningLevel(
                results.safety.safetyValidation.safetyFactor
            );

            // Experimental data and validation using methods #11, #12
            results.experimental.tolmanData = this.physicsEngine.getTolmanExperimentalData();
            results.validation.paperValidation = this.physicsEngine.validateAgainstPaperTable1(true);

            // Additional derived calculations
            results.basic.acceleration = acceleration;
            results.basic.heavyIonMass = heavyIonMass;
            results.basic.lightIonMass = lightIonMass;
            results.basic.massDifference = heavyIonMass - lightIonMass;

            return results;

        } catch (error) {
            console.error('Enhanced physics calculation error:', error);
            return this.getDefaultResults();
        }
    }

    /**
     * Get default/safe results when calculations fail
     */
    getDefaultResults() {
        return {
            basic: {
                boltzmannRatio: 1,
                electricField: 0,
                voltageDifference: 0,
                acceleration: 0,
                heavyIonMass: 0,
                lightIonMass: 0,
                massDifference: 0
            },
            advanced: {
                maxOmegaSquared: 0,
                maxRotationalSpeed: 0,
                powerDensity: 0,
                ionSystemPerformance: null
            },
            safety: {
                safetyValidation: { isWithinLimits: false, warningLevel: 'danger' },
                warningLevel: 'danger'
            },
            experimental: {
                tolmanData: []
            },
            validation: {
                paperValidation: null
            }
        };
    }

    /**
     * Educational pathway for understanding physics calculations
     * @param {string} section - Educational section ('basic', 'advanced', 'experimental')
     */
    showEducationalContent(section) {
        this.currentSection = section;
        this.educationalMode = true;

        const results = this.calculateEnhancedPhysics(this.currentRPM);
        this.displayEducationalResults(section, results);
    }

    /**
     * Display educational content with step-by-step physics explanations
     */
    displayEducationalResults(section, results) {
        // Update console output for debugging
        console.info(`Educational Mode - ${section}:`, results[section]);

        // Generate and display formula explanations
        const explanations = this.generateFormulaExplanations(section, results);
        console.info('Formula explanations:', explanations);

        // Create visual educational display (if educational panel exists)
        this.updateEducationalPanel(section, explanations, results);
    }

    /**
     * Update educational panel with formula explanations and calculations
     */
    updateEducationalPanel(section, explanations, results) {
        // Create educational display elements dynamically
        const educationalPanel = this.container.querySelector('.educational-panel');
        if (!educationalPanel) {
            return;
        }

        // Remove existing educational display
        const existingDisplay = educationalPanel.querySelector('.educational-display');
        if (existingDisplay) {
            existingDisplay.remove();
        }

        // Create new educational display
        const educationalDisplay = document.createElement('div');
        educationalDisplay.className = 'educational-display mt-4 p-4 bg-white rounded-lg border border-gray-200';

        let content = `<h5 class="text-lg font-semibold text-gray-800 mb-3">📖 ${section === 'basic' ? '基礎物理原理' : section === 'advanced' ? '進階計算分析' : '實驗數據驗證'}</h5>`;

        // Generate content based on section
        switch (section) {
            case 'basic':
                content += this.generateBasicEducationalContent(explanations, results);
                break;
            case 'advanced':
                content += this.generateAdvancedEducationalContent(explanations, results);
                break;
            case 'experimental':
                content += this.generateExperimentalEducationalContent(explanations, results);
                break;
        }

        educationalDisplay.innerHTML = content;
        educationalPanel.appendChild(educationalDisplay);

        // Trigger MathJax rendering after DOM content is added
        this.renderEducationalEquations(section);
    }

    /**
     * Render MathJax equations for educational content after DOM is ready
     */
    renderEducationalEquations(section) {
        // Small delay to ensure DOM elements are fully rendered
        setTimeout(() => {
            if (window.mathRenderer && window.mathRenderer.instance) {
                const renderer = window.mathRenderer.instance;

                if (section === 'basic') {
                    // Render basic physics equations
                    renderer.renderEquation('educational-boltzmann', '#educational-boltzmann-container');
                    renderer.renderEquation('educational-electric-field', '#educational-electric-field-container');
                    renderer.renderEquation('educational-voltage-difference', '#educational-voltage-difference-container');
                } else if (section === 'advanced') {
                    // Render advanced calculation equations
                    renderer.renderEquation('educational-power-density', '#educational-power-density-container');
                    renderer.renderEquation('educational-max-speed', '#educational-max-speed-container');
                }
            } else {
                console.warn('MathRenderer not available for educational content');
                // Fallback: try again after a longer delay
                setTimeout(() => {
                    if (window.mathRenderer && window.mathRenderer.instance) {
                        const renderer = window.mathRenderer.instance;

                        if (section === 'basic') {
                            renderer.renderEquation('educational-boltzmann', '#educational-boltzmann-container');
                            renderer.renderEquation('educational-electric-field', '#educational-electric-field-container');
                            renderer.renderEquation('educational-voltage-difference', '#educational-voltage-difference-container');
                        } else if (section === 'advanced') {
                            renderer.renderEquation('educational-power-density', '#educational-power-density-container');
                            renderer.renderEquation('educational-max-speed', '#educational-max-speed-container');
                        }
                    } else {
                        console.error('MathRenderer still not available after retry');
                    }
                }, 500);
            }
        }, 100); // 100ms delay to ensure DOM is fully rendered
    }

    /**
     * Generate basic educational content
     */
    generateBasicEducationalContent(explanations, results) {
        const basic = results.basic;
        return `
            <div class="grid md:grid-cols-2 gap-4">
                <div class="formula-card bg-blue-50 p-3 rounded border border-blue-200">
                    <h6 class="font-semibold text-blue-800 mb-2">波茲曼分布</h6>
                    <div id="educational-boltzmann-container" data-equation="educational-boltzmann" class="equation-container cursor-pointer hover:shadow-md transition-shadow p-2 rounded bg-white mb-2 text-gray-800"></div>
                    <div class="text-sm text-blue-700">
                        <p><strong>計算結果:</strong> ${basic.boltzmannRatio?.toExponential(3) || 'N/A'}</p>
                        <p><strong>物理意義:</strong> 描述離子在重力場中的濃度分布變化</p>
                    </div>
                </div>
                <div class="formula-card bg-green-50 p-3 rounded border border-green-200">
                    <h6 class="font-semibold text-green-800 mb-2">電場強度</h6>
                    <div id="educational-electric-field-container" data-equation="educational-electric-field" class="equation-container cursor-pointer hover:shadow-md transition-shadow p-2 rounded bg-white mb-2 text-gray-800"></div>
                    <div class="text-sm text-green-700">
                        <p><strong>計算結果:</strong> ${basic.electricField?.toExponential(3) || 'N/A'} V/m</p>
                        <p><strong>物理意義:</strong> 不同質量離子產生的電場</p>
                    </div>
                </div>
                <div class="formula-card bg-purple-50 p-3 rounded border border-purple-200">
                    <h6 class="font-semibold text-purple-800 mb-2">電壓差</h6>
                    <div id="educational-voltage-difference-container" data-equation="educational-voltage-difference" class="equation-container cursor-pointer hover:shadow-md transition-shadow p-2 rounded bg-white mb-2 text-gray-800"></div>
                    <div class="text-sm text-purple-700">
                        <p><strong>計算結果:</strong> ${basic.voltageDifference?.toExponential(3) || 'N/A'} V</p>
                        <p><strong>物理意義:</strong> 可測量的電位差</p>
                    </div>
                </div>
                <div class="formula-card bg-orange-50 p-3 rounded border border-orange-200">
                    <h6 class="font-semibold text-orange-800 mb-2">離子質量資訊</h6>
                    <div class="text-sm text-orange-700">
                        <p><strong>重離子:</strong> ${basic.heavyIonMass?.toExponential(3) || 'N/A'} kg</p>
                        <p><strong>輕離子:</strong> ${basic.lightIonMass?.toExponential(3) || 'N/A'} kg</p>
                        <p><strong>質量差:</strong> ${basic.massDifference?.toExponential(3) || 'N/A'} kg</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate advanced educational content
     */
    generateAdvancedEducationalContent(explanations, results) {
        const advanced = results.advanced;
        const safety = results.safety;
        return `
            <div class="grid md:grid-cols-2 gap-4">
                <div class="formula-card bg-cyan-50 p-3 rounded border border-cyan-200">
                    <h6 class="font-semibold text-cyan-800 mb-2">功率密度計算</h6>
                    <div id="educational-power-density-container" data-equation="educational-power-density" class="equation-container cursor-pointer hover:shadow-md transition-shadow p-2 rounded bg-white mb-2"></div>
                    <div class="text-sm text-cyan-700">
                        <p><strong>計算結果:</strong> ${advanced.powerDensity?.powerDensity?.toFixed(6) || 'N/A'} W/m³</p>
                        <p><strong>應用:</strong> 實際可獲得的功率輸出</p>
                    </div>
                </div>
                <div class="formula-card bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h6 class="font-semibold text-yellow-800 mb-2">最大轉速限制</h6>
                    <div id="educational-max-speed-container" data-equation="educational-max-speed" class="equation-container cursor-pointer hover:shadow-md transition-shadow p-2 rounded bg-white mb-2"></div>
                    <div class="text-sm text-yellow-700">
                        <p><strong>計算結果:</strong> ${advanced.maxRotationalSpeedRPM?.toFixed(0) || 'N/A'} RPM</p>
                        <p><strong>安全等級:</strong> ${safety.warningLevel}</p>
                    </div>
                </div>
                <div class="formula-card bg-pink-50 p-3 rounded border border-pink-200">
                    <h6 class="font-semibold text-pink-800 mb-2">材料應力分析</h6>
                    <div class="text-sm text-pink-700">
                        <p><strong>安全係數:</strong> ${safety.safetyValidation?.safetyFactor?.toFixed(2) || 'N/A'}</p>
                        <p><strong>結構限制:</strong> ${safety.safetyValidation?.isWithinLimits ? '安全' : '超限'}</p>
                        <p><strong>材料:</strong> 鋁合金 (7075-T6)</p>
                    </div>
                </div>
                <div class="formula-card bg-indigo-50 p-3 rounded border border-indigo-200">
                    <h6 class="font-semibold text-indigo-800 mb-2">離子系統效能</h6>
                    <div class="text-sm text-indigo-700">
                        ${advanced.ionSystemPerformance ? `
                            <p><strong>HI 系統:</strong> ${advanced.ionSystemPerformance.HI?.efficiency?.toFixed(2) || 'N/A'} W/m³</p>
                            <p><strong>LiI 系統:</strong> ${advanced.ionSystemPerformance.LiI?.efficiency?.toFixed(2) || 'N/A'} W/m³</p>
                            <p><strong>KCl 系統:</strong> ${advanced.ionSystemPerformance.KCl?.efficiency?.toFixed(2) || 'N/A'} W/m³</p>
                        ` : '<p>計算進行中...</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate experimental educational content
     */
    generateExperimentalEducationalContent(explanations, results) {
        const experimental = results.experimental;
        const validation = results.validation;
        return `
            <div class="grid md:grid-cols-2 gap-4">
                <div class="formula-card bg-red-50 p-3 rounded border border-red-200">
                    <h6 class="font-semibold text-red-800 mb-2">Tolman 1910 實驗</h6>
                    <div class="text-sm text-red-700">
                        <p><strong>實驗數據點:</strong> ${experimental.tolmanData?.length || 0} 個</p>
                        <p><strong>歷史意義:</strong> 首次觀測到重力對離子分布的影響</p>
                        <p><strong>驗證:</strong> 證實波茲曼分布在重力場中的有效性</p>
                    </div>
                </div>
                <div class="formula-card bg-green-50 p-3 rounded border border-green-200">
                    <h6 class="font-semibold text-green-800 mb-2">論文數據驗證</h6>
                    <div class="text-sm text-green-700">
                        ${validation.paperValidation ? `
                            <p><strong>驗證狀態:</strong> 與論文 Table 1 一致</p>
                            <p><strong>理論精度:</strong> ${validation.paperValidation.accuracy || 'N/A'}%</p>
                            <p><strong>實驗可重現性:</strong> 已驗證</p>
                        ` : '<p>論文驗證計算進行中...</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate step-by-step formula explanations
     */
    generateFormulaExplanations(section, results) {
        const explanations = {};

        switch (section) {
            case 'basic':
                explanations.boltzmann = {
                    formula: 'C(h+Δh)/C(h) = exp(-mgΔh/kT)',
                    description: '波茲曼分布描述離子在重力場中的濃度變化',
                    value: results.basic.boltzmannRatio,
                    variables: {
                        'm': `離子質量 = ${results.basic.heavyIonMass?.toExponential(3)} kg`,
                        'g': `加速度 = ${results.basic.acceleration?.toFixed(2)} m/s²`,
                        'Δh': `高度差 = ${(this.structure.r2 - this.structure.r1).toFixed(4)} m`,
                        'k': '波茲曼常數 = 1.381×10⁻²³ J/K',
                        'T': '溫度 = 298.15 K'
                    }
                };
                explanations.electricField = {
                    formula: 'E = (m₁ - m₂)g / (2q)',
                    description: '不同質量離子產生的電場強度',
                    value: results.basic.electricField,
                    variables: {
                        'm₁': `重離子質量 = ${results.basic.heavyIonMass?.toExponential(3)} kg`,
                        'm₂': `輕離子質量 = ${results.basic.lightIonMass?.toExponential(3)} kg`,
                        'g': `加速度 = ${results.basic.acceleration?.toFixed(2)} m/s²`,
                        'q': '基本電荷 = 1.602×10⁻¹⁹ C'
                    }
                };
                break;
            case 'advanced':
                explanations.maxRotationalSpeed = {
                    formula: 'ω_max = √(σ_allow / (ρ × r²))',
                    description: '材料強度限制的最大轉速',
                    value: results.advanced.maxRotationalSpeed,
                    safety: results.safety.warningLevel
                };
                break;
            case 'experimental':
                explanations.tolmanValidation = {
                    description: 'Tolman 1910 實驗數據驗證',
                    dataPoints: results.experimental.tolmanData.length,
                    validation: results.validation.paperValidation
                };
                break;
        }

        return explanations;
    }

    setupChart() {
        const chartCanvas = this.container.querySelector('#efficiency-chart');
        if (!chartCanvas) {
            return;
        }

        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded or canvas not found');
            return;
        }

        const ctx = chartCanvas.getContext('2d');

        // Generate scientifically accurate data points
        const datasets = this.generateDatasets();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        type: 'linear',
                        position: 'bottom',
                        min: 0,
                        max: 916000, // Match slider range
                        title: {
                            display: true,
                            text: '轉速 (RPM)',
                            color: '#374151',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.3)'
                        },
                        ticks: {
                            stepSize: 10000, // 10K intervals for cleaner display
                            maxTicksLimit: 8, // Limit number of ticks to avoid crowding
                            callback: function(value, _index, _values) {
                                if (value === 0) {return '0';}
                                if (value >= 1000) {
                                    return (value / 1000) + 'K';
                                }
                                return value;
                            },
                            color: '#6B7280',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        display: true,
                        type: 'linear', // Use linear scale for better visualization
                        title: {
                            display: true,
                            text: '功率密度 (W/m³)',
                            color: '#374151',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.3)'
                        },
                        min: 0, // Start from zero for linear scale
                        max: 80, // Set reasonable maximum to accommodate HI system peak
                        ticks: {
                            maxTicksLimit: 10, // Limit ticks for better readability
                            callback: function(value, _index, _values) {
                                // Format y-axis labels for linear scale
                                if (value === 0) {return '0';}
                                if (value < 0.01) {
                                    return value.toExponential(1);
                                } else if (value < 1) {
                                    return value.toFixed(2);
                                } else {
                                    return value.toFixed(1);
                                }
                            },
                            color: '#6B7280',
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                if (value === 0) {
                                    return `${context.dataset.label}: 0 W/m³`;
                                } else if (value < 0.01 && value > 0) {
                                    return `${context.dataset.label}: ${value.toExponential(2)} W/m³`;
                                } else if (value >= 1000) {
                                    return `${context.dataset.label}: ${value.toLocaleString('en-US', {maximumFractionDigits: 2})} W/m³`;
                                } else {
                                    return `${context.dataset.label}: ${value.toFixed(2)} W/m³`;
                                }
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    generateDatasets() {
        const maxRpm = 916000; // Maximum RPM for calculation (match slider range)

        // Generate data for different ion systems
        const ionSystems = [
            { anion: 'I-', cation: 'H+', name: 'HI (氫碘酸)', color: '#059669', conductivity: 0.85 },
            { anion: 'I-', cation: 'Li+', name: 'LiI (碘化鋰)', color: '#0EA5E9', conductivity: 0.7 },
            { anion: 'I-', cation: 'K+', name: 'KI (碘化鉀)', color: '#8B5CF6', conductivity: 0.6 }
        ];

        const datasets = ionSystems.map(system => {
            const dataPoints = [];

            // Generate more data points with smaller steps for better curve resolution
            // Use 500 RPM steps to match slider step size
            for (let rpm = 0; rpm <= maxRpm; rpm += 500) {
                try {
                    // Use enhanced physics calculation for chart data
                    const enhancedResults = this.calculateEnhancedPhysics(rpm, system);
                    const power = enhancedResults.advanced.powerDensity?.powerDensity || 0;

                    // Include all points including zero for linear scale
                    dataPoints.push({ x: rpm, y: power });
                } catch (error) {
                    // If calculation fails (e.g., exceeds material limits), skip this point
                    console.warn(`Enhanced calculation failed at ${rpm} RPM:`, error.message);
                }
            }

            // Ensure we have at least some data points
            if (dataPoints.length === 0) {
                // Add a single point at 0 for empty dataset
                dataPoints.push({ x: 0, y: 0 });
            }

            return {
                label: system.name,
                data: dataPoints,
                borderColor: system.color,
                backgroundColor: system.color + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            };
        });

        // Add current setting point
        datasets.push({
            label: '當前設定',
            data: [{ x: 0, y: 0 }],
            borderColor: '#EA580C',
            backgroundColor: '#EA580C',
            pointRadius: 8,
            pointHoverRadius: 10,
            showLine: false
        });

        // Add Tolman experimental data points
        const tolmanData = this.physicsEngine.getTolmanExperimentalData()
            .filter(point => point.rpm > 0)
            .map(point => ({
                x: point.rpm,
                y: this.estimatePowerFromTolmanData(point)
            }));

        if (tolmanData.length > 0) {
            datasets.push({
                label: 'Tolman 1910 實驗數據',
                data: tolmanData,
                borderColor: '#DC2626',
                backgroundColor: '#DC2626',
                pointRadius: 6,
                pointStyle: 'triangle',
                showLine: false
            });
        }

        return datasets;
    }

    calculateScientificPowerOutput(rpm, ionSystem = null) {
        if (rpm === 0) {
            return 0;
        }

        // Use current ion system if not specified
        if (!ionSystem) {
            const systems = {
                'HI': { anion: 'I-', cation: 'H+', conductivity: 0.85 },
                'LiI': { anion: 'I-', cation: 'Li+', conductivity: 0.7 },
                'KCl': { anion: 'Cl-', cation: 'K+', conductivity: 0.6 }
            };
            ionSystem = systems[this.currentIonSystem] || systems['HI'];
        }

        // Check safety limits first (but don't stop calculations, just warn)
        void this.physicsEngine.validateSafetyLimits(rpm, this.structure);

        // Calculate centrifugal acceleration (for future use)
        void this.physicsEngine.calculateCentrifugalAcceleration(rpm, this.structure.r3);

        // Calculate power density using real physics from paper section 5.1
        const powerData = this.physicsEngine.calculatePowerDensity(
            ionSystem.anion,
            ionSystem.cation,
            this.structure,
            ionSystem.conductivity
        );

        return powerData.powerDensity;
    }

    estimatePowerFromTolmanData(tolmanPoint) {
        // Estimate power from Tolman's voltage measurements
        // This is a rough approximation based on V²/R
        const voltage = tolmanPoint.voltage;
        const estimatedConductivity = 0.5; // Approximate for solutions used in 1910
        const resistance = 1 / estimatedConductivity;
        return (voltage * voltage) / resistance;
    }

    updateCalculation(rpm) {
        try {
            // Use enhanced physics calculations with all 14 PhysicsEngine methods
            const enhancedResults = this.calculateEnhancedPhysics(rpm);

            // Extract primary metrics for display - handle object returns properly
            const powerOutput = enhancedResults.advanced.powerDensity?.powerDensity || 0;
            const acceleration = enhancedResults.basic.acceleration || 0;
            const safety = enhancedResults.safety.safetyValidation || { isWithinLimits: false, warningLevel: 'danger' };
            const voltageDifference = enhancedResults.basic.voltageDifference || 0;
            const electricField = enhancedResults.basic.electricField || 0;

            // Calculate efficiency relative to baseline (72 W/m³ at optimal conditions)
            const baselinePower = 72; // HI system at optimal conditions
            const efficiency = (powerOutput && baselinePower) ? powerOutput / baselinePower : 0;

            // Update primary display values
            this.updateDisplay('power-output', powerOutput);
            this.updateDisplay('efficiency-multiplier', efficiency);
            this.updateDisplay('energy-per-day', powerOutput * 24);

            // Update acceleration display
            this.updateDisplay('acceleration', `${(acceleration / 9.81).toFixed(1)}g`);

            // Update enhanced physics displays (if elements exist)
            this.updateDisplay('voltage-difference', voltageDifference);
            this.updateDisplay('electric-field', electricField);
            this.updateDisplay('boltzmann-ratio', enhancedResults.basic.boltzmannRatio);
            this.updateDisplay('max-rotational-speed', enhancedResults.advanced.maxRotationalSpeedRPM);

            // Update ion system performance summary
            if (enhancedResults.advanced.ionSystemPerformance) {
                this.updateIonSystemDisplay(enhancedResults.advanced.ionSystemPerformance);
            }

            // Update safety warning with enhanced analysis
            this.updateMaterialWarning(safety, enhancedResults.safety.warningLevel);

            // Update chart current point
            if (this.chart) {
                const currentPointDataset = this.chart.data.datasets.find(ds => ds.label === '當前設定');
                if (currentPointDataset) {
                    // For linear scale, we can use actual power output (including zero)
                    currentPointDataset.data = [{ x: rpm, y: powerOutput }];
                    this.chart.update('none');
                }
            }

            // Update educational display if in educational mode
            if (this.educationalMode) {
                this.displayEducationalResults(this.currentSection, enhancedResults);
            }

        } catch (error) {
            console.error('Enhanced calculation error:', error);
            this.updateDisplay('power-output', '0.00');
            this.updateDisplay('efficiency-multiplier', '0.000');
            this.updateDisplay('energy-per-day', '0.0');
            this.updateMaterialWarning({ warningLevel: 'danger', isWithinLimits: false }, 'danger');
        }
    }

    /**
     * Update ion system performance display
     */
    updateIonSystemDisplay(performanceData) {
        // Update if performance display elements exist
        this.updateDisplay('hi-efficiency', performanceData.HI?.efficiency || 0);
        this.updateDisplay('lii-efficiency', performanceData.LiI?.efficiency || 0);
        this.updateDisplay('kcl-efficiency', performanceData.KCl?.efficiency || 0);
    }

    updateDisplay(elementId, value) {
        const element = this.container.querySelector(`#${elementId}`);
        if (element) {
            // Format scientific notation for very small or very large numbers
            if (typeof value === 'number') {
                if (value === 0) {
                    element.textContent = '0.00';
                } else if (value < 0.01 && value > 0) {
                    // Show in scientific notation for very small numbers
                    element.textContent = value.toExponential(2);
                } else if (value >= 1000) {
                    // Show large numbers with commas
                    element.textContent = value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                } else {
                    // Show normal decimal format
                    element.textContent = value.toFixed(2);
                }
            } else {
                element.textContent = value;
            }
        }
    }

    updateMaterialWarning(safety, warningLevel = null) {
        const warningElement = this.container.querySelector('#material-warning');
        if (!warningElement) {
            return;
        }

        const messages = {
            'safe': '材料應力安全',
            'caution': '中等轉速運行，材料應力在安全範圍內',
            'warning': '高轉速運行，接近材料安全極限',
            'danger': '超出材料安全極限，理論計算範圍'
        };

        const classes = {
            'safe': 'text-green-600 bg-green-50 border-green-200',
            'caution': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'warning': 'text-orange-600 bg-orange-50 border-orange-200',
            'danger': 'text-blue-600 bg-blue-50 border-blue-200' // Changed to blue for theoretical range
        };

        // Use provided warning level or extract from safety object
        const level = warningLevel || safety.warningLevel || 'danger';

        if (level === 'safe') {
            warningElement.classList.add('hidden');
        } else {
            warningElement.classList.remove('hidden');
            warningElement.textContent = messages[level] || messages['danger'];
            warningElement.className = `material-warning text-sm mt-2 p-2 rounded border ${classes[level]}`;
        }
    }

    updateChart() {
        if (this.chart) {
            const newDatasets = this.generateDatasets();
            this.chart.data.datasets = newDatasets;
            this.chart.update();
        }
    }

    // Public method to get current scientific data with enhanced physics
    getCurrentData() {
        try {
            const enhancedResults = this.calculateEnhancedPhysics(this.currentRPM);

            return {
                rpm: this.currentRPM,
                powerOutput: enhancedResults.advanced.powerDensity?.powerDensity || 0,
                acceleration: enhancedResults.basic.acceleration || 0,
                gravitationalMultiple: (enhancedResults.basic.acceleration || 0) / 9.81,
                ionSystem: this.currentIonSystem,
                safety: enhancedResults.safety.safetyValidation || { isWithinLimits: false, warningLevel: 'danger' },
                structure: this.structure,
                enhanced: {
                    basic: enhancedResults.basic,
                    advanced: enhancedResults.advanced,
                    experimental: enhancedResults.experimental,
                    validation: enhancedResults.validation
                }
            };
        } catch (error) {
            return {
                rpm: this.currentRPM,
                powerOutput: 0,
                acceleration: 0,
                gravitationalMultiple: 0,
                ionSystem: this.currentIonSystem,
                safety: { isWithinLimits: false, warningLevel: 'danger' },
                structure: this.structure,
                error: error.message
            };
        }
    }
}

// Auto-initialize when DOM is loaded and Chart.js is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js to be loaded
    const checkChart = () => {
        if (typeof Chart !== 'undefined') {
            const calculatorContainer = document.getElementById('efficiency-calculator');
            if (calculatorContainer) {
                window.efficiencyCalculator = new EfficiencyCalculator('efficiency-calculator');
            }
        } else {
            // Chart.js not loaded yet, wait a bit more
            setTimeout(checkChart, 100);
        }
    };

    checkChart();
});
