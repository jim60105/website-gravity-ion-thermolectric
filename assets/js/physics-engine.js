/**
 * Physics Engine for Gravity Ion Thermoelectric Technology
 * Based on Chen's paper: "An Exception to Carnot's Theorem Inferred from Tolman's Experiment"
 * Implements real scientific formulas for ion distribution, electric field calculation, and power output
 * @author Gravity Ion Thermoelectric Research Team
 */

class PhysicsEngine {
    constructor() {
        // Physical constants from the paper
        this.CONSTANTS = {
            BOLTZMANN_CONSTANT: 1.380649e-23,     // J/K (Boltzmann constant)
            ELECTRON_CHARGE: 1.602176634e-19,     // C (elementary charge)
            
            // Ion masses (kg) - from paper and atomic data
            ION_MASSES: {
                'H+': 1.1526e-26,                 // Hydrogen ion
                'I-': 2.1073e-25,                 // Iodide ion
                'Li+': 1.1526e-26,                // Lithium ion (approximate)
                'Cl-': 5.887e-26,                 // Chloride ion
                'K+': 6.493e-26                   // Potassium ion
            },
            
            // Material properties for structural calculations
            MATERIAL_PROPERTIES: {
                ALUMINUM_ALLOY_YIELD: 670e6,       // Pa (yield strength)
                ALUMINUM_DENSITY: 2700,            // kg/m³
                SOLUTION_DENSITY: 1000             // kg/m³
            },
            
            // Default structural parameters (from paper Table 1)
            DEFAULT_STRUCTURE: {
                r1: 0.0025,                        // Inner radius (m)
                r2: 0.00355,                       // Outer radius (m) = 1.42 × r1
                r3: 0.005,                         // Distance to rotation axis (m) = 2 × r1
                d: 0.0021                          // Material thickness (m) = 0.84 × r1
            }
        };
        
        this.temperature = 298.15; // Room temperature (K)
    }

    /**
     * Calculate ion concentration ratio using Boltzmann distribution (Equation 1)
     * C(h+Δh)/C(h) = exp(-mGΔh/kT)
     * @param {number} ionMass - Mass of the ion (kg)
     * @param {number} acceleration - Gravitational or centrifugal acceleration (m/s²)
     * @param {number} heightDifference - Height difference (m)
     * @param {number} temperature - Temperature (K)
     * @returns {number} Concentration ratio
     */
    calculateBoltzmannRatio(ionMass, acceleration, heightDifference, temperature = this.temperature) {
        const exponent = -(ionMass * acceleration * heightDifference) / 
                        (this.CONSTANTS.BOLTZMANN_CONSTANT * temperature);
        return Math.exp(exponent);
    }

    /**
     * Calculate electric field strength within ion-containing fluid (Equation 3)
     * E = (m_heavy - m_light)G / (2q)
     * @param {number} heavyIonMass - Mass of heavier ion (kg)
     * @param {number} lightIonMass - Mass of lighter ion (kg)
     * @param {number} acceleration - Gravitational or centrifugal acceleration (m/s²)
     * @returns {number} Electric field strength (V/m)
     */
    calculateElectricField(heavyIonMass, lightIonMass, acceleration) {
        return (heavyIonMass - lightIonMass) * acceleration / (2 * this.CONSTANTS.ELECTRON_CHARGE);
    }

    /**
     * Calculate voltage difference across height (Equation 4)
     * ΔV = (m_heavy - m_light)GH / (2q)
     * @param {number} heavyIonMass - Mass of heavier ion (kg)
     * @param {number} lightIonMass - Mass of lighter ion (kg)
     * @param {number} acceleration - Gravitational or centrifugal acceleration (m/s²)
     * @param {number} height - Height difference (m)
     * @returns {number} Voltage difference (V)
     */
    calculateVoltageDifference(heavyIonMass, lightIonMass, acceleration, height) {
        const electricField = this.calculateElectricField(heavyIonMass, lightIonMass, acceleration);
        return electricField * height;
    }

    /**
     * Calculate centrifugal acceleration
     * G = ω²r where ω = 2πf and f = rpm/60
     * @param {number} rpm - Rotations per minute
     * @param {number} radius - Distance from rotation axis (m)
     * @returns {number} Centrifugal acceleration (m/s²)
     */
    calculateCentrifugalAcceleration(rpm, radius) {
        const omega = (2 * Math.PI * rpm) / 60; // Angular velocity (rad/s)
        return omega * omega * radius;
    }

    /**
     * Calculate maximum rotational speed based on material strength (Equation 11)
     * From the paper's structural analysis
     * @param {Object} structure - Structural parameters {r1, r2, r3, d}
     * @returns {number} Maximum angular velocity (rad/s)
     */
    calculateMaxRotationalSpeed(structure = this.CONSTANTS.DEFAULT_STRUCTURE) {
        const { r1, r2, r3, d } = structure;
        const { ALUMINUM_ALLOY_YIELD: Y, ALUMINUM_DENSITY: rho_solid, SOLUTION_DENSITY: rho_liquid } = 
              this.CONSTANTS.MATERIAL_PROPERTIES;

        const numerator = ((r2*r2 - r1*r1) + (r3 - r1)*d) * Y;
        const denominator = r3*r3 * (rho_solid*(r2*r2 - r1*r1) + rho_liquid*r1*r1);
        
        const omegaSquared = numerator / denominator;
        return Math.sqrt(Math.max(0, omegaSquared)); // Ensure non-negative
    }

    /**
     * Calculate power density for a given ion system (based on paper section 5.1)
     * P = (ΔV/2)² / R, where ΔV/2 is the maximum output voltage
     * @param {string} anion - Anion type (e.g., 'I-', 'Cl-')
     * @param {string} cation - Cation type (e.g., 'H+', 'Li+', 'K+')
     * @param {number} acceleration - Acceleration (m/s²)
     * @param {number} height - Effective height (m)
     * @param {number} conductivity - Solution conductivity (S/m)
     * @returns {Object} Power calculation results
     */
    calculatePowerDensity(anion, cation, acceleration, height, conductivity = 0.85) {
        const anionMass = this.CONSTANTS.ION_MASSES[anion];
        const cationMass = this.CONSTANTS.ION_MASSES[cation];
        
        if (!anionMass || !cationMass) {
            throw new Error(`Unknown ion type: ${anion} or ${cation}`);
        }

        // Calculate voltage difference
        const voltageDifference = this.calculateVoltageDifference(anionMass, cationMass, acceleration, height);
        
        // Maximum output voltage is half the open-circuit voltage
        const outputVoltage = voltageDifference / 2;
        
        // Calculate resistance for 1 m³ (R = 1/σ for unit cube)
        const resistance = 1 / conductivity;
        
        // Power = V²/R
        const powerDensity = (outputVoltage * outputVoltage) / resistance;
        
        return {
            voltageDifference,
            outputVoltage,
            electricField: this.calculateElectricField(anionMass, cationMass, acceleration),
            powerDensity,
            resistance,
            conductivity,
            anionMass,
            cationMass
        };
    }

    /**
     * Get experimental data from Tolman 1910 experiment
     * @returns {Array} Array of experimental data points
     */
    getTolmanExperimentalData() {
        return [
            { solution: 'LiI', rpm: 70, voltage: 4.3e-3, notes: 'Lithium Iodide' },
            { solution: 'KI', rpm: 70, voltage: 3.5e-3, notes: 'Potassium Iodide' },
            // Additional theoretical points based on calculations
            { solution: 'LiI', rpm: 0, voltage: 0, notes: 'Baseline' },
            { solution: 'KI', rpm: 0, voltage: 0, notes: 'Baseline' }
        ];
    }

    /**
     * Calculate theoretical performance for different ion systems
     * @param {number} rpm - Rotation speed
     * @param {Object} structure - Structural parameters
     * @returns {Object} Performance data for different ion systems
     */
    calculateIonSystemPerformance(rpm, structure = this.CONSTANTS.DEFAULT_STRUCTURE) {
        const acceleration = this.calculateCentrifugalAcceleration(rpm, structure.r3);
        const height = structure.r1; // Effective height for calculation
        
        const systems = [
            { anion: 'I-', cation: 'H+', name: 'HI', conductivity: 0.85 },
            { anion: 'Cl-', cation: 'Li+', name: 'LiCl', conductivity: 0.7 },
            { anion: 'Cl-', cation: 'K+', name: 'KCl', conductivity: 0.6 }
        ];

        return systems.map(system => {
            const performance = this.calculatePowerDensity(
                system.anion, 
                system.cation, 
                acceleration, 
                height, 
                system.conductivity
            );
            
            return {
                ...system,
                ...performance,
                rpm,
                acceleration,
                height
            };
        });
    }

    /**
     * Validate if operating conditions are within material safety limits
     * @param {number} rpm - Rotation speed
     * @param {Object} structure - Structural parameters
     * @returns {Object} Safety analysis
     */
    validateSafetyLimits(rpm, structure = this.CONSTANTS.DEFAULT_STRUCTURE) {
        const omega = (2 * Math.PI * rpm) / 60;
        const maxOmega = this.calculateMaxRotationalSpeed(structure);
        const maxRpm = (maxOmega * 60) / (2 * Math.PI);
        
        const safetyFactor = maxOmega > 0 ? omega / maxOmega : Infinity;
        
        return {
            currentRpm: rpm,
            maxSafeRpm: maxRpm,
            safetyFactor,
            isWithinLimits: safetyFactor <= 1.0,
            warningLevel: this.getWarningLevel(safetyFactor)
        };
    }

    /**
     * Get warning level based on safety factor
     * @param {number} safetyFactor - Current safety factor
     * @returns {string} Warning level
     */
    getWarningLevel(safetyFactor) {
        if (safetyFactor <= 0.6) return 'safe';
        if (safetyFactor <= 0.8) return 'caution';
        if (safetyFactor <= 1.0) return 'warning';
        return 'danger';
    }
}

// Export for use in other modules
window.PhysicsEngine = PhysicsEngine;