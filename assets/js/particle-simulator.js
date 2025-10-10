/**
 * Interactive Particle Simulator for Scientific Breakthrough Section
 * Provides real-time visualization of gravity-induced ion separation
 * @author Gravity Ion Thermoelectric Research Team
 * @version 1.0.0
 */

/**
 * Interactive Scientific Particle Simulator
 * Based on PhysicsEngine for scientifically accurate simulations
 * Integrates real Boltzmann distribution and electric field calculations
 */
class InteractiveParticleSimulator {
    constructor(canvasId, options = {}) {
        this.canvas = Utils.DOM.select(canvasId);
        if (!this.canvas) {
            console.warn('Canvas element not found for interactive particle simulator');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // Initialize PhysicsEngine for accurate calculations
        this.physicsEngine = window.PhysicsEngine ? new window.PhysicsEngine() : null;

        this.options = {
            particleCount: Utils.Device.isMobile() ? 80 : 120,
            lightParticleRatio: 0.6, // 60% light particles, 40% heavy
            initialAcceleration: 9.81, // 1g in m/s²
            initialTemperature: 298.15, // Room temperature in K
            animationSpeed: 1.0,
            showElectricField: true,
            showTrails: true,
            showBoltzmannDistribution: true,
            ...options
        };

        // Simulation state
        this.particles = [];
        this.electricField = [];
        this.isRunning = false;
        this.animationId = null;
        this.simulationTime = 0;

        // Physics parameters (user-controllable) - new parameter system
        this.acceleration = this.options.initialAcceleration; // m/s² (replaces gravity)
        this.temperature = this.options.initialTemperature; // K (replaces thermalEnergy)
        this.currentIonSystem = 'HI'; // Default to best performance system

        // Ion system configurations based on PhysicsEngine
        this.ionSystems = {
            'HI': {
                name: '氫碘酸 (HI)',
                anion: 'I-',
                cation: 'H+',
                description: '最佳效能系統',
                color: { anion: '#FFD700', cation: '#00BFFF' }
            },
            'LiI': {
                name: '碘化鋰 (LiI)',
                anion: 'I-',
                cation: 'Li+',
                description: 'Tolman 經典系統',
                color: { anion: '#90EE90', cation: '#FF6347' }
            },
            'KCl': {
                name: '氯化鉀 (KCl)',
                anion: 'Cl-',
                cation: 'K+',
                description: '穩定性佳的系統',
                color: { anion: '#87CEEB', cation: '#DDA0DD' }
            }
        };

        // Measurement data - enhanced with PhysicsEngine calculations
        this.measurements = {
            electricFieldStrength: 0,
            separationDegree: 0,
            currentDensity: 0,
            averageHeight: { light: 0, heavy: 0 },
            boltzmannRatio: 1.0,
            safetyStatus: 'safe',
            powerDensity: 0
        };

        this.init();
    }

    /**
     * Initialize the particle simulator
     */
    init() {
        this.setupCanvas();
        this.createParticleSystem();
        this.setupControls();
        this.setupMeasurementDisplay();
        this.start();
    }

    /**
     * Setup canvas dimensions and styling
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.canvas.width = rect.width;
        this.canvas.height = 384; // Fixed height for consistent simulation

        // Handle resize
        window.addEventListener('resize', Utils.Performance.debounce(() => {
            this.setupCanvas();
            this.createParticleSystem();
        }, 250));
    }

    /**
     * Create the particle system based on selected ion system
     */
    createParticleSystem() {
        this.particles = [];
        const totalParticles = this.options.particleCount;
        const anionCount = Math.floor(totalParticles * this.options.lightParticleRatio);
        const cationCount = totalParticles - anionCount;

        const ionSystem = this.ionSystems[this.currentIonSystem];

        // Create anion particles (typically lighter, move upward)
        for (let i = 0; i < anionCount; i++) {
            this.particles.push(this.createAnionParticle(ionSystem));
        }

        // Create cation particles (typically heavier, move downward)
        for (let i = 0; i < cationCount; i++) {
            this.particles.push(this.createCationParticle(ionSystem));
        }

        // Create electric field visualization
        this.createElectricFieldLines();
    }

    /**
     * Create an anion particle using PhysicsEngine data
     */
    createAnionParticle(ionSystem) {
        const anionMass = this.physicsEngine.getIonMass(ionSystem.anion);
        const normalizedMass = anionMass / 1e-26; // Normalize for simulation

        return {
            x: Utils.MathUtils.random(5, this.canvas.width - 5),
            y: Utils.MathUtils.random(5, this.canvas.height - 5),
            vx: Utils.MathUtils.random(-0.5, 0.5),
            vy: Utils.MathUtils.random(-0.5, 0.5),
            mass: normalizedMass,
            actualMass: anionMass, // Store real mass for calculations
            charge: -1, // Negative charge
            size: Math.max(2, Math.min(6, normalizedMass * 2)), // Size based on mass
            color: ionSystem.color.anion,
            type: 'anion',
            ionType: ionSystem.anion,
            trail: [],
            opacity: Utils.MathUtils.random(0.7, 1.0),
            equilibriumReached: false
        };
    }

    /**
     * Create a cation particle using PhysicsEngine data
     */
    createCationParticle(ionSystem) {
        const cationMass = this.physicsEngine.getIonMass(ionSystem.cation);
        const normalizedMass = cationMass / 1e-26; // Normalize for simulation

        return {
            x: Utils.MathUtils.random(5, this.canvas.width - 5),
            y: Utils.MathUtils.random(5, this.canvas.height - 5),
            vx: Utils.MathUtils.random(-0.5, 0.5),
            vy: Utils.MathUtils.random(-0.5, 0.5),
            mass: normalizedMass,
            actualMass: cationMass, // Store real mass for calculations
            charge: 1, // Positive charge
            size: Math.max(2, Math.min(6, normalizedMass * 2)), // Size based on mass
            color: ionSystem.color.cation,
            type: 'cation',
            ionType: ionSystem.cation,
            trail: [],
            opacity: Utils.MathUtils.random(0.7, 1.0),
            equilibriumReached: false
        };
    }

    /**
     * Create electric field lines
     */
    createElectricFieldLines() {
        this.electricField = [];
        const lineCount = 8;

        for (let i = 0; i < lineCount; i++) {
            const x = (this.canvas.width / (lineCount + 1)) * (i + 1);
            this.electricField.push({
                x,
                strength: 0,
                direction: 1, // 1 for upward, -1 for downward
                opacity: 0.3
            });
        }
    }

    /**
     * Setup interactive controls for new parameter system
     */
    setupControls() {
        // Acceleration slider (replaces gravity)
        const accelerationSlider = Utils.DOM.select('#acceleration-slider');
        const accelerationValue = Utils.DOM.select('#acceleration-value');

        if (accelerationSlider && accelerationValue) {
            Utils.DOM.on(accelerationSlider, 'input', (e) => {
                const multiplier = parseFloat(e.target.value);
                this.acceleration = multiplier * 9.81; // Convert to m/s²
                accelerationValue.textContent = `${multiplier}g (${this.acceleration.toFixed(2)} m/s²)`;
                this.resetEquilibrium();
                this.updateDisplayedMeasurements();
            });
        }

        // Temperature slider (now in Kelvin)
        const temperatureSlider = Utils.DOM.select('#temperature-slider');
        const temperatureValue = Utils.DOM.select('#temperature-value');

        if (temperatureSlider && temperatureValue) {
            Utils.DOM.on(temperatureSlider, 'input', (e) => {
                this.temperature = parseFloat(e.target.value);
                const celsius = (this.temperature - 273.15).toFixed(1);
                temperatureValue.textContent = `${this.temperature}K (${celsius}°C)`;
                this.resetEquilibrium();
                this.updateDisplayedMeasurements();
            });
        }

        // Ion system selector
        const ionSystemSelect = Utils.DOM.select('#ion-system-select');
        const ionSystemDescription = Utils.DOM.select('#ion-system-description');

        if (ionSystemSelect && ionSystemDescription) {
            Utils.DOM.on(ionSystemSelect, 'change', (e) => {
                this.currentIonSystem = e.target.value;
                const system = this.ionSystems[this.currentIonSystem];
                ionSystemDescription.textContent = system.description;

                // Recreate particles with new ion system
                this.createParticleSystem();
                this.resetEquilibrium();
                this.updateDisplayedMeasurements();
            });
        }

        // Learning path cards
        const pathCards = document.querySelectorAll('.path-card');
        pathCards.forEach(card => {
            Utils.DOM.on(card, 'click', () => {
                const path = card.dataset.path;
                this.showEducationContent(path);

                // Update active state
                pathCards.forEach(c => c.classList.remove('ring-2', 'ring-electric-blue'));
                card.classList.add('ring-2', 'ring-electric-blue');
            });
        });

        // Reset button
        const resetButton = Utils.DOM.select('#reset-simulation');
        if (resetButton) {
            Utils.DOM.on(resetButton, 'click', () => {
                this.resetSimulation();
            });
        }
    }

    /**
     * Show education content based on selected learning path
     */
    showEducationContent(path) {
        const contentArea = Utils.DOM.select('#theory-content');
        if (!contentArea) {
            return;
        }

        const content = this.getEducationContent(path);
        contentArea.innerHTML = content;
    }

    /**
     * Get education content for different learning paths
     */
    getEducationContent(path) {
        switch (path) {
            case 'basics':
                return `
                    <h4 class="text-lg font-semibold text-electric-blue mb-3">🔬 基礎理論：波茲曼分布</h4>
                    <div class="theory-explanation space-y-4">
                        <p class="text-gray-300">在重力場中，不同質量的粒子會按照波茲曼分布進行空間分布。這是統計力學的基本原理。</p>
                        
                        <div class="equation-box bg-black/50 p-4 rounded-lg">
                            <h5 class="text-energy-gold font-semibold mb-2">波茲曼分布公式：</h5>
                            <div class="text-center text-white font-mono text-lg">
                                C(h+Δh)/C(h) = exp(-mGΔh/kT)
                            </div>
                            <div class="parameter-explanation text-sm text-gray-400 mt-3 grid grid-cols-2 gap-2">
                                <div>m: 粒子質量 (kg)</div>
                                <div>G: 重力加速度 (m/s²)</div>
                                <div>Δh: 高度差 (m)</div>
                                <div>k: 波茲曼常數</div>
                                <div>T: 溫度 (K)</div>
                                <div>C: 濃度</div>
                            </div>
                        </div>
                        
                        <div class="interactive-demo bg-white/5 p-4 rounded-lg">
                            <h5 class="text-white font-semibold mb-2">💡 互動演示</h5>
                            <p class="text-gray-300 text-sm">調整上方的物理參數，觀察波茲曼分布如何影響粒子分離：</p>
                            <ul class="text-gray-300 text-sm mt-2 space-y-1">
                                <li>• <strong>較高溫度</strong>：粒子熱運動增強，分離效果減弱</li>
                                <li>• <strong>較高加速度</strong>：重力效應增強，分離更明顯</li>
                                <li>• <strong>質量差異</strong>：不同離子系統展現不同分離程度</li>
                            </ul>
                        </div>
                    </div>
                `;

            case 'experiments':
                return `
                    <h4 class="text-lg font-semibold text-electric-blue mb-3">⚗️ 實驗重現：歷史與現代</h4>
                    <div class="experiment-content space-y-4">
                        <div class="tolman-experiment bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg">
                            <h5 class="text-energy-gold font-semibold mb-2">📚 Tolman 實驗 (1910)</h5>
                            <p class="text-gray-300 text-sm mb-2">Richard Tolman 首次在離心機中觀察到重力對離子分布的影響，為現代理論奠定基礎。</p>
                            <div class="experimental-data text-xs text-gray-400">
                                <div>• 使用離子：LiI, KI</div>
                                <div>• 轉速：70 RPM</div>
                                <div>• 觀測電壓：4.3mV (LiI), 3.5mV (KI)</div>
                            </div>
                        </div>
                        
                        <div class="chen-experiment bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg">
                            <h5 class="text-energy-gold font-semibold mb-2">🔬 Chen 實驗 (2024)</h5>
                            <p class="text-gray-300 text-sm mb-2">Chen 博士的突破性研究證明了重力離子熱電效應可以持續產生電力。</p>
                            <div class="experimental-data text-xs text-gray-400">
                                <div>• 最佳系統：HI (氫碘酸)</div>
                                <div>• 功率密度：72.23 W/m³</div>
                                <div>• 電場強度：29.97 V/m</div>
                            </div>
                        </div>
                        
                        <div class="current-simulation bg-white/5 p-4 rounded-lg">
                            <h5 class="text-white font-semibold mb-2">🎯 當前模擬對比</h5>
                            <p class="text-gray-300 text-sm">使用上方控制面板重現實驗條件：</p>
                            <div class="comparison-grid grid grid-cols-2 gap-4 mt-3 text-xs">
                                <div>
                                    <div class="text-energy-gold">Tolman 條件</div>
                                    <div class="text-gray-400">KCl系統, 低速旋轉</div>
                                </div>
                                <div>
                                    <div class="text-energy-gold">Chen 條件</div>
                                    <div class="text-gray-400">HI系統, 高加速度</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 'applications':
                return `
                    <h4 class="text-lg font-semibold text-electric-blue mb-3">⚙️ 工程應用：功率計算與系統設計</h4>
                    <div class="applications-content space-y-4">
                        <div class="power-calculation bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg">
                            <h5 class="text-energy-gold font-semibold mb-2">⚡ 功率密度計算</h5>
                            <p class="text-gray-300 text-sm mb-3">實際工程應用需要考慮材料強度限制和安全操作範圍。</p>
                            
                            <div class="calculation-steps text-sm text-gray-300 space-y-2">
                                <div>1. <strong>結構設計</strong>：根據材料強度確定最大轉速</div>
                                <div>2. <strong>離子選擇</strong>：優化質量差以最大化電場</div>
                                <div>3. <strong>溫度控制</strong>：平衡熱運動與分離效果</div>
                                <div>4. <strong>安全監控</strong>：實時監測操作參數</div>
                            </div>
                        </div>
                        
                        <div class="system-comparison bg-black/30 p-4 rounded-lg">
                            <h5 class="text-white font-semibold mb-2">📊 系統性能比較</h5>
                            <div class="performance-grid grid grid-cols-3 gap-3 text-xs">
                                <div class="text-center">
                                    <div class="text-energy-gold font-semibold">HI 系統</div>
                                    <div class="text-green-400">72.23 W/m³</div>
                                    <div class="text-gray-400">最佳效能</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-energy-gold font-semibold">KCl 系統</div>
                                    <div class="text-blue-400">4.514 W/m³</div>
                                    <div class="text-gray-400">穩定可靠</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-energy-gold font-semibold">KI 系統</div>
                                    <div class="text-purple-400">0.282 W/m³</div>
                                    <div class="text-gray-400">安全穩定</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="safety-considerations bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                            <h5 class="text-red-400 font-semibold mb-2">⚠️ 安全考量</h5>
                            <p class="text-gray-300 text-sm">高速旋轉系統需要嚴格的安全監控，包括材料應力分析和失效保護機制。</p>
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="default-content">
                        <h4 class="text-lg font-semibold text-electric-blue mb-3">歡迎使用科學教育模組</h4>
                        <p class="text-gray-300 mb-3">選擇上方的學習路徑來開始探索重力離子熱電技術的科學原理。</p>
                    </div>
                `;
        }
    }

    /**
     * Update displayed measurements in real-time
     */
    updateDisplayedMeasurements() {
        // Update electric field display
        const electricFieldDisplay = Utils.DOM.select('#electric-field-display');
        if (electricFieldDisplay) {
            electricFieldDisplay.textContent = `${this.measurements.electricFieldStrength.toFixed(2)} V/m`;
        }

        // Update safety status with color coding
        const safetyDisplay = Utils.DOM.select('#safety-status-display');
        if (safetyDisplay) {
            const statusColors = {
                'safe': 'text-green-400',
                'caution': 'text-yellow-400',
                'warning': 'text-orange-400',
                'danger': 'text-red-400'
            };

            const statusText = {
                'safe': '安全',
                'caution': '注意',
                'warning': '警告',
                'danger': '危險'
            };

            safetyDisplay.className = `text-lg font-mono ${statusColors[this.measurements.safetyStatus]}`;
            safetyDisplay.textContent = statusText[this.measurements.safetyStatus];
        }

        // Update Boltzmann ratio
        const boltzmannDisplay = Utils.DOM.select('#boltzmann-ratio-display');
        if (boltzmannDisplay) {
            boltzmannDisplay.textContent = this.measurements.boltzmannRatio.toFixed(3);
        }

        // Update power density
        const powerDisplay = Utils.DOM.select('#power-density-display');
        if (powerDisplay) {
            powerDisplay.textContent = `${this.measurements.powerDensity.toFixed(2)} W/m³`;
        }
    }

    /**
     * Setup measurement display updates
     */
    setupMeasurementDisplay() {
        this.measurementElements = {
            electricField: Utils.DOM.select('#electric-field-value'),
            separation: Utils.DOM.select('#separation-value'),
            current: Utils.DOM.select('#current-value')
        };
    }

    /**
     * Reset particle equilibrium state
     */
    resetEquilibrium() {
        this.particles.forEach(particle => {
            particle.equilibriumReached = false;
        });
        this.simulationTime = 0;
    }

    /**
     * Reset entire simulation
     */
    resetSimulation() {
        this.stop();
        this.createParticleSystem();
        this.simulationTime = 0;

        // Reset sliders to default values
        const gravitySlider = Utils.DOM.select('#gravity-slider');
        const temperatureSlider = Utils.DOM.select('#temperature-slider');
        const gravityValue = Utils.DOM.select('#gravity-value');
        const temperatureValue = Utils.DOM.select('#temperature-value');

        if (gravitySlider) {
            gravitySlider.value = this.options.initialGravity;
            this.gravity = this.options.initialGravity;
            if (gravityValue) {gravityValue.textContent = `${this.gravity.toFixed(1)}g`;}
        }

        if (temperatureSlider) {
            temperatureSlider.value = this.options.initialTemperature;
            this.thermalEnergy = this.options.initialTemperature;
            if (temperatureValue) {temperatureValue.textContent = this.thermalEnergy.toFixed(1);}
        }

        this.start();
    }

    /**
     * Start simulation
     */
    start() {
        if (this.isRunning) {return;}
        this.isRunning = true;
        this.animate();
    }

    /**
     * Stop simulation
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) {return;}

        this.updatePhysics();
        this.updateMeasurementDisplays();
        this.render();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Update particle physics using PhysicsEngine calculations
     */
    updatePhysics() {
        this.simulationTime += 0.016; // Assume 60fps

        const ionSystem = this.ionSystems[this.currentIonSystem];

        // Calculate electric field strength using PhysicsEngine
        const anionMass = this.physicsEngine.getIonMass(ionSystem.anion);
        const cationMass = this.physicsEngine.getIonMass(ionSystem.cation);
        const electricFieldStrength = this.physicsEngine.calculateElectricField(
            cationMass, anionMass, this.acceleration
        );

        this.particles.forEach(particle => {
            // Calculate height difference for Boltzmann distribution
            const heightDifference = (this.canvas.height / 2 - particle.y) / 100; // Convert to meters

            // Use PhysicsEngine to calculate concentration ratio
            this.physicsEngine.calculateBoltzmannRatio(
                particle.actualMass,
                this.acceleration,
                heightDifference,
                this.temperature
            );

            // Apply gravitational force based on actual physics
            const gravityForce = this.acceleration * particle.mass * 0.001; // Scale for visualization
            particle.vy += gravityForce;

            // Apply electric force (F = qE) using calculated field
            const electricForce = particle.charge * electricFieldStrength * 0.0001; // Scale for visualization
            particle.vy -= electricForce; // Electric field points upward

            // Apply thermal motion based on temperature (Brownian motion)
            const thermalScale = Math.sqrt(this.temperature / 298.15) * 0.1; // Scale with temperature
            const thermalForceX = (Math.random() - 0.5) * thermalScale;
            const thermalForceY = (Math.random() - 0.5) * thermalScale;

            particle.vx += thermalForceX;
            particle.vy += thermalForceY;

            // Update position
            particle.x += particle.vx * this.options.animationSpeed;
            particle.y += particle.vy * this.options.animationSpeed;

            // Boundary conditions
            this.handleBoundaryCollision(particle);

            // Apply damping
            particle.vx *= 0.995;
            particle.vy *= 0.998;

            // Limit velocity
            const maxVel = 3.0;
            particle.vx = Utils.MathUtils.clamp(particle.vx, -maxVel, maxVel);
            particle.vy = Utils.MathUtils.clamp(particle.vy, -maxVel, maxVel);

            // Update particle trail for visualization
            this.updateParticleTrail(particle);
        });

        // Update measurements using PhysicsEngine calculations
        this.updateMeasurements(electricFieldStrength);

        // Update electric field visualization
        this.updateElectricField();
    }

    /**
     * Update measurements using PhysicsEngine calculations
     */
    updateMeasurements(electricFieldStrength) {
        // Store calculated values for display
        this.measurements.electricFieldStrength = electricFieldStrength;

        // Calculate separation degree based on particle distribution
        this.measurements.separationDegree = this.calculateChargeSeparation();

        // Calculate Boltzmann ratio for current conditions
        const heightDiff = 0.1; // 10cm reference height
        const ionSystem = this.ionSystems[this.currentIonSystem];
        const heavierMass = Math.max(
            this.physicsEngine.getIonMass(ionSystem.anion),
            this.physicsEngine.getIonMass(ionSystem.cation)
        );

        this.measurements.boltzmannRatio = this.physicsEngine.calculateBoltzmannRatio(
            heavierMass, this.acceleration, heightDiff, this.temperature
        );

        // Check safety status (convert acceleration to RPM for validation)
        const estimatedRPM = Math.sqrt(this.acceleration / 0.005) * 60 / (2 * Math.PI);
        const safetyCheck = this.physicsEngine.validateSafetyLimits(estimatedRPM);
        this.measurements.safetyStatus = safetyCheck.warningLevel;

        // Calculate theoretical power density
        try {
            const powerData = this.physicsEngine.calculatePowerDensity(
                ionSystem.anion, ionSystem.cation,
                this.physicsEngine.CONSTANTS.DEFAULT_STRUCTURE,
                0.85
            );
            this.measurements.powerDensity = powerData.powerDensityCombined;
        } catch {
            this.measurements.powerDensity = 0;
        }
    }

    /**
     * Handle particle boundary collisions
     */
    handleBoundaryCollision(particle) {
        if (particle.x <= particle.size || particle.x >= this.canvas.width - particle.size) {
            particle.vx *= -0.8;
            particle.x = Utils.MathUtils.clamp(particle.x, particle.size, this.canvas.width - particle.size);
        }

        if (particle.y <= particle.size || particle.y >= this.canvas.height - particle.size) {
            particle.vy *= -0.6;
            particle.y = Utils.MathUtils.clamp(particle.y, particle.size, this.canvas.height - particle.size);
        }
    }

    /**
     * Update particle trail for visualization
     */
    updateParticleTrail(particle) {
        if (!this.options.showTrails) {return;}

        particle.trail.push({ x: particle.x, y: particle.y });

        // Limit trail length
        if (particle.trail.length > 10) {
            particle.trail.shift();
        }
    }

    /**
     * Calculate electric field strength at given height
     */
    calculateElectricFieldAt(y) {
        // Field strength depends on charge separation
        const normalizedY = y / this.canvas.height;
        const separationEffect = this.calculateChargeSeparation();

        // Electric field is stronger when there's more separation
        return separationEffect * Math.sin(normalizedY * Math.PI) * 0.5;
    }

    /**
     * Calculate charge separation degree
     */
    calculateChargeSeparation() {
        let lightCenterY = 0;
        let heavyCenterY = 0;
        let lightCount = 0;
        let heavyCount = 0;

        this.particles.forEach(particle => {
            if (particle.type === 'light') {
                lightCenterY += particle.y;
                lightCount++;
            } else {
                heavyCenterY += particle.y;
                heavyCount++;
            }
        });

        if (lightCount === 0 || heavyCount === 0) {return 0;}

        lightCenterY /= lightCount;
        heavyCenterY /= heavyCount;

        // Store for measurements
        this.measurements.averageHeight.light = lightCenterY;
        this.measurements.averageHeight.heavy = heavyCenterY;

        // Calculate separation as fraction of canvas height
        const separation = Math.abs(heavyCenterY - lightCenterY) / this.canvas.height;
        return Utils.MathUtils.clamp(separation, 0, 1);
    }

    /**
     * Update electric field visualization
     */
    updateElectricField() {
        const separationDegree = this.calculateChargeSeparation();

        this.electricField.forEach(field => {
            field.strength = separationDegree;
            field.opacity = 0.3 + separationDegree * 0.4;
        });
    }

    /**
     * Update measurement displays
     */
    updateMeasurementDisplays() {
        // Update particle distribution measurements
        this.measurements.separationDegree = this.calculateChargeSeparation();

        // Calculate average heights for light and heavy particles
        let lightSum = 0, heavySum = 0, lightCount = 0, heavyCount = 0;

        this.particles.forEach(particle => {
            if (particle.type === 'light') {
                lightSum += particle.y;
                lightCount++;
            } else {
                heavySum += particle.y;
                heavyCount++;
            }
        });

        this.measurements.averageHeight.light = lightCount > 0 ? lightSum / lightCount : 0;
        this.measurements.averageHeight.heavy = heavyCount > 0 ? heavySum / heavyCount : 0;

        // Update measurement displays if elements exist
        if (this.measurementElements.electricField) {
            this.measurementElements.electricField.textContent =
                this.measurements.electricFieldStrength.toFixed(3);
        }

        if (this.measurementElements.separation) {
            this.measurementElements.separation.textContent =
                (this.measurements.separationDegree * 100).toFixed(1) + '%';
        }
    }

    /**
     * Render the simulation
     */
    render() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw electric field lines
        if (this.options.showElectricField) {
            this.drawElectricField();
        }

        // Draw particle trails
        if (this.options.showTrails) {
            this.drawParticleTrails();
        }

        // Draw particles
        this.drawParticles();

        // Draw additional visual effects
        this.drawVisualEffects();
    }

    /**
     * Draw electric field lines
     */
    drawElectricField() {
        this.ctx.save();

        this.electricField.forEach((field, index) => {
            if (field.strength > 0.1) {
                const time = this.simulationTime * 2 + index * 0.5;
                const opacity = field.opacity * (0.7 + 0.3 * Math.sin(time));

                this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                this.ctx.lineWidth = 1 + field.strength;
                this.ctx.setLineDash([4, 6]);
                this.ctx.lineDashOffset = -time * 8;

                // Draw field line
                this.ctx.beginPath();
                this.ctx.moveTo(field.x, this.canvas.height * 0.9);
                this.ctx.lineTo(field.x, this.canvas.height * 0.1);
                this.ctx.stroke();

                // Draw arrows
                this.drawFieldArrows(field.x, field.strength, opacity);
            }
        });

        this.ctx.restore();
    }

    /**
     * Draw field direction arrows
     */
    drawFieldArrows(x, strength, opacity) {
        const arrowCount = 3;
        const arrowSize = 4 + strength * 2;

        for (let i = 0; i < arrowCount; i++) {
            const y = this.canvas.height * (0.8 - i * 0.25);

            this.ctx.save();
            this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - arrowSize);
            this.ctx.lineTo(x - arrowSize/2, y);
            this.ctx.lineTo(x + arrowSize/2, y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Draw particle trails
     */
    drawParticleTrails() {
        this.particles.forEach(particle => {
            if (particle.trail.length > 1) {
                this.ctx.save();
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.3;

                this.ctx.beginPath();
                this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);

                for (let i = 1; i < particle.trail.length; i++) {
                    this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
                }

                this.ctx.stroke();
                this.ctx.restore();
            }
        });
    }

    /**
     * Draw particles
     */
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;

            // Glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size * 1.5;

            // Main particle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Charge symbol
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${particle.size * 1.2}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            const symbol = particle.charge > 0 ? '+' : '−';
            this.ctx.fillText(symbol, particle.x, particle.y);

            this.ctx.restore();
        });
    }

    /**
     * Draw additional visual effects
     */
    drawVisualEffects() {
        // Draw separation visualization
        this.drawSeparationIndicator();

        // Draw energy flow arrows (if current is flowing)
        if (this.measurements.currentDensity > 0.1) {
            this.drawEnergyFlow();
        }
    }

    /**
     * Draw separation indicator
     */
    drawSeparationIndicator() {
        const lightY = this.measurements.averageHeight.light;
        const heavyY = this.measurements.averageHeight.heavy;

        if (Math.abs(lightY - heavyY) > 10) {
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.setLineDash([2, 4]);
            this.ctx.lineWidth = 1;

            // Light particle center line
            this.ctx.beginPath();
            this.ctx.moveTo(10, lightY);
            this.ctx.lineTo(this.canvas.width - 10, lightY);
            this.ctx.stroke();

            // Heavy particle center line
            this.ctx.beginPath();
            this.ctx.moveTo(10, heavyY);
            this.ctx.lineTo(this.canvas.width - 10, heavyY);
            this.ctx.stroke();

            this.ctx.restore();
        }
    }

    /**
     * Draw energy flow visualization
     */
    drawEnergyFlow() {
        const time = this.simulationTime * 3;
        const flowCount = 5;

        for (let i = 0; i < flowCount; i++) {
            const x = this.canvas.width * 0.1 + i * (this.canvas.width * 0.8 / flowCount);
            const baseY = this.canvas.height * 0.8;
            const flowY = baseY + Math.sin(time + i) * 20;

            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 68, 68, ${0.6 + 0.4 * Math.sin(time + i)})`;
            this.ctx.beginPath();
            this.ctx.arc(x, flowY, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Destroy the simulator
     */
    destroy() {
        this.stop();
        this.particles = [];
        this.electricField = [];

        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Initialize interactive particle simulator when DOM is ready
let interactiveSimulator;

const initInteractiveSimulator = () => {
    const canvas = Utils.DOM.select('#scientific-particle-canvas');
    if (canvas) {
        interactiveSimulator = new InteractiveParticleSimulator('#scientific-particle-canvas', {
            particleCount: Utils.Device.isMobile() ? 80 : 120,
            showElectricField: true,
            showTrails: true
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveSimulator);
} else {
    initInteractiveSimulator();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InteractiveParticleSimulator };
}

// Make available globally
window.ParticleSimulator = { InteractiveParticleSimulator, instance: interactiveSimulator };