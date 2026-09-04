/**
 * FarmPulse - Calculator Engine
 * Handles farm profit estimation and chart rendering.
 */

class CalculatorEngine {
  /**
   * Calculates profit metrics
   * @param {Object} inputs { area, yieldRate, price, costs: { seed, fertilizer, labor, irrigation, other } }
   * @returns {Object} { revenue, totalCost, profit, roi, costsList }
   */
  calculateProfit(inputs) {
    const { area, yieldRate, price, costs } = inputs;
    
    // Total Production
    const totalYield = area * yieldRate;
    
    // Estimated Revenue
    const revenue = totalYield * price;
    
    // Calculate total costs
    let totalCost = 0;
    const costsList = [];
    
    for (const [key, value] of Object.entries(costs)) {
      const val = parseFloat(value) || 0;
      totalCost += val;
      costsList.push({ name: this.formatCostName(key), value: val });
    }
    
    // Profit
    const profit = revenue - totalCost;
    
    // ROI %
    let roi = 0;
    if (totalCost > 0) {
      roi = (profit / totalCost) * 100;
    }
    
    return {
      revenue,
      totalCost,
      profit,
      roi,
      costsList,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0
    };
  }
  
  formatCostName(key) {
    const names = {
      seed: 'Seed Cost',
      fertilizer: 'Fertilizer & Pesticides',
      labor: 'Labor',
      irrigation: 'Irrigation',
      other: 'Other Expenses'
    };
    return names[key] || key;
  }
  
  /**
   * Generates SVG code for a simple comparison bar chart
   */
  generateChartSVG(revenue, cost, profit) {
    const maxVal = Math.max(revenue, cost) * 1.1; // add 10% headroom
    if (maxVal === 0) return '';
    
    const revHeight = Math.max(10, (revenue / maxVal) * 200);
    const costHeight = Math.max(10, (cost / maxVal) * 200);
    const profitHeight = Math.max(10, (Math.abs(profit) / maxVal) * 200);
    
    const profitColor = profit >= 0 ? '#10b981' : '#ef4444'; // Success green or Danger red
    
    return `
      <svg width="100%" height="250" viewBox="0 0 300 250" style="font-family: var(--font-family-base)">
        <!-- Grid lines -->
        <line x1="40" y1="20" x2="300" y2="20" stroke="#e5e7eb" stroke-dasharray="4"/>
        <line x1="40" y1="120" x2="300" y2="120" stroke="#e5e7eb" stroke-dasharray="4"/>
        <line x1="40" y1="220" x2="300" y2="220" stroke="#9ca3af"/>
        
        <!-- Y-Axis labels (rough estimates for visuals) -->
        <text x="35" y="25" text-anchor="end" font-size="10" fill="#6c757d">Max</text>
        <text x="35" y="125" text-anchor="end" font-size="10" fill="#6c757d">Mid</text>
        <text x="35" y="225" text-anchor="end" font-size="10" fill="#6c757d">0</text>
        
        <!-- Cost Bar -->
        <rect x="70" y="${220 - costHeight}" width="50" height="${costHeight}" fill="#f59e0b" rx="4"/>
        <text x="95" y="240" text-anchor="middle" font-size="12" font-weight="600" fill="#4b5563">Cost</text>
        
        <!-- Revenue Bar -->
        <rect x="150" y="${220 - revHeight}" width="50" height="${revHeight}" fill="#3b82f6" rx="4"/>
        <text x="175" y="240" text-anchor="middle" font-size="12" font-weight="600" fill="#4b5563">Revenue</text>
        
        <!-- Profit Bar -->
        <rect x="230" y="${220 - profitHeight}" width="50" height="${profitHeight}" fill="${profitColor}" rx="4"/>
        <text x="255" y="240" text-anchor="middle" font-size="12" font-weight="600" fill="#4b5563">${profit >= 0 ? 'Profit' : 'Loss'}</text>
      </svg>
    `;
  }
}

export const calcEngine = new CalculatorEngine();
