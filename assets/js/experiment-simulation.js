/**
 * Experiment Simulation for Flip Test
 * Handles the interactive battery flip simulation and real-time data updates
 */

class ExperimentSimulation {
  constructor() {
    this.isFlipped = false;
    this.animationDuration = 1000;
    this.voltageData = {
      upright: {
        top: 0.012,
        bottom: 0.0,
        difference: 0.012,
        get direction() {
          return Utils.Language.t('experiment.upward');
        }
      },
      upsideDown: {
        top: 0.0,
        bottom: 0.012,
        difference: -0.012,
        get direction() {
          return Utils.Language.t('experiment.downward');
        }
      }
    };
    this.init();
  }

  init() {
    this.bindFlipControls();
    this.startIonAnimation();
    this.updateDisplayValues('upright');
  }

  bindFlipControls() {
    const uprightBtn = document.getElementById('flip-upright');
    const upsideDownBtn = document.getElementById('flip-upside-down');

    if (uprightBtn) {
      uprightBtn.addEventListener('click', () => this.flipToUpright());
    }

    if (upsideDownBtn) {
      upsideDownBtn.addEventListener('click', () => this.flipToUpsideDown());
    }
  }

  flipToUpright() {
    if (!this.isFlipped) {return;}

    this.isFlipped = false;
    this.performFlipAnimation();

    setTimeout(() => {
      this.updateDisplayValues('upright');
      this.updateDataVisualization();
    }, this.animationDuration / 2);
  }

  flipToUpsideDown() {
    if (this.isFlipped) {return;}

    this.isFlipped = true;
    this.performFlipAnimation();

    setTimeout(() => {
      this.updateDisplayValues('upsideDown');
      this.updateDataVisualization();
    }, this.animationDuration / 2);
  }

  performFlipAnimation() {
    const batteryContainer = document.getElementById('battery-container');
    if (!batteryContainer) {return;}

    // Add flipped class to trigger CSS animation
    if (this.isFlipped) {
      batteryContainer.classList.add('flipped');
    } else {
      batteryContainer.classList.remove('flipped');
    }

    // Update button states
    this.updateButtonStates();

    // Add visual feedback during animation
    batteryContainer.style.transform += ' scale(1.05)';
    setTimeout(() => {
      batteryContainer.style.transform = batteryContainer.style.transform.replace(' scale(1.05)', '');
    }, this.animationDuration / 4);
  }

  updateButtonStates() {
    const uprightBtn = document.getElementById('flip-upright');
    const upsideDownBtn = document.getElementById('flip-upside-down');

    if (uprightBtn && upsideDownBtn) {
      if (this.isFlipped) {
        uprightBtn.classList.remove('opacity-50');
        uprightBtn.disabled = false;
        upsideDownBtn.classList.add('opacity-50');
        upsideDownBtn.disabled = true;
      } else {
        uprightBtn.classList.add('opacity-50');
        uprightBtn.disabled = true;
        upsideDownBtn.classList.remove('opacity-50');
        upsideDownBtn.disabled = false;
      }
    }
  }

  updateDisplayValues(state) {
    const data = this.voltageData[state];

    // Update voltage indicators (convert to mV for display)
    const topVoltage = document.getElementById('top-voltage');
    const bottomVoltage = document.getElementById('bottom-voltage');

    if (topVoltage && bottomVoltage) {
      topVoltage.textContent = `${data.top > 0 ? '+' : ''}${(data.top * 1000).toFixed(1)}mV`;
      bottomVoltage.textContent = `${data.bottom > 0 ? '+' : ''}${(data.bottom * 1000).toFixed(1)}mV`;

      // Update colors based on polarity
      topVoltage.className = `voltage-value text-lg font-bold ${data.top > 0 ? 'text-red-600' : 'text-blue-600'}`;
      bottomVoltage.className = `voltage-value text-lg font-bold ${data.bottom > 0 ? 'text-red-600' : 'text-blue-600'}`;
    }

    // Update real-time data cards (convert to mV for display)
    const voltageDiff = document.getElementById('voltage-diff');
    const fieldDirection = document.getElementById('field-direction');

    if (voltageDiff) {
      voltageDiff.textContent = `${data.difference > 0 ? '+' : ''}${(data.difference * 1000).toFixed(1)}mV`;
      voltageDiff.className = `value text-2xl font-bold ${data.difference > 0 ? 'text-electric-blue' : 'text-red-600'}`;
    }

    if (fieldDirection) {
      fieldDirection.textContent = data.direction;
      const isUpward = data.direction === Utils.Language.t('experiment.upward');
      fieldDirection.className = `value text-2xl font-bold ${isUpward ? 'text-plasma-purple' : 'text-orange-600'}`;
    }

    // Add animation effect to updated values
    this.animateValueChange([voltageDiff, fieldDirection, topVoltage, bottomVoltage]);
  }

  animateValueChange(elements) {
    elements.forEach(element => {
      if (element) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.3s ease';

        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 300);
      }
    });
  }

  updateDataVisualization() {
    // Update the data visualization module if available
    if (window.dataVisualization) {
      const state = this.isFlipped ? 'upsideDown' : 'upright';
      const data = this.voltageData[state];

      window.dataVisualization.updateRealTimeData(
        data.difference,
        data.difference / 1000000 * 1000000, // Convert to µA
        data.direction
      );
    }
  }

  startIonAnimation() {
    // The ion animation is handled by CSS, but we can add dynamic effects here
    const ions = document.querySelectorAll('.ion');

    ions.forEach((ion) => {
      // Add slight random variations to the animation
      const delay = Math.random() * 2;
      const duration = 3 + Math.random() * 2;

      ion.style.animationDelay = `${delay}s`;
      ion.style.animationDuration = `${duration}s`;
    });
  }

  // Method to simulate realistic voltage fluctuations
  addVoltageFluctuations() {
    setInterval(() => {
      const state = this.isFlipped ? 'upsideDown' : 'upright';
      const baseData = this.voltageData[state];

      // Add small random fluctuations (±1%)
      const fluctuation = (Math.random() - 0.5) * 0.02;
      const newDifference = baseData.difference + fluctuation;

      // Update display with fluctuations (convert to mV)
      const voltageDiff = document.getElementById('voltage-diff');
      if (voltageDiff) {
        voltageDiff.textContent = `${newDifference > 0 ? '+' : ''}${(newDifference * 1000).toFixed(3)}mV`;
      }
    }, 2000); // Update every 2 seconds
  }

  // Method to get current experiment state
  getCurrentState() {
    return {
      isFlipped: this.isFlipped,
      voltage: this.voltageData[this.isFlipped ? 'upsideDown' : 'upright']
    };
  }

  // Method to reset simulation to initial state
  reset() {
    this.isFlipped = false;
    const batteryContainer = document.getElementById('battery-container');
    if (batteryContainer) {
      batteryContainer.classList.remove('flipped');
    }
    this.updateDisplayValues('upright');
    this.updateButtonStates();
  }

  destroy() {
    // Clean up any intervals or event listeners if needed
    const uprightBtn = document.getElementById('flip-upright');
    const upsideDownBtn = document.getElementById('flip-upside-down');

    if (uprightBtn) {
      uprightBtn.removeEventListener('click', this.flipToUpright);
    }

    if (upsideDownBtn) {
      upsideDownBtn.removeEventListener('click', this.flipToUpsideDown);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.experimentSimulation = new ExperimentSimulation();

  // Start voltage fluctuations after a short delay
  setTimeout(() => {
    window.experimentSimulation.addVoltageFluctuations();
  }, 2000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExperimentSimulation;
}
