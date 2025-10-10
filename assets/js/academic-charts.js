/**
 * Academic Charts for Academic Recognition Section
 * Handles download trends, response analysis, and other academic metrics
 */

class AcademicCharts {
  constructor() {
    this.charts = {};
    this.chartData = {};
    this.init();
  }

  init() {
    this.generateChartData();
    this.setupIntersectionObserver();
  }

  generateChartData() {
    // Download trend data (50 days)
    this.chartData.downloadTrend = {
      labels: [],
      downloads: [],
      cumulative: []
    };

    // Generate 50 days of data
    let cumulativeDownloads = 0;
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (49 - i));
      this.chartData.downloadTrend.labels.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));

      // Simulate increasing interest with some randomness
      const dailyDownloads = Math.floor(Math.random() * 5) + Math.floor(i / 10) + 1;
      cumulativeDownloads += dailyDownloads;

      this.chartData.downloadTrend.downloads.push(dailyDownloads);
      this.chartData.downloadTrend.cumulative.push(cumulativeDownloads);
    }

    // Response distribution data
    const isZh = Utils.Language.isZh();
    this.chartData.responseDistribution = {
      labels: isZh 
        ? ['正面回應', '建設性質疑', '挑戰反駁', '無回應']
        : ['Positive Response', 'Constructive Inquiry', 'Challenge & Rebuttal', 'No Response'],
      data: [23, 67, 37, 4873],
      colors: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
    };

    // Geographic distribution
    this.chartData.geographicDistribution = {
      labels: isZh 
        ? ['亞洲', '歐洲', '北美', '其他']
        : ['Asia', 'Europe', 'North America', 'Others'],
      data: [45, 30, 20, 5],
      colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#84cc16']
    };
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chartId = entry.target.id;
          if (chartId && !this.charts[chartId]) {
            this.createChart(chartId);
          }
        }
      });
    }, options);

    // Observe chart containers
    const chartContainers = [
      // Removed download-trend-chart as it's now handled by paper-downloads.js
    ];

    chartContainers.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });
  }

  createChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas || typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded or canvas not found');
      return;
    }

    // Note: ctx variable removed as no charts are currently implemented
    // const ctx = canvas.getContext('2d');

    switch (chartId) {
      // Removed download-trend-chart as it's now handled by paper-downloads.js
      default:
        console.warn('Unknown chart ID:', chartId);
    }
  }

  // Note: createDownloadTrendChart method removed as download tracking
  // is now handled by the paper-downloads.js module with real viXra data

  // Create simple chart using canvas without Chart.js (fallback)
  createSimpleChart(canvasId, data, type = 'line') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {return;}

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (type === 'line' && data.downloads) {
      this.drawLineChart(ctx, data.downloads.slice(-30), rect.width, rect.height);
    }
  }

  drawLineChart(ctx, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw data line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#10b981';
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    const chartTitle = Utils.Language.isZh() ? '下載趨勢' : 'Download Trend';
    ctx.fillText(chartTitle, width / 2, 20);
  }

  // Update charts with new data
  updateChartData(chartId, newData) {
    if (this.charts[chartId]) {
      this.charts[chartId].data = newData;
      this.charts[chartId].update();
    }
  }

  // Get chart statistics
  getDownloadStats() {
    const downloads = this.chartData.downloadTrend.downloads;
    const total = downloads.reduce((sum, val) => sum + val, 0);
    const avg = total / downloads.length;
    const recent7Days = downloads.slice(-7).reduce((sum, val) => sum + val, 0);

    return {
      total,
      average: Math.round(avg),
      recent7Days,
      trend: recent7Days > avg * 7 ? 'increasing' : 'stable'
    };
  }

  // Destroy all charts
  destroyCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}

// Initialize academic charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded, using fallback charts');
  }

  const academicCharts = new AcademicCharts();

  // Make it globally accessible
  window.academicCharts = academicCharts;
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AcademicCharts;
}
