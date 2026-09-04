/**
 * FarmPulse - Alerts Engine
 * Analyzes weather and farm data to generate contextual advisories.
 */

export class AlertsEngine {
  /**
   * Generates alerts based on current weather and forecast
   * @param {Object} weatherData - Processed data from WeatherAPI
   * @param {Object} farmData - User's farm data (crop, soil, etc)
   * @returns {Array} List of alert objects
   */
  static generateAlerts(weatherData, farmData) {
    const alerts = [];
    const current = weatherData.current;
    const forecast = weatherData.forecast;
    
    // 1. High Temperature Alert (Danger/Warning)
    if (current.temperature >= 38) {
      alerts.push({
        id: 'extreme_heat',
        type: 'danger',
        title: 'Extreme Heat Warning',
        message: `Temperature has reached ${current.temperature}°C. Protect sensitive crops during afternoon hours.`,
        icon: '🔴'
      });
    } else if (current.temperature >= 34) {
      alerts.push({
        id: 'high_heat',
        type: 'warning',
        title: 'High Temperature',
        message: `High afternoon temperatures (${current.temperature}°C) expected. Monitor crop wilting.`,
        icon: '🟡'
      });
    }
    
    // 2. Heavy Rain Alert (Danger/Warning)
    const tomorrow = forecast[1];
    if (tomorrow && tomorrow.precipSum > 20) {
      alerts.push({
        id: 'heavy_rain',
        type: 'warning',
        title: 'Heavy Rainfall Expected',
        message: `${tomorrow.precipSum}mm of rain expected tomorrow. Ensure proper field drainage to prevent waterlogging.`,
        icon: '🟡'
      });
    }
    
    // 3. Soil Moisture Alerts (Warning)
    if (current.soilMoisture < 30) {
      alerts.push({
        id: 'low_moisture',
        type: 'warning',
        title: 'Low Soil Moisture',
        message: 'Topsoil moisture is critically low. Immediate irrigation recommended if rainfall is not expected.',
        icon: '🟡'
      });
    }

    // 4. Good Conditions (Success)
    // If no danger or warnings, output a good status
    if (alerts.length === 0) {
      if (tomorrow && tomorrow.precipProb > 40 && tomorrow.precipSum < 15) {
        alerts.push({
          id: 'optimal_rain',
          type: 'success',
          title: 'Favorable Rainfall',
          message: 'Moderate rainfall expected within the next few days. Good for crop growth.',
          icon: '🟢'
        });
      } else {
        alerts.push({
          id: 'all_clear',
          type: 'success',
          title: 'Conditions Good',
          message: 'Weather and soil parameters are within optimal ranges for general farming activities.',
          icon: '🟢'
        });
      }
    }

    return alerts;
  }
}
